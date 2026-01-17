// Admin jobs table for SVB; aligns with admin mockups including inline progress updates and full edit modal.
'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { createJobAction, updateJobStatusAction, deleteJobAction } from '@/app/admin/actions'
import { EditJobModal } from '@/components/admin/EditJobModal'
import { InlineProgressUpdate } from '@/components/admin/InlineProgressUpdate'
import { JobForm, type JobFormData } from '@/components/admin/JobForm'
import { type Job, type JobPriority, type JobStatus } from '@/lib/jobs/types'
import { sortJobs } from '@/lib/jobs/presentation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLogger } from '@/components/ui/use-logger'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const MotionTableRow = motion(TableRow)

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
  index,
  onProgressUpdated,
  onStatusUpdated,
  onDelete,
  onEdit,
  broadcastChannel,
}: {
  job: Job
  index: number
  onProgressUpdated: (id: string, piecesCompleted: number) => void
  onStatusUpdated: (id: string, status: JobStatus) => void
  onDelete: (id: string) => void
  onEdit: (job: Job) => void
  broadcastChannel: BroadcastChannel | null
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
      broadcastChannel?.postMessage({ type: 'job-updated' })
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
    <MotionTableRow
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut', delay: index * 0.05 },
      }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } }}
      className="hover:bg-gray-50 [&>td]:pl-8 [&>td]:pr-4"
    >
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
          <div className="text-lg font-semibold text-gray-900">
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
    </MotionTableRow>
  )
}

function AdminJobCard({
  job,
  index,
  onProgressUpdated,
  onStatusUpdated,
  onDelete,
  onEdit,
  broadcastChannel,
}: {
  job: Job
  index: number
  onProgressUpdated: (id: string, piecesCompleted: number) => void
  onStatusUpdated: (id: string, status: JobStatus) => void
  onDelete: (id: string) => void
  onEdit: (job: Job) => void
  broadcastChannel: BroadcastChannel | null
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
      broadcastChannel?.postMessage({ type: 'job-updated' })
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut', delay: index * 0.05 },
      }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } }}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>{job.job_number}</span>
              <span className="text-gray-300">|</span>
              <span>{job.part_number || '—'}</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">{job.title || job.job_number}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {job.description?.trim() || 'No description provided'}
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Status</div>
            <Select
              value={job.status}
              onValueChange={(value) => handleStatusChange(value as JobStatus)}
              disabled={statusPending}
            >
              <SelectTrigger
                className={cn(
                  'h-9 w-full justify-between rounded-full px-4 text-sm font-semibold shadow-sm transition-colors focus:ring-2 focus:ring-offset-0',
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
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Progress</div>
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground">ETA</div>
            <div className="text-base font-semibold text-gray-900">{job.eta_text || '—'}</div>
          </div>
          <div className="text-xs text-muted-foreground">Updated {formatUpdatedTime(job.updated_at)}</div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onEdit(job)}
            disabled={deletePending}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setDeleteOpen(true)}
            disabled={deletePending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

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
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deletePending} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletePending} className="w-full sm:w-auto">
              {deletePending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export function AdminJobsTable({ initialJobs, fetchError }: AdminJobsTableProps) {
  const router = useRouter()
  const [jobs, setJobs] = useState(initialJobs)
  const [pageIndex, setPageIndex] = useState(0)
  const [filterMode, setFilterMode] = useState<'active' | 'all' | 'completed'>('all')
  const [sortMode, setSortMode] = useState<'status' | 'recent' | 'priority'>('recent')
  const [pageSize, setPageSize] = useState(5)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creationError, setCreationError] = useState<string | null>(null)
  const [creating, startCreateTransition] = useTransition()
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [broadcastChannel] = useState(() => (typeof window !== 'undefined' ? new BroadcastChannel('svb-jobs-updates') : null))

  const filterAndSortJobs = useMemo(() => {
    const priorityRank = (priority: JobPriority | null) => {
      if (priority === 'HIGH') return 0
      if (priority === 'MEDIUM') return 1
      if (priority === 'LOW') return 2
      return 3
    }

    const sortByMode = (list: Job[]) => {
      if (sortMode === 'recent') {
        return [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      }
      if (sortMode === 'priority') {
        return [...list].sort((a, b) => {
          const diff = priorityRank(a.priority) - priorityRank(b.priority)
          if (diff !== 0) return diff
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        })
      }
      return sortJobs(list)
    }

    return (list: Job[]) => {
      let filtered = list
      if (filterMode === 'active') {
        filtered = list.filter((job) => job.status !== 'COMPLETED')
      } else if (filterMode === 'completed') {
        filtered = list.filter((job) => job.status === 'COMPLETED')
      }
      return sortByMode(filtered)
    }
  }, [filterMode, sortMode])

  const filteredJobs = useMemo(() => filterAndSortJobs(jobs), [filterAndSortJobs, jobs])
  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / pageSize))

  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(Math.max(0, pageCount - 1))
    }
  }, [pageCount, pageIndex])

  const visibleJobs = useMemo(() => {
    const start = pageIndex * pageSize
    const end = start + pageSize
    return filteredJobs.slice(start, end)
  }, [filteredJobs, pageIndex, pageSize])

  const showingStart = filteredJobs.length === 0 ? 0 : pageIndex * pageSize + 1
  const showingEnd = Math.min(filteredJobs.length, (pageIndex + 1) * pageSize)

  const handleProgressUpdated = (id: string, piecesCompleted: number) => {
    setJobs((current) =>
      current.map((job) =>
        job.id === id ? { ...job, pieces_completed: piecesCompleted } : job,
      ),
    )
    broadcastChannel?.postMessage({ type: 'job-updated' })
  }

  const handleStatusUpdated = (id: string, status: JobStatus) => {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, status } : job)))
    broadcastChannel?.postMessage({ type: 'job-updated' })
  }

  const handleDelete = (id: string) => {
    setJobs((current) => current.filter((job) => job.id !== id))
    broadcastChannel?.postMessage({ type: 'job-updated' })
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
      setPageIndex(0)
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
        <DialogContent className="left-0 top-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 rounded-none overflow-y-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
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

      <div className="mb-4 space-y-2 sm:hidden">
        <div className="flex gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link href="/tv">TV View</Link>
          </Button>
          <Button variant="default" className="flex-1">
            Admin View
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              Filters &amp; Order
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Show</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={filterMode}
              onValueChange={(value) => {
                setFilterMode(value as typeof filterMode)
                setPageIndex(0)
              }}
            >
              <DropdownMenuRadioItem value="active">Active only</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="all">All jobs</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="completed">Completed only</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground">Order by</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sortMode}
              onValueChange={(value) => {
                setSortMode(value as typeof sortMode)
                setPageIndex(0)
              }}
            >
              <DropdownMenuRadioItem value="status">Status, then recent</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="recent">Recently updated</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="priority">Priority high → low</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground">Items per page</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={String(pageSize)}
              onValueChange={(value) => {
                const nextSize = Number(value) || 5
                setPageSize(nextSize)
                setPageIndex(0)
              }}
            >
              {[3, 5, 7, 10].map((size) => (
                <DropdownMenuRadioItem key={size} value={String(size)}>{size} items</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Table Card */}
      <motion.div
        className="mb-4 rounded-lg border border-gray-200 bg-white overflow-hidden sm:mb-6 sm:rounded-xl md:mb-0"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 0.8, 0.44, 1] } }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.3, ease: [0.37, 0, 0.63, 1] } }}
      >
        {/* Header with New Job button */}
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} total
          </div>
          <Button
            onClick={() => {
              setCreationError(null)
              setIsCreateOpen(true)
            }}
            disabled={creating}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>

        {fetchError ? (
          <div className="px-4 py-4 text-sm text-red-700 sm:px-6">Unable to load jobs: {fetchError}</div>
        ) : (
          <>
            <div className="space-y-3 px-4 py-4 sm:px-6 lg:hidden">
              {jobs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-muted-foreground">
                  No jobs found. Create your first job to get started.
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-muted-foreground">
                  No jobs match the current filters.
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {visibleJobs.map((job, index) => (
                    <AdminJobCard
                      key={job.id}
                      job={job}
                      index={index}
                      onProgressUpdated={handleProgressUpdated}
                      onStatusUpdated={handleStatusUpdated}
                      onDelete={handleDelete}
                      onEdit={setEditingJob}
                      broadcastChannel={broadcastChannel}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="hidden lg:block">
              <Table className="table-fixed overflow-y-hidden">
                <TableHeader>
                  <TableRow className="hover:bg-transparent [&>th]:pl-8 [&>th]:pr-7">
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
                  ) : filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No jobs match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {visibleJobs.map((job, index) => (
                        <AdminJobRow
                          key={job.id}
                          job={job}
                          index={index}
                          onProgressUpdated={handleProgressUpdated}
                          onStatusUpdated={handleStatusUpdated}
                          onDelete={handleDelete}
                          onEdit={setEditingJob}
                          broadcastChannel={broadcastChannel}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </motion.div>
      <motion.div
        layout
        className="-mx-4 border-t border-gray-200 bg-white md:fixed md:bottom-0 md:left-0 md:right-0 md:mx-0 md:bg-white/95 md:backdrop-blur-sm sm:-mx-6"
        transition={{ duration: 0.25, ease: [0.37, 0, 0.63, 1] }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-0 md:px-8">
          <div className="text-xs text-muted-foreground sm:text-sm">Admin view</div>
          <div className="flex flex-col items-start gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4 sm:text-sm md:justify-self-center">
            <span>
              Showing <span className="font-semibold text-gray-900">{showingStart}-{showingEnd}</span> of{' '}
              <span className="font-semibold text-gray-900">{filteredJobs.length}</span>
            </span>
            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                  disabled={pageIndex === 0}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900',
                    pageIndex === 0 && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gray-600',
                  )}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pageCount }).map((_, idx) => (
                    <button
                      key={`admin-page-${idx}`}
                      type="button"
                      onClick={() => setPageIndex(idx)}
                      className={cn(
                        'h-2 w-2 rounded-full border-0 p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
                        idx === pageIndex ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400',
                      )}
                      aria-label={`Go to page ${idx + 1}`}
                      aria-current={idx === pageIndex ? 'page' : undefined}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))}
                  disabled={pageIndex === pageCount - 1}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900',
                    pageIndex === pageCount - 1 && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gray-600',
                  )}
                  aria-label="Go to next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Filters &amp; Order
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Show</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={filterMode}
                    onValueChange={(value) => {
                      setFilterMode(value as typeof filterMode)
                      setPageIndex(0)
                    }}
                  >
                    <DropdownMenuRadioItem value="active">Active only</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="all">All jobs</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="completed">Completed only</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="text-xs text-muted-foreground">Order by</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={sortMode}
                    onValueChange={(value) => {
                      setSortMode(value as typeof sortMode)
                      setPageIndex(0)
                    }}
                  >
                    <DropdownMenuRadioItem value="status">Status, then recent</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="recent">Recently updated</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="priority">Priority high → low</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="text-xs text-muted-foreground">Items per page</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      const nextSize = Number(value) || 5
                      setPageSize(nextSize)
                      setPageIndex(0)
                    }}
                  >
                    {[3, 5, 7, 10].map((size) => (
                      <DropdownMenuRadioItem key={size} value={String(size)}>{size} items</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="hidden items-center justify-end gap-2 sm:flex">
            <Button variant="outline" size="sm" asChild>
              <Link href="/tv">TV View</Link>
            </Button>
            <Button variant="default" size="sm">
              Admin View
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
