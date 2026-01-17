'use client'
// Job card for TV display with status badge and progress bar
import React, { memo, useEffect, useState } from 'react'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { type Job, type JobStatus, calculateProgressPercentage } from '@/lib/jobs/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
}

const STATUS_CONFIG: Record<JobStatus, {
  label: string
  icon: typeof Circle
  badgeClass: string
  progressClass: string
  isDelayed?: boolean
}> = {
  RECEIVED: {
    label: 'Pending',
    icon: Circle,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    progressClass: '[&>div]:bg-gray-400',
  },
  QUOTED: {
    label: 'Blocked',
    icon: AlertCircle,
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    progressClass: '[&>div]:bg-red-500',
    isDelayed: true,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    progressClass: '[&>div]:bg-blue-500',
  },
  COMPLETED: {
    label: 'Done',
    icon: CheckCircle2,
    badgeClass: 'bg-green-50 text-green-700 border-green-200',
    progressClass: '[&>div]:bg-green-500',
  },
}

function formatUpdatedTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function JobCardComponent({ job }: JobCardProps) {
  const [highlighted, setHighlighted] = useState(false)
  const percentage = calculateProgressPercentage(job.pieces_completed, job.total_pieces)
  const config = STATUS_CONFIG[job.status]
  const Icon = config.icon

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
      <div className="flex items-stretch">
        {/* Left: Job Info */}
        <div className="flex-1 border-r border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 leading-tight">{job.title || job.job_number}</div>
              <div className="font-mono text-sm font-semibold text-muted-foreground">{job.part_number}</div>
              {job.description && (
                <div className="text-sm text-muted-foreground line-clamp-1">{job.description}</div>
              )}
              <div className="text-sm text-muted-foreground">
                Qty: {job.total_pieces}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn('flex items-center gap-1.5 px-3 py-1', config.badgeClass)}
            >
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Center: Progress */}
        <div className="flex w-[280px] flex-col justify-center border-r border-gray-100 px-6 py-5">
          <div className="mb-2 text-sm font-medium text-muted-foreground">Progress</div>
          <Progress value={percentage} className={cn('h-3', config.progressClass)} />
          <div className="mt-2 text-right text-lg font-semibold tabular-nums text-gray-900">
            {percentage}%
          </div>
        </div>

        {/* Right: ETA */}
        <div className="flex w-[180px] flex-col justify-center px-6 py-5 text-right">
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
