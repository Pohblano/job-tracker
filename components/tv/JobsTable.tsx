'use client'
// TV jobs table with realtime updates, deterministic sorting, and auto-rotation for high job volumes.
import React, { useEffect, useMemo, useState } from 'react'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { type Job } from '@/lib/jobs/types'
import { prepareJobsForDisplay, sortJobs } from '@/lib/jobs/presentation'
import { JobRow } from './JobRow'
import { LastUpdated } from './LastUpdated'
import { cn } from '@/lib/utils'

interface JobsTableProps {
  initialJobs: Job[]
  initialFetchedAt: string
  initialError?: string
}

type ConnectionState = 'connected' | 'reconnecting' | 'disconnected'

const PAGE_SIZE = 6
const ROTATION_INTERVAL_MS = 20000
const ROTATION_PAUSE_MS = 5000
const RECONNECT_DELAY_MS = 10000
const MAX_RECONNECT_ATTEMPTS = 6
const POLLING_FALLBACK_MS = 60000

export function JobsTable({ initialJobs, initialFetchedAt, initialError }: JobsTableProps) {
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createBrowserSupabaseClient()
  }, [])
  const [jobs, setJobs] = useState<Job[]>(prepareJobsForDisplay(initialJobs))
  const [pageIndex, setPageIndex] = useState(0)
  const [rotationPaused, setRotationPaused] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>(initialError ? 'disconnected' : 'connected')
  const [lastUpdated, setLastUpdated] = useState(() => new Date(initialFetchedAt))
  const [errorMessage, setErrorMessage] = useState<string | undefined>(initialError)

  const pageCount = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))

  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(0)
    }
  }, [pageCount, pageIndex])

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout | null = null

    rotationTimer = setInterval(() => {
      if (rotationPaused || pageCount <= 1) return
      setPageIndex((current) => (current + 1) % pageCount)
    }, ROTATION_INTERVAL_MS)

    return () => {
      if (rotationTimer) clearInterval(rotationTimer)
    }
  }, [pageCount, rotationPaused])

  useEffect(() => {
    if (!supabase) return

    let reconnectAttempts = 0
    let fallbackPoll: NodeJS.Timeout | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let activeChannel: RealtimeChannel = supabase.channel(`jobs-realtime-${Date.now()}`)

    // Pause rotation briefly when new data arrives so viewers can read the change.
    const pauseRotationBriefly = () => {
      setRotationPaused(true)
      setTimeout(() => setRotationPaused(false), ROTATION_PAUSE_MS)
    }

    const refreshFromSupabase = async () => {
      const { data, error } = await supabase.from('jobs').select('*')
      if (!error && data) {
        setJobs(prepareJobsForDisplay(data))
        setLastUpdated(new Date())
        setErrorMessage(undefined)
      }
    }

    // Graceful degradation: poll once per minute when realtime is unavailable.
    const startFallbackPolling = () => {
      if (fallbackPoll) return
      fallbackPoll = setInterval(refreshFromSupabase, POLLING_FALLBACK_MS)
    }

    const stopFallbackPolling = () => {
      if (fallbackPoll) {
        clearInterval(fallbackPoll)
        fallbackPoll = null
      }
    }

    const handleChange = (payload: RealtimePostgresChangesPayload<Job>) => {
      setJobs((current) => {
        let nextJobs = [...current]

        if (payload.eventType === 'DELETE') {
          nextJobs = nextJobs.filter((job) => job.id !== payload.old.id)
        } else {
          const updatedJob = payload.new as Job
          const index = nextJobs.findIndex((job) => job.id === updatedJob.id)
          if (index === -1) {
            nextJobs.push(updatedJob)
          } else {
            nextJobs[index] = updatedJob
          }
        }

        return prepareJobsForDisplay(nextJobs)
      })

      setLastUpdated(new Date())
      pauseRotationBriefly()
    }

    const subscribeToChannel = () => {
      activeChannel = supabase.channel(`jobs-realtime-${Date.now()}`)
      activeChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, handleChange)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionState('connected')
            setErrorMessage(undefined)
            reconnectAttempts = 0
            stopFallbackPolling()
            refreshFromSupabase()
          }

          if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            reconnectAttempts += 1
            const shouldRetry = reconnectAttempts <= MAX_RECONNECT_ATTEMPTS
            setConnectionState(shouldRetry ? 'reconnecting' : 'disconnected')
            startFallbackPolling()

            if (shouldRetry) {
              reconnectTimeout = setTimeout(() => {
                supabase.removeChannel(activeChannel)
                subscribeToChannel()
              }, RECONNECT_DELAY_MS)
            }
          }
        })
    }

    subscribeToChannel()

    if (initialError) {
      startFallbackPolling()
      refreshFromSupabase()
    }

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      stopFallbackPolling()
      supabase.removeChannel(activeChannel)
    }
  }, [supabase, initialError])

  const visibleJobs = useMemo(() => {
    const start = pageIndex * PAGE_SIZE
    const end = start + PAGE_SIZE
    return sortJobs(jobs).slice(start, end)
  }, [jobs, pageIndex])

  return (
    <div className="tv-card flex h-full flex-col gap-6 p-8 shadow-lg">
      <div className="grid grid-cols-[140px_200px_240px_1fr_180px] items-center gap-8 border-b border-gray-200 pb-4 text-2xl font-bold uppercase tracking-wide text-gray-700">
        <div>Job #</div>
        <div>Part #</div>
        <div>Status</div>
        <div>Progress</div>
        <div className="text-right">ETA</div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-lg text-amber-800">
          Using last known data — live updates will resume when connected.
        </div>
      )}

      {visibleJobs.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-3xl text-gray-500">
          No active jobs at this time
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {visibleJobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 text-lg text-gray-600">
          <span>
            Page {pageIndex + 1} of {pageCount}
          </span>
          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }).map((_, idx) => (
              <span
                key={`page-dot-${idx}`}
                className={cn('h-2.5 w-2.5 rounded-full', idx === pageIndex ? 'bg-gray-800' : 'bg-gray-300')}
              />
            ))}
          </div>
        </div>
      )}

      <LastUpdated timestamp={lastUpdated} connectionState={connectionState} />
    </div>
  )
}
