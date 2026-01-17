'use client'
// TV header with title and large clock display
import React, { useEffect, useState } from 'react'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function TVHeader() {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shop Visibility Board</h1>
        <p className="mt-1 text-sm text-muted-foreground">Real-time production status</p>
      </div>
      <div className="text-right">
        <div className="text-3xl font-semibold tabular-nums text-gray-900">
          {mounted ? formatTime(now) : <span className="opacity-0">00:00:00 AM</span>}
        </div>
        <div className="text-sm text-muted-foreground">
          {mounted ? formatDate(now) : <span className="opacity-0">Loading...</span>}
        </div>
      </div>
    </header>
  )
}
