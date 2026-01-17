// Middleware for SVB admin routes; applies basic auth guard before reaching the admin UI or server actions.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_AUTH_REALM, getAdminCredentials, isBasicAuthValid } from '@/lib/auth'

function unauthorizedResponse() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${ADMIN_AUTH_REALM}"`,
    },
  })
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const credentials = getAdminCredentials()
  if ('error' in credentials) {
    console.error(credentials.error)
    return new NextResponse('Admin auth is not configured on the server', { status: 500 })
  }

  const authorized = isBasicAuthValid(request.headers.get('authorization'), credentials)
  if (!authorized) {
    return unauthorizedResponse()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
