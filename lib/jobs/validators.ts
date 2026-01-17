// Zod validators for SVB job data; enforce the business rules before hitting Supabase.
import { z } from 'zod'
import { type JobStatus } from './types'

export const jobStatusSchema = z.enum(['RECEIVED', 'QUOTED', 'IN_PROGRESS', 'COMPLETED'])
export const jobPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])

const STATUS_FLOW_ORDER: JobStatus[] = ['RECEIVED', 'QUOTED', 'IN_PROGRESS', 'COMPLETED']

const etaSchema = z
  .string()
  .trim()
  .max(50, 'ETA must be 50 characters or fewer')
  .optional()
  .nullable()

export const jobSchema = z
  .object({
    job_number: z.string().regex(/^V-\d+$/, 'Job number must use the V-### format'),
    part_number: z.string().regex(/^P-.+$/, 'Part number must start with P-'),
    total_pieces: z.number().int().min(1, 'Total pieces must be at least 1'),
    pieces_completed: z.number().int().min(0, 'Pieces completed cannot be negative').default(0),
    status: jobStatusSchema.default('RECEIVED'),
    eta_text: etaSchema,
    date_received: z.string().optional(),
    priority: jobPrioritySchema.optional().nullable(),
    shop_area: z.string().trim().max(100).optional().nullable(),
    machine: z.string().trim().max(100).optional().nullable(),
    notes: z.string().trim().max(500, 'Notes are limited to 500 characters').optional().nullable(),
  })
  .refine((value) => value.pieces_completed <= value.total_pieces, {
    message: 'Pieces completed must be less than or equal to total pieces',
    path: ['pieces_completed'],
  })

export const progressUpdateSchema = z
  .object({
    pieces_completed: z.number().int().min(0),
    total_pieces: z.number().int().min(1),
  })
  .superRefine((value, ctx) => {
    if (value.pieces_completed > value.total_pieces) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pieces completed cannot exceed total pieces',
        path: ['pieces_completed'],
      })
    }
  })

export function isForwardStatusTransition(current: JobStatus, next: JobStatus) {
  const currentIndex = STATUS_FLOW_ORDER.indexOf(current)
  const nextIndex = STATUS_FLOW_ORDER.indexOf(next)
  if (currentIndex === -1 || nextIndex === -1) return false
  return nextIndex >= currentIndex
}
