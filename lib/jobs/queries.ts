// Job query utilities for SVB; centralizes server-side fetch for the TV display.
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { prepareJobsForDisplay } from './presentation'
import { type Job } from './types'

export interface FetchJobsResult {
  jobs: Job[]
  error?: string
}

export interface FetchAdminJobsResult {
  jobs: Job[]
  error?: string
}

export async function fetchJobs(): Promise<FetchJobsResult> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('jobs').select('*')

    if (error) {
      console.error('Failed to fetch jobs for TV', error)
      return { jobs: [], error: 'Unable to load jobs right now' }
    }

    return { jobs: prepareJobsForDisplay(data ?? []) }
  } catch (err) {
    console.error('Unexpected error while fetching jobs for TV', err)
    return { jobs: [], error: 'Unable to load jobs right now' }
  }
}

export async function fetchAdminJobs(): Promise<FetchAdminJobsResult> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('jobs').select('*').order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch jobs for admin', error)
      return { jobs: [], error: 'Unable to load jobs right now' }
    }

    return { jobs: data ?? [] }
  } catch (err) {
    console.error('Unexpected error while fetching jobs for admin', err)
    return { jobs: [], error: 'Unable to load jobs right now' }
  }
}
