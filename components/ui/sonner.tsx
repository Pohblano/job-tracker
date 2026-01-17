'use client'
// Sonner-based toaster wrapper for SVB notifications.
import * as React from 'react'
import { Toaster as Sonner } from 'sonner'
import { cn } from '@/lib/utils'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ className, ...props }: ToasterProps) {
  return (
    <Sonner
      className={cn('toaster group', className)}
      toastOptions={{
        classNames: {
          toast:
            'group toast border border-gray-200 bg-white text-gray-900 shadow-lg data-[type=error]:border-red-200 data-[type=error]:bg-red-50 data-[type=error]:text-red-700',
          description: 'text-gray-700 group-[.toast]:text-gray-700',
          actionButton: 'bg-gray-900 text-white hover:bg-gray-800',
          cancelButton: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        },
      }}
      {...props}
    />
  )
}
