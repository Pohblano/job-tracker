// TV-sized progress bar for SVB; animates width to show realtime production progress.
import React from 'react'
import { calculateProgressPercentage } from '@/lib/jobs/types'
import { type JobStatus } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'

const FILL_STYLES: Record<JobStatus, string> = {
  RECEIVED: 'bg-gray-400',
  QUOTED: 'bg-blue-500',
  IN_PROGRESS: 'bg-green-500',
  COMPLETED: 'bg-gray-300',
}

interface ProgressBarProps {
  completed: number
  total: number
  status: JobStatus
}

export function ProgressBar({ completed, total, status }: ProgressBarProps) {
  const safeCompleted = Math.min(completed, total)
  const overCap = completed > total
  const percentage = calculateProgressPercentage(safeCompleted, total)

  return (
    <div className="w-full">
      <div className="h-5 w-full overflow-hidden rounded-lg bg-gray-200">
        <div
          className={cn('h-full transition-[width] duration-300 ease-out', FILL_STYLES[status])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className={cn('mt-2 text-2xl', overCap ? 'text-amber-700' : 'text-gray-700')}>
        {completed} / {total} pieces
        {overCap && (
          <span aria-label="Progress exceeds total" className="ml-2">
            ⚠️
          </span>
        )}
      </div>
    </div>
  )
}
