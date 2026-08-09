import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if we are trying to access the dashboard
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Check for a NextAuth session cookie
    const sessionToken = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Protect all /admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
