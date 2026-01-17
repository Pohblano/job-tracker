// Client-side logger with toast surface for user-facing errors and console logging for developers.
'use client'

import { toast } from 'sonner'
import { logError, logInfo, logWarn } from '@/lib/logger'

type LoggerContext = string

export function useLogger(context: LoggerContext = 'app') {
  const formatMeta = (meta?: Record<string, unknown>) => ({
    context,
    ...(meta ?? {}),
  })

  const info = (message: string, meta?: Record<string, unknown>) => {
    logInfo(message, formatMeta(meta))
  }

  const warn = (message: string, meta?: Record<string, unknown>) => {
    logWarn(message, formatMeta(meta))
  }

  const error = (message: string, meta?: Record<string, unknown>) => {
    logError(message, formatMeta(meta))
    toast.error('Something went wrong', { description: message })
  }

  return { info, warn, error }
}
