// Server-side Supabase clients for SVB; exposes anon reads and a service-role-only client for authenticated admin mutations.
import { createClient } from '@supabase/supabase-js'
import { type Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let serverClient: ReturnType<typeof createClient<Database>> | null = null
let serviceRoleClient: ReturnType<typeof createClient<Database>> | null = null

function getRequiredKey() {
  const key = serviceRoleKey || anonKey
  if (!key) {
    throw new Error('Supabase key is missing. Add NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.')
  }
  return key
}

function getRequiredUrl() {
  if (!supabaseUrl) {
    throw new Error('Supabase URL is missing. Add NEXT_PUBLIC_SUPABASE_URL to the environment.')
  }
  return supabaseUrl
}

function getServiceRoleKey() {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin mutations. Add it to the environment.')
  }
  return serviceRoleKey
}

export function createServerSupabaseClient() {
  if (serverClient) return serverClient

  serverClient = createClient<Database>(getRequiredUrl(), getRequiredKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-application-name': 'svb-server',
      },
    },
  })

  return serverClient
}

export function createServiceRoleSupabaseClient() {
  if (serviceRoleClient) return serviceRoleClient

  serviceRoleClient = createClient<Database>(getRequiredUrl(), getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-application-name': 'svb-service-role',
      },
    },
  })

  return serviceRoleClient
}
