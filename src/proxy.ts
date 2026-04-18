import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // No token, redirect to home page to avoid exposing the admin route
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
  }

  // 2. Prevent logged in users from seeing portal login again
  if (pathname.startsWith('/portal')) {
    if (token) {
      // Token exists, redirect to admin
      const url = new URL('/admin', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
};
