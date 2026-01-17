// Admin authentication helpers for SVB; enforces basic auth across middleware and server actions.
import { headers } from 'next/headers'

interface AdminCredentials {
  username: string
  password: string
}

interface AdminAuthResult {
  success: boolean
  error?: string
}

export const ADMIN_AUTH_REALM = 'SVB Admin'

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

export function ensureAdminRequest(): AdminAuthResult {
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
