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
];

// Fully public API paths — always pass through with no auth check.
const PUBLIC_API_PATHS = ['/api/section-layout', '/api/projects', '/api/inquiries'];

// Content that is publicly readable but only writable by an admin.
const CONTRIB_PATHS = ['/api/blogs'];

// Publicly readable site content that is only mutable by an admin.
const ADMIN_WRITE_PATHS = ['/api/about-me', '/api/global-settings'];

// Testimonials: publicly readable (GET) and publicly submittable (POST → a
// pending review). Mutations (PUT/DELETE) still require an admin token.
const TESTIMONIALS_PATH = '/api/testimonials';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fully public APIs: pass through with no auth check at all.
  if (PUBLIC_API_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Protect admin API routes: require a valid session token.
  if (ADMIN_API_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Testimonials: GET (read) and POST (public review submission) are open.
  // PUT/DELETE (approve/delete) require an admin token. Covers both the
  // collection path and sub-paths like /api/testimonials/:id.
  if (pathname === TESTIMONIALS_PATH || pathname.startsWith(`${TESTIMONIALS_PATH}/`)) {
    if (request.method === 'GET' || request.method === 'POST') {
      return NextResponse.next();
    }
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Content APIs (e.g. blogs): GET is open for the public site, all other
  // methods need auth.
  if (CONTRIB_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (request.method === 'GET') {
      return NextResponse.next();
    }
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Site content settings: GET is public; mutations (PUT/POST/DELETE) require
  // an admin token. Enforced authoritatively in the route handlers as well.
  if (ADMIN_WRITE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
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
    '/((?!api|login|_next|_vercel|.*\\..*).*)',
    '/api/admin/:path*',
    '/api/upload',
    '/api/blogs/:path*',
    '/api/testimonials/:path*',
    '/api/section-layout/:path*',
    '/api/about-me',
    '/api/global-settings',
  ],
};