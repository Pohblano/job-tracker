// Admin jobs list page for SVB; surfaces inline status and progress updates with validation.
import React from 'react'
import { AdminJobsTable } from '@/components/admin/AdminJobsTable'
import { fetchAdminJobs } from '@/lib/jobs/queries'

export const revalidate = 0

export default async function AdminPage() {
  const { jobs, error } = await fetchAdminJobs()

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-sm text-gray-600">Update status and progress inline; changes reflect on the TV immediately.</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-600">
            Admin view — authenticated users only
          </div>
        </div>

        <AdminJobsTable initialJobs={jobs} fetchError={error} />
      </div>
    </main>
  )
}
