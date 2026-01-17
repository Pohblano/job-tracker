// Server-side job mutations for SVB; validates business rules before updating Supabase.
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { type Database } from '@/lib/supabase/types'
import { type Job, type JobStatus } from './types'
import { jobEditSchema, jobSchema, progressUpdateSchema } from './validators'

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

  const updatePayload: Database['public']['Tables']['jobs']['Update'] = { status: nextStatus }

  const { error: updateError, data } = await supabase
    .from('jobs')
    .update(updatePayload)
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
    return { error: parsed.error.issues[0]?.message ?? 'Invalid progress update' }
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

  const updatePayload: Database['public']['Tables']['jobs']['Update'] = {
    pieces_completed: parsed.data.pieces_completed,
    total_pieces: parsed.data.total_pieces,
  }

  const { error: updateError, data } = await supabase
    .from('jobs')
    .update(updatePayload)
    .eq('id', jobId)
    .select('pieces_completed,total_pieces')
    .single()

  if (updateError || !data) {
    console.error('Failed to update job progress', updateError)
    return { error: 'Could not update progress' }
  }

  return { data }
}

export async function updateJobDetails(
  jobId: string,
  values: Partial<Pick<Job, 'status' | 'pieces_completed' | 'eta_text' | 'title' | 'description' | 'notes'>>,
): Promise<MutationResult<Job>> {
  const { client, error: serviceError } = getServiceClient()
  if (!client) return { error: serviceError }
  const supabase = client

  const parsed = jobEditSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid job update' }
  }

  const { data: current, error: fetchError } = await supabase
    .from('jobs')
    .select('status,total_pieces,pieces_completed,eta_text,title,description,notes')
    .eq('id', jobId)
    .single()

  if (fetchError || !current) {
    console.error('Failed to load job before edit', fetchError)
    return { error: 'Job not found' }
  }

  const updates: Database['public']['Tables']['jobs']['Update'] = {}

  if (parsed.data.status) {
    updates.status = parsed.data.status
  }

  if (parsed.data.pieces_completed !== undefined) {
    if (parsed.data.pieces_completed < current.pieces_completed) {
      return { error: 'Completed pieces cannot decrease' }
    }
    if (parsed.data.pieces_completed > current.total_pieces) {
      return { error: 'Pieces completed cannot exceed total pieces' }
    }
    updates.pieces_completed = parsed.data.pieces_completed
  }

  if (parsed.data.eta_text !== undefined) {
    updates.eta_text = parsed.data.eta_text ?? null
  }

  if (parsed.data.title !== undefined) {
    const trimmed = parsed.data.title?.trim()
    updates.title = trimmed === '' ? null : trimmed ?? null
  }

  if (parsed.data.description !== undefined) {
    const trimmed = parsed.data.description?.trim()
    updates.description = trimmed === '' ? null : trimmed ?? null
  }

  if (parsed.data.notes !== undefined) {
    const trimmed = parsed.data.notes?.trim()
    updates.notes = trimmed === '' ? null : trimmed ?? null
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'No changes to save' }
  }

  const { data, error } = await supabase.from('jobs').update(updates).eq('id', jobId).select('*').single()

  if (error || !data) {
    console.error('Failed to update job details', error)
    return { error: 'Could not update job' }
  }

  return { data: data as Job }
}

export async function createJob(values: unknown): Promise<MutationResult<Job>> {
  const { client, error: serviceError } = getServiceClient()
  if (!client) return { error: serviceError }
  const supabase = client

  const parsed = jobSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid job payload' }
  }

  const payload = {
    ...parsed.data,
    title: parsed.data.title ?? null,
    description: parsed.data.description ?? null,
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

export async function deleteJob(jobId: string): Promise<MutationResult<{ id: string }>> {
  const { client, error: serviceError } = getServiceClient()
  if (!client) return { error: serviceError }
  const supabase = client

  const { error } = await supabase.from('jobs').delete().eq('id', jobId)

  if (error) {
    console.error('Failed to delete job', error)
    return { error: 'Could not delete job' }
  }

  return { data: { id: jobId } }
}
