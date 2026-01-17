// Inline progress updater for admin; matches the quick-edit spec with validation and optimistic feedback.
'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { updateJobProgressAction } from '@/app/admin/actions'
import { Slider } from '@/components/ui/slider'

interface InlineProgressUpdateProps {
  jobId: string
  completed: number
  total: number
  onSaved: (value: number) => void
}

export function InlineProgressUpdate({ jobId, completed, total, onSaved }: InlineProgressUpdateProps) {
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

  const handleCommit = (raw: number | undefined) => {
    const numericValue = Number(raw ?? value)
    if (!Number.isInteger(numericValue)) {
      setError('Must be an integer')
      return
    }
    if (numericValue < 0 || numericValue > total) {
      setError(`Must be between 0 and ${total}`)
      return
    }
    if (numericValue === completed) {
      setError(null)
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
    })
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono font-semibold text-gray-900">{value}</span>
        <span className="text-xs text-muted-foreground">
          of {total} {savedAt ? '✓' : ''}
        </span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={total}
        step={1}
        onValueChange={(vals) => setValue(vals[0] ?? 0)}
        onValueCommit={(vals) => handleCommit(vals[0])}
        disabled={isPending}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {error ? <span className="text-red-600">{error}</span> : <span>{isPending ? 'Saving…' : 'Drag to update'}</span>}
        {savedAt && <span className="text-green-700">Saved</span>}
      </div>
    </div>
  )
}
