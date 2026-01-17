// Job domain types and helpers for SVB; keeps TV/admin logic aligned with the database contract.
import { type Database } from '@/lib/supabase/types'

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobStatus = Job['status']
export type JobPriority = Job['priority']

export const JOB_STATUS_ORDER: JobStatus[] = ['IN_PROGRESS', 'QUOTED', 'RECEIVED', 'COMPLETED']
export const COMPLETED_VISIBILITY_DAYS = 7

export function getStatusRank(status: JobStatus) {
  const index = JOB_STATUS_ORDER.indexOf(status)
  return index === -1 ? JOB_STATUS_ORDER.length : index
}

export function calculateProgressPercentage(piecesCompleted: number, totalPieces: number) {
  if (totalPieces <= 0) return 0
  const percentage = Math.round((piecesCompleted / totalPieces) * 100)
  return Math.max(0, Math.min(100, percentage))
}

export function shouldHideCompletedJob(job: Job) {
  if (job.status !== 'COMPLETED') return false
  const completedDate = new Date(job.updated_at)
  const now = new Date()
  const daysSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
  // Completed jobs stay visible on TV for a week, then drop from rotation per design guidance.
  return daysSinceCompletion > COMPLETED_VISIBILITY_DAYS
}
