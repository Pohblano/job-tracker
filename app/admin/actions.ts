// Server actions for admin job updates; wraps mutations with cache revalidation and admin auth checks.
'use server'

import { revalidatePath } from 'next/cache'
import { ensureAdminRequest, ensureAdminSession } from '@/lib/auth'
import { createJob, deleteJob, updateJobDetails, updateJobProgress, updateJobStatus } from '@/lib/jobs/mutations'
import { type JobStatus } from '@/lib/jobs/types'

export async function updateJobStatusAction(jobId: string, nextStatus: JobStatus) {
  const auth = ensureAdminSession()
  if (!auth.success) {
    return { error: auth.error }
  }

  const result = await updateJobStatus(jobId, nextStatus)
  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/admin')
  revalidatePath('/tv')
  return { success: true, status: result.data?.status }
}

export async function updateJobProgressAction(jobId: string, pieces_completed: number, total_pieces: number) {
  const auth = ensureAdminSession()
  if (!auth.success) {
    return { error: auth.error }
  }

  const result = await updateJobProgress(jobId, { pieces_completed, total_pieces })
  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/admin')
  revalidatePath('/tv')
  return { success: true, progress: result.data }
}

export async function createJobAction(values: unknown) {
  const auth = ensureAdminSession()
  if (!auth.success) {
    return { error: auth.error }
  }

  const result = await createJob(values)
  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/admin')
  revalidatePath('/tv')
  return { success: true, job: result.data }
}

export async function deleteJobAction(jobId: string) {
  const auth = ensureAdminSession()
  if (!auth.success) {
    return { error: auth.error }
  }

  const result = await deleteJob(jobId)
  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/admin')
  revalidatePath('/tv')
  return { success: true }
}

export async function updateJobDetailsAction(jobId: string, values: unknown) {
  const auth = ensureAdminSession()
  if (!auth.success) {
    return { error: auth.error }
  }

  const result = await updateJobDetails(jobId, values as Record<string, unknown>)
  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/admin')
  revalidatePath('/tv')
  return { success: true, job: result.data }
}
