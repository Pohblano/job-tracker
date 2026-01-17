// Client-side logger with toast surface for user-facing errors and console logging for developers.
'use client'

import { useToast } from '@/components/ui/use-toast'
import { logError, logInfo, logWarn, type LogLevel } from '@/lib/logger'

type LoggerContext = string

export function useLogger(context: LoggerContext = 'app') {
  const { toast } = useToast()

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
    toast({
      title: 'Something went wrong',
      description: message,
      variant: 'destructive',
    })
  }

  return { info, warn, error }
}
