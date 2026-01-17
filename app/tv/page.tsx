// Public TV page for SVB; server-renders initial jobs then hands off to the realtime-aware client table.
import React from 'react'
import { JobsTable } from '@/components/tv/JobsTable'
import { TVHeader } from '@/components/tv/TVHeader'
import { fetchJobs } from '@/lib/jobs/queries'

export const revalidate = 0 // Always render fresh data; realtime handles subsequent updates.

export default async function TVPage() {
  const { jobs, error } = await fetchJobs()
  const fetchedAt = new Date().toISOString()

  return (
    <main className="min-h-screen bg-tv-background text-tv-text">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-10 py-10">
        <TVHeader />
        <JobsTable initialJobs={jobs} initialFetchedAt={fetchedAt} initialError={error} />
      </div>
    </main>
  )
}
