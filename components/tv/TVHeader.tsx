'use client'
// TV header shows the product title and live date/time for at-a-glance awareness.
import React, { useEffect, useState } from 'react'

function buildHeaderTimestamp(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function TVHeader() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="flex items-center justify-between border-b border-gray-200 pb-6">
      <div className="text-5xl font-bold uppercase tracking-wide text-tv-text">Shop Visibility Board</div>
      <div className="text-3xl font-semibold text-gray-700">{buildHeaderTimestamp(now)}</div>
    </header>
  )
}
