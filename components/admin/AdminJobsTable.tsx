// Admin jobs table - matches Job Management mockup design
'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { createJobAction, updateJobProgressAction, updateJobStatusAction, deleteJobAction } from '@/app/admin/actions'
import { JobForm, type JobFormData } from '@/components/admin/JobForm'
import { type Job, type JobStatus, calculateProgressPercentage } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
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
  { label: 'Pending', value: 'RECEIVED' },
  { label: 'Quoted', value: 'QUOTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'COMPLETED' },
]

const STATUS_BADGE_STYLES: Record<JobStatus, string> = {
  RECEIVED: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  QUOTED: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  IN_PROGRESS: 'bg-green-100 text-green-700 hover:bg-green-100',
  COMPLETED: 'bg-green-100 text-green-700 hover:bg-green-100',
}

function getStatusLabel(status: JobStatus): string {
  const option = STATUS_OPTIONS.find(o => o.value === status)
  return option?.label || status.replace('_', ' ')
}

function formatUpdatedTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function AdminJobRow({
  job,
  onProgressUpdated,
  onStatusUpdated,
  onDelete,
}: {
  job: Job
  onProgressUpdated: (id: string, piecesCompleted: number) => void
  onStatusUpdated: (id: string, status: JobStatus) => void
  onDelete: (id: string) => void
}) {
  const router = useRouter()
  const percentage = calculateProgressPercentage(job.pieces_completed, job.total_pieces)
  const [localPercentage, setLocalPercentage] = useState(percentage)
  const [statusPending, startStatusTransition] = useTransition()
  const [progressPending, startProgressTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()

  useEffect(() => {
    setLocalPercentage(percentage)
  }, [percentage])

  const handleStatusChange = (newStatus: JobStatus) => {
    startStatusTransition(async () => {
      const result = await updateJobStatusAction(job.id, newStatus)
      if (!result?.error) {
        onStatusUpdated(job.id, newStatus)
        router.refresh()
      }
    })
  }

  const handleProgressCommit = (values: number[]) => {
    const newPercentage = values[0]
    const newCompleted = Math.round((newPercentage / 100) * job.total_pieces)

    startProgressTransition(async () => {
      const result = await updateJobProgressAction(job.id, newCompleted, job.total_pieces)
      if (!result?.error) {
        onProgressUpdated(job.id, newCompleted)
        // Auto-complete if 100%
        if (newPercentage === 100 && job.status !== 'COMPLETED') {
          await updateJobStatusAction(job.id, 'COMPLETED')
          onStatusUpdated(job.id, 'COMPLETED')
        }
        router.refresh()
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this job?')) return
    startDeleteTransition(async () => {
      const result = await deleteJobAction(job.id)
      if (!result?.error) {
        onDelete(job.id)
        router.refresh()
      }
    })
  }

  return (
    <TableRow className="hover:bg-gray-50">
      {/* Job Details */}
      <TableCell className="py-4">
        <div className="space-y-0.5">
          <div className="font-mono text-sm font-semibold text-gray-900">{job.part_number}</div>
          <div className="text-sm font-medium text-gray-900">{job.job_number}</div>
          {job.notes && (
            <div className="text-sm text-muted-foreground line-clamp-1">{job.notes}</div>
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Select
          value={job.status}
          onValueChange={(value) => handleStatusChange(value as JobStatus)}
          disabled={statusPending}
        >
          <SelectTrigger className="w-[130px] h-8 border-0 bg-transparent p-0 focus:ring-0">
            <Badge className={cn('cursor-pointer', STATUS_BADGE_STYLES[job.status])}>
              {getStatusLabel(job.status)}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Progress */}
      <TableCell className="w-[200px]">
        <div className="flex items-center gap-3">
          <Slider
            value={[localPercentage]}
            onValueChange={(values) => setLocalPercentage(values[0])}
            onValueCommit={handleProgressCommit}
            max={100}
            step={1}
            className="w-[120px]"
            disabled={progressPending}
          />
          <span className="text-sm text-muted-foreground w-10">{localPercentage}%</span>
        </div>
      </TableCell>

      {/* ETA */}
      <TableCell>
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
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-gray-900"
            disabled={deletePending}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deletePending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function AdminJobsTable({ initialJobs, fetchError }: AdminJobsTableProps) {
  const router = useRouter()
  const [jobs, setJobs] = useState(initialJobs)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creationError, setCreationError] = useState<string | null>(null)
  const [creating, startCreateTransition] = useTransition()

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
      router.refresh()
    })
  }

  return (
    <>
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
      <div className="rounded-xl border border-gray-200 bg-white">
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
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">Job Details</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[200px]">Progress</TableHead>
                <TableHead className="w-[150px]">ETA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  )
}
