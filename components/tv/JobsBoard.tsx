'use client'
// TV jobs board with card-based layout and realtime updates
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { AnimatePresence, motion } from 'framer-motion'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { type Job } from '@/lib/jobs/types'
import { prepareJobsForDisplay, sortJobs } from '@/lib/jobs/presentation'
import { JobCard } from './JobCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface JobsBoardProps {
  initialJobs: Job[]
  initialFetchedAt: string
  initialError?: string
}

type ConnectionState = 'connected' | 'reconnecting' | 'disconnected'

const PAGE_SIZE = 5
const ROTATION_INTERVAL_MS = 20000
const ROTATION_PAUSE_MS = 5000
const RECONNECT_DELAY_MS = 10000
const MAX_RECONNECT_ATTEMPTS = 6
const POLLING_FALLBACK_MS = 60000

export function JobsBoard({ initialJobs, initialFetchedAt, initialError }: JobsBoardProps) {
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createBrowserSupabaseClient()
  }, [])
  const [jobs, setJobs] = useState<Job[]>(prepareJobsForDisplay(initialJobs))
  const [pageIndex, setPageIndex] = useState(0)
  const [rotationPaused, setRotationPaused] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>(initialError ? 'disconnected' : 'connected')
  const [lastUpdated, setLastUpdated] = useState(() => new Date(initialFetchedAt))

  const pageCount = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))

  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(0)
    }
  }, [pageCount, pageIndex])

  useEffect(() => {
    const rotationTimer = setInterval(() => {
      if (rotationPaused || pageCount <= 1) return
      setPageIndex((current) => (current + 1) % pageCount)
    }, ROTATION_INTERVAL_MS)

    return () => clearInterval(rotationTimer)
  }, [pageCount, rotationPaused])

  useEffect(() => {
    if (!supabase) return

    let reconnectAttempts = 0
    let fallbackPoll: NodeJS.Timeout | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let activeChannel: RealtimeChannel = supabase.channel(`jobs-realtime-${Date.now()}`)

    const pauseRotationBriefly = () => {
      setRotationPaused(true)
      setTimeout(() => setRotationPaused(false), ROTATION_PAUSE_MS)
    }

    const refreshFromSupabase = async () => {
      const { data, error } = await supabase.from('jobs').select('*')
      if (!error && data) {
        setJobs(prepareJobsForDisplay(data))
        setLastUpdated(new Date())
      }
    }

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

    const broadcast = new BroadcastChannel('svb-jobs-updates')
    const handleBroadcast = () => refreshFromSupabase()
    broadcast.addEventListener('message', handleBroadcast)

    if (initialError) {
      startFallbackPolling()
      refreshFromSupabase()
    }

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      stopFallbackPolling()
      supabase.removeChannel(activeChannel)
      broadcast.removeEventListener('message', handleBroadcast)
      broadcast.close()
    }
  }, [supabase, initialError])

  const visibleJobs = useMemo(() => {
    const start = pageIndex * PAGE_SIZE
    const end = start + PAGE_SIZE
    return sortJobs(jobs).slice(start, end)
  }, [jobs, pageIndex])

  const activeJobsCount = jobs.filter(j => j.status !== 'COMPLETED').length

  return (
    <div className="flex flex-col gap-6">
      {/* Job Cards */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 0.8, 0.44, 1] } }}
        exit={{ opacity: 0, y: -12, transition: { duration: 0.35, ease: [0.37, 0, 0.63, 1] } }}
      >
        {visibleJobs.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
            <p className="text-lg text-muted-foreground">No active jobs at this time</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visibleJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.35, ease: 'easeOut', delay: idx * 0.05 },
                }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                connectionState === 'connected' && 'bg-green-500',
                connectionState === 'reconnecting' && 'bg-yellow-500 animate-pulse',
                connectionState === 'disconnected' && 'bg-red-500'
              )}
            />
            <div className="flex flex-col leading-tight">
              <span>
                {connectionState === 'connected' && 'Live sync active'}
                {connectionState === 'reconnecting' && 'Reconnecting...'}
                {connectionState === 'disconnected' && 'Offline mode'}
              </span>
              <span className="text-xs text-gray-500">
                Last updated:{' '}
                {lastUpdated.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              {Array.from({ length: pageCount }).map((_, idx) => (
                <span
                  key={`page-dot-${idx}`}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    idx === pageIndex ? 'bg-gray-900' : 'bg-gray-300'
                  )}
                />
              ))}
            </div>
          )}

          {/* View Toggle & Count */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Active jobs: {activeJobsCount}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm">
                TV View
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed footer */}
      <div className="h-20" />
    </div>
  )
}
