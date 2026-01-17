'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/login/actions'

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => logoutAction()}
      className="text-muted-foreground hover:text-gray-900"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}
