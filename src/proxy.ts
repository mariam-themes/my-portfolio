import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

// Admin-only API paths. Public read/write endpoints (e.g. /api/inquiries for
// the contact form, /api/projects for the public site) stay open.
const ADMIN_API_PATHS = [
  '/api/admin',
  '/api/upload',
  '/api/setup',
  '/api/seed',
];

// Content that is publicly readable but only writable by an admin.
const CONTENT_PATHS = ['/api/blogs', '/api/testimonials', '/api/section-layout'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin API routes: require a valid session token.
  if (ADMIN_API_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Content APIs: GET is open for the public site, all other methods need auth.
  if (CONTENT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (request.method === 'GET') {
      return NextResponse.next();
    }
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Admin dashboard: auth guard + cookie-based language (kept outside the
  // locale prefix). We stamp `x-next-intl-locale` so next-intl and RTL work.
  if (pathname.startsWith('/admin')) {
    const sessionToken =
      request.cookies.get('next-auth.session-token') ||
      request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const adminLocale = request.cookies.get('admin_lang')?.value === 'ar' ? 'ar' : 'en';
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-next-intl-locale', adminLocale);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Public routes: negotiate the locale and redirect `/` → `/{locale}`.
  return handleI18nRouting(request);
}

export const config = {
  // Run on public pages (locale negotiation), /admin (auth guard + admin
  // locale) and the admin-only APIs (session token check).
  matcher: [
    '/((?!api|login|blog|testimonials|_next|_vercel|.*\\..*).*)',
    '/api/admin/:path*',
    '/api/upload',
    '/api/blogs/:path*',
    '/api/testimonials/:path*',
    '/api/section-layout/:path*',
    '/api/setup',
    '/api/seed',
  ],
};