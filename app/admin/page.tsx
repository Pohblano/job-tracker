// Admin jobs list page - Job Management interface
import React from 'react'
import Image from 'next/image'
import { AdminJobsTable } from '@/components/admin/AdminJobsTable'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { fetchAdminJobs } from '@/lib/jobs/queries'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { jobs, error } = await fetchAdminJobs()

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-0 pt-6 sm:px-6 sm:pb-20 sm:pt-8 md:pb-24 lg:px-8 lg:pt-10">
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
          <div className="flex items-start gap-3">
            <Image
              src="/valar-square.avif"
              alt="Valar Square logo"
              width={96}
              height={96}
              priority
              className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12 lg:h-14 lg:w-14"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Job Management</h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Manage production jobs and update progress
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
        <AdminJobsTable initialJobs={jobs} fetchError={error} />
      </div>
    </main>
  )
}
