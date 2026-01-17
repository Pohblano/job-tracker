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

const STATUS_BADGE_BASE = 'border-0 px-3 py-1 text-sm font-bold uppercase tracking-[0.04em] leading-none whitespace-nowrap sm:px-4 sm:py-1.5 sm:text-base lg:text-[22px]'

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
      <div className="grid grid-cols-1 items-stretch divide-y divide-gray-100 md:grid-cols-[minmax(0,1fr)_280px_200px] md:divide-y-0 md:divide-x lg:grid-cols-[minmax(0,1fr)_320px_220px]">
        {/* Left: Job Info */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="font-mono text-xs font-semibold text-muted-foreground sm:text-sm">{job.part_number || '—'}</div>
              <div className="text-lg font-bold text-gray-900 leading-tight sm:text-xl lg:text-2xl">{job.title || job.job_number}</div>
              <div className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] sm:min-h-[36px] sm:text-sm">
                {job.description?.trim() || 'No description provided'}
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">Qty: {job.total_pieces}</div>
            </div>
            <Badge
              variant="secondary"
              className={cn('self-start sm:self-center', STATUS_BADGE_BASE, config.badgeClass)}
            >
              {formatStatusLabel(job.status)}
            </Badge>
          </div>
        </div>

        {/* Center: Progress */}
        <div className="flex flex-col justify-center px-4 py-4 sm:px-5">
          <div className="mb-2 text-xs font-medium text-muted-foreground sm:text-sm">Progress</div>
          <Progress value={percentage} className={cn('h-2 sm:h-3 lg:h-4 xl:h-5', config.progressClass)} />
          <div className="mt-2 text-left text-base font-semibold tabular-nums text-gray-900 sm:text-right sm:text-lg">
            {percentage}%
          </div>
        </div>

        {/* Right: ETA */}
        <div className="flex flex-col justify-center px-4 py-4 text-left sm:px-5 md:text-right">
          <div className="mb-1 text-xs font-medium text-muted-foreground sm:text-sm">ETA</div>
          <div
            className={cn(
              'text-base font-semibold sm:text-lg',
              config.isDelayed ? 'text-red-600' : 'text-gray-900'
            )}
          >
            {config.isDelayed ? 'Delayed' : (job.eta_text || '—')}
          </div>
          <div className="text-[11px] text-muted-foreground sm:text-xs">
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
