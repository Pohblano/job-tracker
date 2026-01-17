// Inline progress updater for admin; matches the quick-edit spec with validation and optimistic feedback.
'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { updateJobProgressAction } from '@/app/admin/actions'

interface InlineProgressUpdateProps {
  jobId: string
  completed: number
  total: number
  onSaved: (value: number) => void
}

export function InlineProgressUpdate({ jobId, completed, total, onSaved }: InlineProgressUpdateProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(completed)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setValue(completed)
  }, [completed])

  useEffect(() => {
    if (savedAt === null) return
    const timer = setTimeout(() => setSavedAt(null), 1200)
    return () => clearTimeout(timer)
  }, [savedAt])

  const handleSave = () => {
    const numericValue = Number(value)
    if (!Number.isInteger(numericValue)) {
      setError('Must be an integer')
      return
    }
    if (numericValue < 0 || numericValue > total) {
      setError(`Must be between 0 and ${total}`)
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await updateJobProgressAction(jobId, numericValue, total)
      if (result?.error) {
        setError(result.error)
        return
      }
      onSaved(numericValue)
      setSavedAt(Date.now())
      setEditing(false)
    })
  }

  if (!editing) {
    return (
      <button
        type="button"
        className="font-mono text-sm text-gray-800 hover:underline"
        onClick={() => setEditing(true)}
      >
        {completed} / {total} {savedAt ? '✓' : ''}
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleSave()
          }
          if (event.key === 'Escape') {
            setEditing(false)
            setError(null)
            setValue(completed)
          }
        }}
        className="h-8 w-16 rounded border border-gray-300 px-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        min={0}
        max={total}
        autoFocus
      />
      <span className="text-sm text-gray-700">/ {total}</span>
      <button
        type="button"
        onClick={handleSave}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
      >
        {isPending ? 'Saving…' : 'Save'}
      </button>
      <button
        type="button"
        onClick={() => {
          setEditing(false)
          setError(null)
          setValue(completed)
        }}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100"
      >
        ✕
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
