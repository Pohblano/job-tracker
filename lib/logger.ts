// Lightweight logging utilities for SVB; keeps console output structured by level.
export type LogLevel = 'info' | 'warn' | 'error'

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const prefix = `[${level.toUpperCase()}]`
  const payload = meta ? { meta } : undefined

  if (level === 'error') {
    console.error(prefix, message, payload)
  } else if (level === 'warn') {
    console.warn(prefix, message, payload)
  } else {
    console.info(prefix, message, payload)
  }
}

export function logInfo(message: string, meta?: Record<string, unknown>) {
  write('info', message, meta)
}

export function logWarn(message: string, meta?: Record<string, unknown>) {
  write('warn', message, meta)
}

export function logError(message: string, meta?: Record<string, unknown>) {
  write('error', message, meta)
}
