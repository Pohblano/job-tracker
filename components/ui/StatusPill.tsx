// Status pill used across SVB; encodes status with both color and text for accessibility.
import React from 'react'
import { cn } from '@/lib/utils'
import { type JobStatus } from '@/lib/jobs/types'

const STATUS_STYLES: Record<JobStatus, string> = {
  RECEIVED: 'bg-gray-200 text-gray-800',
  QUOTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-500',
}

interface StatusPillProps {
  status: JobStatus
  size?: 'sm' | 'lg'
  className?: string
}

export function StatusPill({ status, size = 'lg', className }: StatusPillProps) {
  const base =
    size === 'lg'
      ? 'text-2xl px-5 py-2'
      : 'text-sm px-3 py-1'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-bold uppercase tracking-wide',
        STATUS_STYLES[status],
        base,
        className,
      )}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
