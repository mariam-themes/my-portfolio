import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin dashboard is English-only and lives outside the locale prefix.
  if (pathname.startsWith('/admin')) {
    const sessionToken =
      request.cookies.get('next-auth.session-token') ||
      request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  // Public routes: negotiate the locale and redirect `/` → `/{locale}`.
  return handleI18nRouting(request);
}

export const config = {
  // Run on public pages (locale negotiation) and /admin (auth guard).
  // Excluded: API routes, login page, internal paths and static assets.
  matcher: ['/((?!api|login|_next|_vercel|.*\\..*).*)'],
};