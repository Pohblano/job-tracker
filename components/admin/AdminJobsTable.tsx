// Admin jobs table for SVB; supports filtering and inline status/progress updates with optimistic feedback.
'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createJobAction, updateJobProgressAction, updateJobStatusAction } from '@/app/admin/actions'
import { JobForm, type JobFormData } from '@/components/admin/JobForm'
import { StatusPill } from '@/components/ui/StatusPill'
import { type Job, type JobStatus } from '@/lib/jobs/types'

interface AdminJobsTableProps {
  initialJobs: Job[]
  fetchError?: string
}

type Filter = 'ALL' | 'IN_PROGRESS' | 'QUOTED' | 'RECEIVED'

const FILTER_OPTIONS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Quoted', value: 'QUOTED' },
  { label: 'Received', value: 'RECEIVED' },
]

const STATUS_FLOW: JobStatus[] = ['RECEIVED', 'QUOTED', 'IN_PROGRESS', 'COMPLETED']

function nextStatus(status: JobStatus): JobStatus | null {
  const idx = STATUS_FLOW.indexOf(status)
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null
  return STATUS_FLOW[idx + 1]
}

function formatProgress(job: Job) {
  return `${job.pieces_completed} / ${job.total_pieces}`
}

function NewJobDialog({
  open,
  submitting,
  serverError,
  onClose,
  onSubmit,
}: {
  open: boolean
  submitting: boolean
  serverError?: string | null
  onClose: () => void
  onSubmit: (values: JobFormData) => Promise<void>
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
      aria-label="Create job dialog backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create New Job</h2>
            <p className="text-sm text-gray-600">New jobs appear on the TV as soon as they are saved.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            aria-label="Close create job dialog"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">
          <JobForm submitting={submitting} serverError={serverError} onSubmit={onSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}

function AdminJobRow({
  job,
  onProgressUpdated,
  onStatusUpdated,
}: {
  job: Job
  onProgressUpdated: (id: string, piecesCompleted: number, totalPieces: number) => void
  onStatusUpdated: (id: string, status: JobStatus) => void
}) {
  const router = useRouter()
  const [isEditingProgress, setIsEditingProgress] = useState(false)
  const [piecesCompleted, setPiecesCompleted] = useState(job.pieces_completed)
  const [totalPieces, setTotalPieces] = useState(job.total_pieces)
  const [rowError, setRowError] = useState<string | null>(null)
  const [statusPending, startStatusTransition] = useTransition()
  const [progressPending, startProgressTransition] = useTransition()

  useEffect(() => {
    setPiecesCompleted(job.pieces_completed)
    setTotalPieces(job.total_pieces)
  }, [job.pieces_completed, job.total_pieces])

  const handleStatusAdvance = (target: JobStatus) => {
    startStatusTransition(async () => {
      setRowError(null)
      const result = await updateJobStatusAction(job.id, target)
      if (result?.error) {
        setRowError(result.error)
        return
      }
      onStatusUpdated(job.id, target)
      router.refresh()
    })
  }

  const handleProgressSave = () => {
    startProgressTransition(async () => {
      setRowError(null)
      const result = await updateJobProgressAction(job.id, piecesCompleted, totalPieces)
      if (result?.error) {
        setRowError(result.error)
        return
      }
      onProgressUpdated(job.id, piecesCompleted, totalPieces)
      setIsEditingProgress(false)
      router.refresh()
    })
  }

  const canAdvance = nextStatus(job.status)

  return (
    <>
      <tr className="border-b border-gray-200 bg-white hover:bg-gray-50">
        <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-semibold text-gray-900">{job.job_number}</td>
        <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-semibold text-gray-900">{job.part_number}</td>
        <td className="px-4 py-3">
          <StatusPill status={job.status} size="sm" />
        </td>
        <td className="px-4 py-3 text-center text-sm text-gray-800">
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono">{formatProgress(job)}</span>
            <button
              type="button"
              className="text-xs font-medium text-blue-700 hover:text-blue-900"
              onClick={() => setIsEditingProgress((prev) => !prev)}
            >
              {isEditingProgress ? 'Close' : 'Edit'}
            </button>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-800">{job.eta_text ?? '—'}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            {canAdvance && (
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleStatusAdvance(canAdvance)}
                disabled={statusPending}
              >
                Advance to {canAdvance.replace('_', ' ')}
              </button>
            )}
            {job.status !== 'COMPLETED' && (
              <button
                type="button"
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleStatusAdvance('COMPLETED')}
                disabled={statusPending}
              >
                Mark Done ✓
              </button>
            )}
          </div>
        </td>
      </tr>
      {isEditingProgress && (
        <tr className="border-b border-gray-200 bg-gray-50">
          <td className="px-4 py-3 text-sm text-gray-700" colSpan={6}>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Pieces Completed</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={piecesCompleted}
                  onChange={(e) => setPiecesCompleted(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Total Pieces</label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={totalPieces}
                  onChange={(e) => setTotalPieces(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleProgressSave}
                  disabled={progressPending}
                >
                  {progressPending ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsEditingProgress(false)}
                >
                  Cancel
                </button>
                <span className="text-xs text-gray-500">Validation enforces completed ≤ total.</span>
              </div>
            </div>
          </td>
        </tr>
      )}
      {rowError && (
        <tr className="border-b border-amber-200 bg-amber-50">
          <td className="px-4 py-2 text-sm text-amber-800" colSpan={6}>
            {rowError}
          </td>
        </tr>
      )}
    </>
  )
}

export function AdminJobsTable({ initialJobs, fetchError }: AdminJobsTableProps) {
  const router = useRouter()
  const [jobs, setJobs] = useState(initialJobs)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creationError, setCreationError] = useState<string | null>(null)
  const [creationNotice, setCreationNotice] = useState<string | null>(null)
  const [creating, startCreateTransition] = useTransition()

  const filteredJobs = useMemo(() => {
    if (filter === 'ALL') return jobs
    return jobs.filter((job) => job.status === filter)
  }, [filter, jobs])

  const handleProgressUpdated = (id: string, piecesCompleted: number, totalPieces: number) => {
    setJobs((current) =>
      current.map((job) =>
        job.id === id ? { ...job, pieces_completed: piecesCompleted, total_pieces: totalPieces } : job,
      ),
    )
  }

  const handleStatusUpdated = (id: string, status: JobStatus) => {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, status } : job)))
  }

  const handleCreateJob = async (values: JobFormData) => {
    setCreationError(null)
    setCreationNotice(null)

    startCreateTransition(async () => {
      const result = await createJobAction(values)
      if (result?.error) {
        setCreationError(result.error)
        return
      }

      const newJob = result?.job
      if (!newJob) {
        setCreationError('Job was created but no data was returned.')
        return
      }

      setJobs((current) => [newJob, ...current])
      setIsCreateOpen(false)
      setCreationNotice(`Job ${newJob.job_number} created and sent to the TV.`)
      router.refresh()
    })
  }

  return (
    <>
      <NewJobDialog
        open={isCreateOpen}
        submitting={creating}
        serverError={creationError}
        onClose={() => {
          setIsCreateOpen(false)
          setCreationError(null)
        }}
        onSubmit={handleCreateJob}
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === option.value
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCreationError(null)
                setIsCreateOpen(true)
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={creating}
            >
              + New Job
            </button>
            <div className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
        </div>

        {creationNotice && (
          <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
            {creationNotice}
          </div>
        )}

        {fetchError ? (
          <div className="px-5 py-4 text-sm text-red-700">Unable to load jobs: {fetchError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Job #
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Part #
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Progress
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    ETA
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-600">
                      No jobs found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <AdminJobRow
                      key={job.id}
                      job={job}
                      onProgressUpdated={handleProgressUpdated}
                      onStatusUpdated={handleStatusUpdated}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
