'use client'
// TV jobs board with card-based layout and realtime updates
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { type Job, type JobPriority } from '@/lib/jobs/types'
import { prepareJobsForDisplay, sortJobs } from '@/lib/jobs/presentation'
import { JobCard } from './JobCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const [filterMode, setFilterMode] = useState<'active' | 'all' | 'completed'>('active')
  const [sortMode, setSortMode] = useState<'status' | 'recent' | 'priority'>('status')
  const [pageSize, setPageSize] = useState(5)

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
  const handleManualPageChange = (delta: number) => {
    if (pageCount <= 1) return
    setRotationPaused(true)
    setPageIndex((current) => (current + delta + pageCount) % pageCount)
    setTimeout(() => setRotationPaused(false), ROTATION_PAUSE_MS)
  }

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
    const start = pageIndex * pageSize
    const end = start + pageSize
    return filteredJobs.slice(start, end)
  }, [filteredJobs, pageIndex, pageSize])

  const activeJobsCount = jobs.filter(j => j.status !== 'COMPLETED').length
  const showingStart = filteredJobs.length === 0 ? 0 : pageIndex * pageSize + 1
  const showingEnd = Math.min(filteredJobs.length, pageIndex * pageSize + pageSize)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="space-y-2 sm:hidden">
        <div className="flex gap-2">
          <Button variant="default" className="flex-1">
            TV View
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/admin">Admin View</Link>
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
      {/* Job Cards */}
      <motion.div
        className="space-y-3 sm:space-y-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 0.8, 0.44, 1] } }}
        exit={{ opacity: 0, y: -12, transition: { duration: 0.35, ease: [0.37, 0, 0.63, 1] } }}
      >
        {visibleJobs.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white sm:h-64">
            <p className="text-center text-sm text-muted-foreground sm:text-lg">No active jobs at this time</p>
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
      <motion.div
        layout
        className="-mx-4 border-t border-gray-200 bg-white md:fixed md:bottom-0 md:left-0 md:right-0 md:mx-0 md:bg-white/95 md:backdrop-blur-sm sm:-mx-6"
        transition={{ duration: 0.25, ease: [0.37, 0, 0.63, 1] }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-0 md:px-8">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
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
                      key={`tv-page-${idx}`}
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
                    Filters & Order
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

          {/* View Toggle & Count */}
          <div className="flex flex-col items-start gap-2 text-xs sm:items-end sm:text-sm">
            <span className="text-muted-foreground">
              Active jobs: {activeJobsCount}
            </span>
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="default" size="sm">
                TV View
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">Admin View</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom padding for fixed footer */}
      <div className="hidden md:block md:h-20" />
    </div>
  )
}
