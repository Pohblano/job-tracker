// Middleware for SVB admin routes; checks session cookie for authentication
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'admin_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page access
  if (pathname === '/login') {
    // If already authenticated, redirect to admin
    const session = request.cookies.get(SESSION_COOKIE_NAME)
    if (session?.value) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // Check admin routes
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(SESSION_COOKIE_NAME)

    if (!session?.value) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
