// Admin job form using shadcn components
'use client'

import React, { useMemo, useState } from 'react'
import { z } from 'zod'
import { type JobStatus } from '@/lib/jobs/types'
import { jobSchema } from '@/lib/jobs/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type JobFormData = z.infer<typeof jobSchema>

interface JobFormProps {
  submitting: boolean
  serverError?: string | null
  onSubmit: (values: JobFormData) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<keyof JobFormData, string>>

const STATUS_OPTIONS: { label: string; value: JobStatus }[] = [
  { label: 'Received', value: 'RECEIVED' },
  { label: 'Quoted', value: 'QUOTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Completed', value: 'COMPLETED' },
]

export function JobForm({ submitting, serverError, onSubmit, onCancel }: JobFormProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [values, setValues] = useState({
    job_number: 'V-',
    part_number: 'P-',
    title: '',
    description: '',
    total_pieces: '',
    status: 'RECEIVED' as JobStatus,
    date_received: today,
    eta_text: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const parseResult = () =>
    jobSchema.safeParse({
      ...values,
      total_pieces: Number(values.total_pieces),
      pieces_completed: 0,
      title: values.title || undefined,
      description: values.description || undefined,
      eta_text: values.eta_text || undefined,
      date_received: values.date_received || undefined,
    })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = parseResult()

    if (!parsed.success) {
      const errors: FieldErrors = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof JobFormData
        if (!errors[field]) {
          errors[field] = issue.message
        }
      })
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    await onSubmit(parsed.data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Part Number and Job Number */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="part_number">
            Part Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="part_number"
            value={values.part_number}
            onChange={(e) => updateField('part_number', e.target.value)}
            placeholder="P-9911"
            disabled={submitting}
            autoFocus
          />
          {fieldErrors.part_number && (
            <p className="text-sm text-destructive">{fieldErrors.part_number}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_number">
            Job Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="job_number"
            value={values.job_number}
            onChange={(e) => updateField('job_number', e.target.value)}
            placeholder="V-101"
            disabled={submitting}
          />
          {fieldErrors.job_number && (
            <p className="text-sm text-destructive">{fieldErrors.job_number}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Aerospace Dynamics"
          disabled={submitting}
        />
        {fieldErrors.title && (
          <p className="text-sm text-destructive">{fieldErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="e.g., Main Turbine Housing Refurb"
          disabled={submitting}
        />
        {fieldErrors.description && (
          <p className="text-sm text-destructive">{fieldErrors.description}</p>
        )}
      </div>

      {/* Total Pieces and Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="total_pieces">
            Total Pieces <span className="text-destructive">*</span>
          </Label>
          <Input
            id="total_pieces"
            type="number"
            min={1}
            value={values.total_pieces}
            onChange={(e) => updateField('total_pieces', e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.total_pieces && (
            <p className="text-sm text-destructive">{fieldErrors.total_pieces}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.status}
            onValueChange={(value) => updateField('status', value)}
            disabled={submitting}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.status && (
            <p className="text-sm text-destructive">{fieldErrors.status}</p>
          )}
        </div>
      </div>

      {/* Date Received and ETA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date_received">Date Received</Label>
          <Input
            id="date_received"
            type="date"
            value={values.date_received}
            onChange={(e) => updateField('date_received', e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.date_received && (
            <p className="text-sm text-destructive">{fieldErrors.date_received}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="eta_text">ETA</Label>
          <Input
            id="eta_text"
            value={values.eta_text}
            onChange={(e) => updateField('eta_text', e.target.value)}
            placeholder="Today 4:00 PM"
            disabled={submitting}
          />
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 sm:text-sm">
        Job will appear on the TV display immediately after creation.
      </div>

      {serverError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive sm:text-sm">
          {serverError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? 'Creating...' : 'Create Job'}
        </Button>
      </div>
    </form>
  )
}
