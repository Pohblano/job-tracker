// Server actions for login/logout with cookie-based sessions
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminCredentials } from '@/lib/auth'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function loginAction(username: string, password: string) {
  const credentials = getAdminCredentials()

  if ('error' in credentials) {
    return { error: credentials.error }
  }

  if (username !== credentials.username || password !== credentials.password) {
    return { error: 'Invalid username or password' }
  }

  // Create session token
  const token = generateSessionToken()

  // Store session in cookie
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return { success: true }
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE_NAME)
  redirect('/login')
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  return token ? { authenticated: true } : { authenticated: false }
}
