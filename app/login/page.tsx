// Login page for admin authentication; uses shadcn form controls with framer-motion transitions.
'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { loginAction } from './actions'

type AuthState = 'idle' | 'submitting' | 'redirecting'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authState, setAuthState] = useState<AuthState>('idle')

  const isBusy = authState !== 'idle'

  const backgroundVariants: Variants = useMemo(
    () => ({
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 0.8, 0.44, 1] } },
      exit: { opacity: 0, y: -12, transition: { duration: 0.4, ease: [0.37, 0, 0.63, 1] } },
    }),
    [],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setAuthState('submitting')

    try {
      const result = await loginAction(username, password)
      if (result.error) {
        setError(result.error)
        setAuthState('idle')
        toast({
          title: 'Login failed',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      setAuthState('redirecting')
      toast({
        title: 'Login successful',
        description: 'Redirecting to admin…',
      })
      setTimeout(() => {
        router.push('/admin')
        router.refresh()
      }, 3000)
    } catch {
      setError('An unexpected error occurred')
      setAuthState('idle')
      toast({
        title: 'Unexpected error',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4">
      <motion.div
        className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-100 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-indigo-100 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      />

      <AnimatePresence>
        <motion.div
          key="card"
          variants={backgroundVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-sm"
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>Enter your credentials to access the admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isBusy}>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    autoFocus
                    required
                    disabled={isBusy}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    disabled={isBusy}
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full" disabled={isBusy}>
                  {authState === 'redirecting' ? 'Redirecting…' : authState === 'submitting' ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {authState === 'redirecting' && (
          <motion.div
            key="overlay"
            className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <motion.span
                className="h-3 w-3 rounded-full bg-blue-600"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
              />
              <span className="text-sm font-medium text-gray-800">Preparing admin view…</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
