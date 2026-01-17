// Server-side job mutations for SVB; validates business rules before updating Supabase.
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { type Job, type JobStatus } from './types'
import { isForwardStatusTransition, jobSchema, progressUpdateSchema } from './validators'

interface MutationResult<T> {
  data?: T
  error?: string
}

function getServiceClient() {
  try {
    return { client: createServiceRoleSupabaseClient() }
  } catch (error) {
    console.error('Service role Supabase client unavailable for admin mutation', error)
    return { error: 'Server missing SUPABASE_SERVICE_ROLE_KEY; admin actions are disabled.' }
  }
}

export async function updateJobStatus(jobId: string, nextStatus: JobStatus): Promise<MutationResult<{ status: JobStatus }>> {
  const { client, error: serviceError } = getServiceClient()
  if (!client) return { error: serviceError }
  const supabase = client

  const { data: jobRow, error: fetchError } = await supabase.from('jobs').select('status').eq('id', jobId).single()
  const currentStatus = (jobRow as { status: JobStatus } | null)?.status

  if (fetchError || !currentStatus) {
    console.error('Failed to load job before status update', fetchError)
    return { error: 'Job not found' }
  }

  if (!isForwardStatusTransition(currentStatus, nextStatus)) {
    return { error: 'Status must move forward only' }
  }

  const { error: updateError, data } = await supabase
    .from('jobs')
    .update({ status: nextStatus })
    .eq('id', jobId)
    .select('status')
    .single()

  if (updateError || !data) {
    console.error('Failed to update job status', updateError)
    return { error: 'Could not update status' }
  }

  return { data: { status: data.status } }
}

export async function updateJobProgress(
  jobId: string,
  values: { pieces_completed: number; total_pieces: number },
): Promise<MutationResult<{ pieces_completed: number; total_pieces: number }>> {
  const { client, error: serviceError } = getServiceClient()
  if (!client) return { error: serviceError }
  const supabase = client

  const parsed = progressUpdateSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid progress update' }
  }

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('pieces_completed,total_pieces')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    console.error('Failed to load job before progress update', fetchError)
    return { error: 'Job not found' }
  }

  // Enforce monotonic completion: cannot decrease completed pieces.
  if (parsed.data.pieces_completed < job.pieces_completed) {
    return { error: 'Completed pieces cannot decrease' }
  }

  const { error: updateError, data } = await supabase
    .from('jobs')
    .update({
      pieces_completed: parsed.data.pieces_completed,
      total_pieces: parsed.data.total_pieces,
    })
    .eq('id', jobId)
    .select('pieces_completed,total_pieces')
    .single()

  if (updateError || !data) {
    console.error('Failed to update job progress', updateError)
    return { error: 'Could not update progress' }
  }

  return { data }
}

export async function createJob(values: unknown): Promise<MutationResult<Job>> {
  const { client, error: serviceError } = getServiceClient()
  if (!client) return { error: serviceError }
  const supabase = client

  const parsed = jobSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid job payload' }
  }

  const payload = {
    ...parsed.data,
    eta_text: parsed.data.eta_text ?? null,
    priority: parsed.data.priority ?? null,
    shop_area: parsed.data.shop_area ?? null,
    machine: parsed.data.machine ?? null,
    notes: parsed.data.notes ?? null,
    date_received: parsed.data.date_received || new Date().toISOString().split('T')[0],
  }

  const { data, error } = await supabase.from('jobs').insert(payload).select('*').single()

  if (error || !data) {
    const isUniqueViolation = (error as { code?: string } | null)?.code === '23505'
    const message = isUniqueViolation ? 'Job number must be unique' : 'Could not create job'
    console.error('Failed to create job', error)
    return { error: message }
  }

  return { data }
}
