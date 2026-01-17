'use client'
// Job card for TV display with status badge and progress bar
import React, { memo, useEffect, useState } from 'react'
import { type Job, type JobStatus, calculateProgressPercentage } from '@/lib/jobs/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
}

const STATUS_CONFIG: Record<JobStatus, {
  badgeClass: string
  progressClass: string
  isDelayed?: boolean
}> = {
  RECEIVED: {
    badgeClass: 'bg-gray-200 text-gray-800',
    progressClass: '[&>div]:bg-gray-400',
  },
  QUOTED: {
    badgeClass: 'bg-blue-100 text-blue-800',
    progressClass: '[&>div]:bg-blue-500',
    isDelayed: true,
  },
  IN_PROGRESS: {
    badgeClass: 'bg-green-100 text-green-800',
    progressClass: '[&>div]:bg-green-500',
  },
  PAUSED: {
    badgeClass: 'bg-amber-100 text-amber-800',
    progressClass: '[&>div]:bg-amber-500',
    isDelayed: true,
  },
  COMPLETED: {
    badgeClass: 'bg-gray-100 text-gray-500',
    progressClass: '[&>div]:bg-gray-300',
  },
}

const STATUS_BADGE_BASE = 'border-0 px-5 py-2.5 text-[28px] font-bold uppercase tracking-[0.05em] leading-none whitespace-nowrap'

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

function formatStatusLabel(status: JobStatus): string {
  return status.replace(/_/g, ' ')
}

function JobCardComponent({ job }: JobCardProps) {
  const [highlighted, setHighlighted] = useState(false)
  const percentage = calculateProgressPercentage(job.pieces_completed, job.total_pieces)
  const config = STATUS_CONFIG[job.status]

  useEffect(() => {
    setHighlighted(true)
    const timer = setTimeout(() => setHighlighted(false), 1700)
    return () => clearTimeout(timer)
  }, [job.updated_at, job.pieces_completed])

  return (
    <Card
      className={cn(
        'overflow-hidden border border-gray-200 transition-colors duration-500',
        highlighted && 'border-green-300 bg-green-50/50'
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_320px_220px] items-stretch divide-x divide-gray-100">
        {/* Left: Job Info */}
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="font-mono text-sm font-semibold text-muted-foreground">{job.part_number || '—'}</div>
              <div className="text-2xl font-bold text-gray-900 leading-tight">{job.title || job.job_number}</div>
              <div className="text-sm text-muted-foreground line-clamp-2 min-h-[42px]">
                {job.description?.trim() || 'No description provided'}
              </div>
              <div className="text-sm text-muted-foreground">Qty: {job.total_pieces}</div>
            </div>
            <Badge
              variant="outline"
              className={cn(STATUS_BADGE_BASE, config.badgeClass)}
            >
              {formatStatusLabel(job.status)}
            </Badge>
          </div>
        </div>

        {/* Center: Progress */}
        <div className="flex flex-col justify-center px-6 py-5">
          <div className="mb-2 text-sm font-medium text-muted-foreground">Progress</div>
          <Progress value={percentage} className={cn('h-3', config.progressClass)} />
          <div className="mt-2 text-right text-lg font-semibold tabular-nums text-gray-900">
            {percentage}%
          </div>
        </div>

        {/* Right: ETA */}
        <div className="flex flex-col justify-center px-6 py-5 text-right">
          <div className="mb-1 text-sm font-medium text-muted-foreground">ETA</div>
          <div
            className={cn(
              'text-lg font-semibold',
              config.isDelayed ? 'text-red-600' : 'text-gray-900'
            )}
          >
            {config.isDelayed ? 'Delayed' : (job.eta_text || '—')}
          </div>
          <div className="text-xs text-muted-foreground">
            Updated {formatUpdatedTime(job.updated_at)}
          </div>
        </div>
      </div>
    </Card>
  )
}

export const JobCard = memo(JobCardComponent, (prev, next) => {
  return prev.job.id === next.job.id && prev.job.updated_at === next.job.updated_at
})
