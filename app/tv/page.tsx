// Public TV page - Shop Visibility Board
import React from 'react'
import { JobsBoard } from '@/components/tv/JobsBoard'
import { TVHeader } from '@/components/tv/TVHeader'
import { fetchJobs } from '@/lib/jobs/queries'

export const revalidate = 0

export default async function TVPage() {
  const { jobs, error } = await fetchJobs()
  const fetchedAt = new Date().toISOString()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto min-h-screen max-w-7xl px-4 pb-0 pt-6 sm:px-6 sm:py-8 lg:px-8">
        <TVHeader />
        <JobsBoard initialJobs={jobs} initialFetchedAt={fetchedAt} initialError={error} />
      </div>
    </main>
  )
}
