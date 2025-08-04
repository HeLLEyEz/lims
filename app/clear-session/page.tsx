'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ClearSessionPage() {
  const router = useRouter()
  const { clearSession } = useAuth()

  useEffect(() => {
    clearSession()
    router.push('/login')
  }, [clearSession, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Clearing Session...</h1>
        <p className="text-gray-600">Redirecting to login page...</p>
      </div>
    </div>
  )
} 