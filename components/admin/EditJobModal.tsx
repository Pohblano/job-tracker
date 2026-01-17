// Full edit modal for admin; lets editors update status, progress, ETA, and notes with live validation.
'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { updateJobDetailsAction } from '@/app/admin/actions'
import { type Job, type JobStatus } from '@/lib/jobs/types'
import { calculateProgressPercentage } from '@/lib/jobs/types'

interface EditJobModalProps {
  job: Job | null
  onClose: () => void
  onSaved: (job: Job) => void
}

const STATUS_OPTIONS: JobStatus[] = ['RECEIVED', 'QUOTED', 'IN_PROGRESS', 'COMPLETED']
const NOTES_LIMIT = 500

export function EditJobModal({ job, onClose, onSaved }: EditJobModalProps) {
  const [status, setStatus] = useState<JobStatus>('RECEIVED')
  const [piecesCompleted, setPiecesCompleted] = useState(0)
  const [etaText, setEtaText] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!job) return
    setStatus(job.status)
    setPiecesCompleted(job.pieces_completed)
    setEtaText(job.eta_text ?? '')
    setNotes(job.notes ?? '')
    setError(null)
  }, [job])

  const progressPercent = useMemo(
    () => calculateProgressPercentage(piecesCompleted, job?.total_pieces ?? 1),
    [piecesCompleted, job?.total_pieces],
  )

  if (!job) return null

  const handleSubmit = () => {
    if (piecesCompleted < 0 || piecesCompleted > job.total_pieces) {
      setError(`Pieces completed must be between 0 and ${job.total_pieces}`)
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await updateJobDetailsAction(job.id, {
        status,
        pieces_completed: piecesCompleted,
        eta_text: etaText.trim() === '' ? null : etaText.trim(),
        notes: notes.trim() === '' ? null : notes.trim(),
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.job) {
        onSaved(result.job)
      }

      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
      aria-label="Edit job dialog backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Job: {job.job_number}</h2>
            <p className="text-sm text-gray-600">
              {job.part_number} • Total Pieces: {job.total_pieces}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            aria-label="Close edit job dialog"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Status" required>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as JobStatus)}
                className="block h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Pieces Completed" required>
              <input
                type="number"
                value={piecesCompleted}
                onChange={(event) => setPiecesCompleted(Number(event.target.value))}
                onFocus={(event) => event.target.select()}
                min={0}
                max={job.total_pieces}
                className="block h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
              />
              <p className="text-xs text-gray-600">Progress: {progressPercent}%</p>
            </Field>

            <Field label="Estimated Timeline">
              <input
                type="text"
                value={etaText}
                onChange={(event) => setEtaText(event.target.value)}
                maxLength={50}
                placeholder="e.g., 2 days"
                className="block h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
              />
            </Field>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={NOTES_LIMIT}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
              />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Max {NOTES_LIMIT} characters</span>
                <span>
                  {notes.length} / {NOTES_LIMIT}
                </span>
              </div>
            </Field>
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isPending}
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
    </div>
  )
}
