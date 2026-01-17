// Admin authentication helpers for SVB; supports both basic auth and session-based auth.
import { cookies, headers } from 'next/headers'

interface AdminCredentials {
  username: string
  password: string
}

interface AdminAuthResult {
  success: boolean
  error?: string
}

export const ADMIN_AUTH_REALM = 'SVB Admin'
const SESSION_COOKIE_NAME = 'admin_session'

export function getAdminCredentials(): AdminCredentials | { error: string } {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    return { error: 'Admin credentials are missing. Set ADMIN_USERNAME and ADMIN_PASSWORD.' }
  }

  return { username, password }
}

export function isBasicAuthValid(authHeader: string | null, credentials: AdminCredentials) {
  if (!authHeader) return false
  const [scheme, encoded] = authHeader.split(' ')
  if (scheme !== 'Basic' || !encoded) return false

  try {
    const decoded = atob(encoded)
    const separatorIndex = decoded.indexOf(':')
    const user = decoded.slice(0, separatorIndex)
    const pass = decoded.slice(separatorIndex + 1)
    return user === credentials.username && pass === credentials.password
  } catch (error) {
    console.error('Failed to parse basic auth header', error)
    return false
  }
}

export function hasValidSession(): boolean {
  const session = cookies().get(SESSION_COOKIE_NAME)
  return !!session?.value
}

export function ensureAdminRequest(): AdminAuthResult {
  // First check for session cookie (primary auth method)
  if (hasValidSession()) {
    return { success: true }
  }

  // Fallback to basic auth (for API access)
  const credentials = getAdminCredentials()
  if ('error' in credentials) {
    return { success: false, error: credentials.error }
  }

  const authorized = isBasicAuthValid(headers().get('authorization'), credentials)
  if (!authorized) {
    return { success: false, error: 'Unauthorized admin request' }
  }

  return { success: true }
}
