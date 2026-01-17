// Admin job form for SVB; uses the shared Zod validators to enforce business rules before calling server actions.
'use client'

import React, { useMemo, useState } from 'react'
import { z } from 'zod'
import { type JobStatus } from '@/lib/jobs/types'
import { jobSchema } from '@/lib/jobs/validators'

export type JobFormData = z.infer<typeof jobSchema>

interface JobFormProps {
  submitting: boolean
  serverError?: string | null
  onSubmit: (values: JobFormData) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<keyof JobFormData, string>>

const STATUS_OPTIONS: JobStatus[] = ['RECEIVED', 'QUOTED', 'IN_PROGRESS', 'COMPLETED']

export function JobForm({ submitting, serverError, onSubmit, onCancel }: JobFormProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [values, setValues] = useState({
    job_number: 'V-',
    part_number: 'P-',
    total_pieces: '',
    status: 'RECEIVED' as JobStatus,
    date_received: today,
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
      eta_text: undefined,
      date_received: values.date_received || undefined,
    })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = parseResult()

    if (!parsed.success) {
      const errors: FieldErrors = {}
      parsed.error.errors.forEach((issue) => {
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <FormField
          label="Job Number"
          required
          value={values.job_number}
          onChange={(value) => updateField('job_number', value)}
          error={fieldErrors.job_number}
          disabled={submitting}
          inputProps={{ name: 'job_number', placeholder: 'V-101', autoFocus: true }}
        />

        <FormField
          label="Part Number"
          required
          value={values.part_number}
          onChange={(value) => updateField('part_number', value)}
          error={fieldErrors.part_number}
          disabled={submitting}
          inputProps={{ name: 'part_number', placeholder: 'P-9911' }}
        />

        <FormField
          label="Total Pieces"
          required
          value={values.total_pieces}
          onChange={(value) => updateField('total_pieces', value)}
          error={fieldErrors.total_pieces}
          disabled={submitting}
          inputProps={{ name: 'total_pieces', type: 'number', min: 1, inputMode: 'numeric' }}
        />

        <FormField
          label="Date Received"
          value={values.date_received}
          onChange={(value) => updateField('date_received', value)}
          error={fieldErrors.date_received}
          disabled={submitting}
          inputProps={{ name: 'date_received', type: 'date' }}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
            <span className="ml-1 text-red-600">*</span>
          </label>
          <div className="relative">
            <select
              name="status"
              value={values.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="block h-12 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {fieldErrors.status && <p className="mt-1 text-sm text-red-600">{fieldErrors.status}</p>}
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Job will appear on the TV display immediately after creation.
      </div>

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={submitting}
        >
          {submitting ? 'Creating…' : 'Create Job'}
        </button>
      </div>
    </form>
  )
}

interface FormFieldProps {
  label: string
  value: string | number
  required?: boolean
  error?: string
  onChange: (value: string) => void
  disabled?: boolean
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

function FormField({ label, value, required, error, onChange, disabled, inputProps }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      <input
        {...inputProps}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`block h-12 w-full rounded-md border px-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 ${
          error ? 'border-red-500' : 'border-gray-300 bg-gray-50'
        }`}
        disabled={disabled || inputProps?.disabled}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
