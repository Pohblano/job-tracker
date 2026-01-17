// Full edit modal for admin; lets editors update status, progress, ETA, and notes with live validation.
'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { updateJobDetailsAction } from '@/app/admin/actions'
import { type Job, type JobStatus } from '@/lib/jobs/types'
import { calculateProgressPercentage } from '@/lib/jobs/types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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

  const handleSubmit = () => {
    if (!job) return
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
    <Dialog open={Boolean(job)} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Job: {job?.job_number ?? ''}</DialogTitle>
          <DialogDescription>
            Update status, progress, ETA, and notes. Changes apply to TV instantly.
          </DialogDescription>
        </DialogHeader>

        {job && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Number</Label>
                <Input value={job.job_number} disabled />
              </div>
              <div className="space-y-2">
                <Label>Part Number</Label>
                <Input value={job.part_number} disabled />
              </div>
              <div className="space-y-2">
                <Label>Status<span className="ml-1 text-red-600">*</span></Label>
                <Select value={status} onValueChange={(value) => setStatus(value as JobStatus)} disabled={isPending}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pieces Completed<span className="ml-1 text-red-600">*</span></Label>
                <Input
                  type="number"
                  value={piecesCompleted}
                  onChange={(event) => setPiecesCompleted(Number(event.target.value))}
                  min={0}
                  max={job.total_pieces}
                  className="h-11"
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">Progress: {progressPercent}% of {job.total_pieces}</p>
              </div>
              <div className="space-y-2">
                <Label>Total Pieces</Label>
                <Input value={job.total_pieces} disabled />
              </div>
              <div className="space-y-2">
                <Label>Estimated Timeline</Label>
                <Input
                  value={etaText}
                  onChange={(event) => setEtaText(event.target.value)}
                  maxLength={50}
                  placeholder="e.g., 2 days"
                  className="h-11"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={NOTES_LIMIT}
                rows={4}
                disabled={isPending}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Max {NOTES_LIMIT} characters</span>
                <span>
                  {notes.length} / {NOTES_LIMIT}
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
