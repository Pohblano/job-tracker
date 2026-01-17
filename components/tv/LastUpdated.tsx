'use client'
// Displays the last updated timestamp and connection health for the TV view.
import React from 'react'
import { formatDateTime } from '@/lib/utils'

type ConnectionState = 'connected' | 'reconnecting' | 'disconnected'

interface LastUpdatedProps {
  timestamp: Date
  connectionState: ConnectionState
}

const STATE_LABELS: Record<ConnectionState, string> = {
  connected: 'Connected',
  reconnecting: 'Reconnecting…',
  disconnected: 'Live updates paused',
}

const STATE_CLASSES: Record<ConnectionState, string> = {
  connected: 'text-green-700',
  reconnecting: 'text-blue-700',
  disconnected: 'text-amber-700',
}

const STATE_DOTS: Record<ConnectionState, string> = {
  connected: 'bg-green-500',
  reconnecting: 'bg-blue-500',
  disconnected: 'bg-amber-500',
}

export function LastUpdated({ timestamp, connectionState }: LastUpdatedProps) {
  return (
    <div className="flex items-center justify-between text-xl text-gray-600">
      <div className="flex items-center gap-3">
        <span className={STATE_CLASSES[connectionState]}>{STATE_LABELS[connectionState]}</span>
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <span className={`h-3 w-3 rounded-full ${STATE_DOTS[connectionState]}`} aria-hidden />
          <span className="uppercase tracking-wide">Live</span>
        </span>
      </div>
      <div>Last updated: {formatDateTime(timestamp)}</div>
    </div>
  )
}
