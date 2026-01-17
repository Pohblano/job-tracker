'use client'
// Single job row for the TV display; highlights on realtime updates and respects the TV grid sizing.
import React, { memo, useEffect, useState } from 'react'
import { type Job } from '@/lib/jobs/types'
import { StatusPill } from '@/components/ui/StatusPill'
import { ProgressBar } from './ProgressBar'
import { cn } from '@/lib/utils'

interface JobRowProps {
  job: Job
}

function JobRowComponent({ job }: JobRowProps) {
  const [highlighted, setHighlighted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    setHighlighted(true)
    const timer = setTimeout(() => setHighlighted(false), 1700)
    return () => clearTimeout(timer)
  }, [job.updated_at, job.pieces_completed])

  return (
    <div
      className={cn(
        'tv-job-row grid grid-cols-[140px_200px_240px_1fr_180px] items-center gap-8 border-b border-gray-100 px-6 py-6',
        'min-h-[88px]',
        visible ? 'opacity-100' : 'opacity-0',
        highlighted ? 'bg-green-50' : 'bg-white',
      )}
      data-testid={`job-row-${job.id}`}
    >
      <div className="font-mono text-3xl font-semibold text-tv-text">{job.job_number}</div>
      <div className="truncate font-mono text-3xl font-semibold text-tv-text" title={job.part_number}>
        {job.part_number}
      </div>
      <StatusPill status={job.status} size="lg" />
      <ProgressBar completed={job.pieces_completed} total={job.total_pieces} status={job.status} />
      <div className="text-right text-3xl font-semibold text-tv-text">{job.eta_text?.trim() || '—'}</div>
    </div>
  )
}

export const JobRow = memo(JobRowComponent, (prev, next) => {
  return prev.job.id === next.job.id && prev.job.updated_at === next.job.updated_at
})
