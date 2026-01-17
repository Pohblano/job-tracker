// Browser Supabase client for SVB; powers realtime subscriptions on the TV view.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { type Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !anonKey) {
  throw new Error('Supabase environment variables are missing for the browser client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

let browserClient: ReturnType<typeof createClient<Database>> | null = null
let typedBrowserClient: SupabaseClient<Database> | null = null

export function createBrowserSupabaseClient() {
  if (typedBrowserClient) return typedBrowserClient

  if (typeof window === 'undefined') {
    throw new Error('createBrowserSupabaseClient should only be used in client components.')
  }

  browserClient = createClient(supabaseUrl!, anonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-application-name': 'svb-client',
      },
    },
  })

  typedBrowserClient = browserClient as SupabaseClient<Database>
  return typedBrowserClient
}
