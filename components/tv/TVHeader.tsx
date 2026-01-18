'use client'
// TV header with title, logo, and large clock display
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

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
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <Image
          src="/valar-square.avif"
          alt="Valar Square logo"
          width={96}
          height={96}
          priority
          className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12 lg:h-14 lg:w-14"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl xl:text-5xl">
            Shop Visibility Board
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm lg:text-base">
            Real-time production status
          </p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <div className="text-2xl font-semibold tabular-nums text-gray-900 sm:text-3xl lg:text-4xl xl:text-5xl">
          {mounted ? formatTime(now) : <span className="opacity-0">00:00:00 AM</span>}
        </div>
        <div className="text-xs text-muted-foreground sm:text-sm lg:text-lg">
          {mounted ? formatDate(now) : <span className="opacity-0">Loading...</span>}
        </div>
      </div>
    </header>
  )
}
