// Pure helpers for preparing job data for the TV/admin views; safe to import in client components.
import { type Job, type JobStatus, JOB_STATUS_ORDER, shouldHideCompletedJob } from './types'

// Cap the TV rotation to the most relevant 50 jobs to keep the feed legible.
const MAX_JOBS_SHOWN = 50

function statusSortValue(status: JobStatus) {
  const rank = JOB_STATUS_ORDER.indexOf(status)
  return rank === -1 ? JOB_STATUS_ORDER.length : rank
}

export function sortJobs(jobs: Job[]) {
  return [...jobs].sort((a, b) => {
    const statusDiff = statusSortValue(a.status) - statusSortValue(b.status)
    if (statusDiff !== 0) return statusDiff
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
}

export function prepareJobsForDisplay(jobs: Job[]) {
  return sortJobs(jobs.filter((job) => !shouldHideCompletedJob(job))).slice(0, MAX_JOBS_SHOWN)
}
