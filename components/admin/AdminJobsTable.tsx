// Admin jobs table for SVB; aligns with admin mockups including inline progress updates and full edit modal.
'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { createJobAction, updateJobStatusAction, deleteJobAction } from '@/app/admin/actions'
import { EditJobModal } from '@/components/admin/EditJobModal'
import { InlineProgressUpdate } from '@/components/admin/InlineProgressUpdate'
import { JobForm, type JobFormData } from '@/components/admin/JobForm'
import { type Job, type JobStatus } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLogger } from '@/components/ui/use-logger'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AdminJobsTableProps {
  initialJobs: Job[]
  fetchError?: string
}

const STATUS_OPTIONS: { label: string; value: JobStatus }[] = [
  { label: 'Received', value: 'RECEIVED' },
  { label: 'Quoted', value: 'QUOTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Completed', value: 'COMPLETED' },
]

const STATUS_TRIGGER_STYLES: Record<JobStatus, string> = {
  RECEIVED: 'border-gray-200 bg-gray-50 text-gray-800',
  QUOTED: 'border-blue-200 bg-blue-50 text-blue-800',
  IN_PROGRESS: 'border-green-200 bg-green-50 text-green-800',
  PAUSED: 'border-amber-200 bg-amber-50 text-amber-800',
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

const STATUS_DOT_STYLES: Record<JobStatus, string> = {
  RECEIVED: 'bg-gray-500',
  QUOTED: 'bg-blue-600',
  IN_PROGRESS: 'bg-green-600',
  PAUSED: 'bg-amber-600',
  COMPLETED: 'bg-emerald-600',
}

const STATUS_OPTION_STYLES: Record<JobStatus, string> = {
  RECEIVED: 'data-[state=checked]:bg-gray-50 data-[state=checked]:text-gray-900',
  QUOTED: 'data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900',
  IN_PROGRESS: 'data-[state=checked]:bg-green-50 data-[state=checked]:text-green-900',
  PAUSED: 'data-[state=checked]:bg-amber-50 data-[state=checked]:text-amber-900',
  COMPLETED: 'data-[state=checked]:bg-emerald-50 data-[state=checked]:text-emerald-900',
}

function getStatusLabel(status: JobStatus): string {
  const option = STATUS_OPTIONS.find(o => o.value === status)
  return option?.label || status.replace('_', ' ')
}

function formatUpdatedTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function AdminJobRow({
  job,
  onProgressUpdated,
  onStatusUpdated,
  onDelete,
  onEdit,
}: {
  job: Job
  onProgressUpdated: (id: string, piecesCompleted: number) => void
  onStatusUpdated: (id: string, status: JobStatus) => void
  onDelete: (id: string) => void
  onEdit: (job: Job) => void
}) {
  const router = useRouter()
  const logger = useLogger('AdminJobsTable')
  const [statusPending, startStatusTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleStatusChange = (newStatus: JobStatus) => {
    const previousStatus = job.status
    onStatusUpdated(job.id, newStatus)

    startStatusTransition(async () => {
      const result = await updateJobStatusAction(job.id, newStatus)
      if (result?.error) {
        onStatusUpdated(job.id, previousStatus)
        logger.error('Status update failed', { jobId: job.id, from: previousStatus, to: newStatus, error: result.error })
        return
      }
      if (result?.status) {
        logger.info('Status updated', { jobId: job.id, from: previousStatus, to: result.status })
      }
      router.refresh()
    })
  }

  const handleDelete = () => {
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteJobAction(job.id)
      if (result?.error) {
        setDeleteError(result.error)
        return
      }
      onDelete(job.id)
      setDeleteOpen(false)
      router.refresh()
    })
  }

  return (
    <TableRow className="hover:bg-gray-50">
      {/* Job Details */}
      <TableCell className="w-[280px] max-w-[320px] py-4">
        <div className="space-y-1">
          <div className="font-mono text-xs font-semibold text-muted-foreground">{job.part_number || '—'}</div>
          <div className="text-xl font-bold text-gray-900 leading-tight">{job.title || job.job_number}</div>
          <div className="text-sm text-muted-foreground line-clamp-2 min-h-[42px]">
            {job.description?.trim() || 'No description provided'}
          </div>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="w-[140px]">
        <Select
          value={job.status}
          onValueChange={(value) => handleStatusChange(value as JobStatus)}
          disabled={statusPending}
        >
          <SelectTrigger
            className={cn(
              'h-9 w-[160px] justify-between rounded-full px-4 text-sm font-semibold shadow-sm transition-colors focus:ring-2 focus:ring-offset-0',
              STATUS_TRIGGER_STYLES[job.status],
            )}
          >
            <span className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT_STYLES[job.status])} />
              {getStatusLabel(job.status)}
            </span>
          </SelectTrigger>
          <SelectContent className="rounded-lg border border-gray-200 shadow-lg">
            {STATUS_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-gray-800 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
                  STATUS_OPTION_STYLES[option.value],
                )}
              >
                <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT_STYLES[option.value])} />
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Progress */}
      <TableCell className="w-[220px]">
        <div className="flex flex-col gap-1">
          <InlineProgressUpdate
            jobId={job.id}
            completed={job.pieces_completed}
            total={job.total_pieces}
            onSaved={(value) => {
              onProgressUpdated(job.id, value)
              router.refresh()
            }}
          />
        </div>
      </TableCell>

      {/* ETA */}
      <TableCell className="w-[160px] max-w-[200px]">
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-gray-900">
            {job.eta_text || '—'}
          </div>
          <div className="text-xs text-muted-foreground">
            Updated {formatUpdatedTime(job.updated_at)}
          </div>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="w-[120px]">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-gray-900"
            onClick={() => onEdit(job)}
            disabled={deletePending}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={deletePending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete job?</DialogTitle>
            <DialogDescription>
              This will remove {job.job_number} ({job.part_number}) from the board. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteError}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deletePending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletePending}>
              {deletePending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TableRow>
  )
}

export function AdminJobsTable({ initialJobs, fetchError }: AdminJobsTableProps) {
  const router = useRouter()
  const [jobs, setJobs] = useState(initialJobs)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creationError, setCreationError] = useState<string | null>(null)
  const [creating, startCreateTransition] = useTransition()
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [broadcastChannel] = useState(() => (typeof window !== 'undefined' ? new BroadcastChannel('svb-jobs-updates') : null))

  const handleProgressUpdated = (id: string, piecesCompleted: number) => {
    setJobs((current) =>
      current.map((job) =>
        job.id === id ? { ...job, pieces_completed: piecesCompleted } : job,
      ),
    )
  }

  const handleStatusUpdated = (id: string, status: JobStatus) => {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, status } : job)))
  }

  const handleDelete = (id: string) => {
    setJobs((current) => current.filter((job) => job.id !== id))
  }

  const handleCreateJob = async (values: JobFormData) => {
    setCreationError(null)

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
      broadcastChannel?.postMessage({ type: 'job-updated' })
      router.refresh()
    })
  }

  const handleJobSaved = (updated: Job) => {
    setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)))
    setEditingJob(null)
    broadcastChannel?.postMessage({ type: 'job-updated' })
    router.refresh()
  }

  return (
    <>
      <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} onSaved={handleJobSaved} />

      {/* New Job Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>
              New jobs appear on the TV as soon as they are saved.
            </DialogDescription>
          </DialogHeader>
          <JobForm
            submitting={creating}
            serverError={creationError}
            onSubmit={handleCreateJob}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Main Table Card */}
      <motion.div
        className="rounded-xl border border-gray-200 bg-white"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 0.8, 0.44, 1] } }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.3, ease: [0.37, 0, 0.63, 1] } }}
      >
        {/* Header with New Job button */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="text-sm text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} total
          </div>
          <Button
            onClick={() => {
              setCreationError(null)
              setIsCreateOpen(true)
            }}
            disabled={creating}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>

        {fetchError ? (
          <div className="px-6 py-4 text-sm text-red-700">Unable to load jobs: {fetchError}</div>
        ) : (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px]">Job Details</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[220px]">Progress</TableHead>
                <TableHead className="w-[160px]">ETA</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No jobs found. Create your first job to get started.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <AdminJobRow
                    key={job.id}
                    job={job}
                    onProgressUpdated={handleProgressUpdated}
                    onStatusUpdated={handleStatusUpdated}
                    onDelete={handleDelete}
                    onEdit={setEditingJob}
                  />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </motion.div>
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
          <div className="text-sm text-muted-foreground">Admin view</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-gray-900">Jobs:</span>
            <span>{jobs.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/tv">TV View</Link>
            </Button>
            <Button variant="default" size="sm">
              Admin
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
