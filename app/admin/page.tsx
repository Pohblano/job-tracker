// Admin jobs list page - Job Management interface
import React from 'react'
import Link from 'next/link'
import { AdminJobsTable } from '@/components/admin/AdminJobsTable'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { fetchAdminJobs } from '@/lib/jobs/queries'
import { Button } from '@/components/ui/button'

export const revalidate = 0

export default async function AdminPage() {
  const { jobs, error } = await fetchAdminJobs()

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage production jobs and update progress
            </p>
          </div>
          <LogoutButton />
        </div>

        <AdminJobsTable initialJobs={jobs} fetchError={error} />

        {/* Quick Tips */}
        <div className="mt-8 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
          <span className="text-gray-400">💡</span>
          <div>
            <p className="font-medium text-gray-900">Quick Tips</p>
            <p className="text-sm text-muted-foreground">
              Click progress to edit inline. Setting progress to 100% automatically marks jobs as complete.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
