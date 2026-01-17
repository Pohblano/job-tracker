'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/login/actions'

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => logoutAction()}
      className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}
