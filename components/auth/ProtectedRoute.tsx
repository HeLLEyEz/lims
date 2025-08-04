'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { permissions } from '@/lib/auth'
import { UserRole } from '@prisma/client'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: keyof typeof permissions
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      // Check role requirement
      if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate role-based dashboard
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin')
            break
          case 'LAB_TECHNICIAN':
            router.push('/lab-tech')
            break
          case 'RESEARCHER':
            router.push('/researcher')
            break
          case 'MANUFACTURING_ENGINEER':
            router.push('/manufacturing')
            break
          case 'USER':
          default:
            router.push('/user')
            break
        }
        return
      }

      // Check permission requirement
      if (requiredPermission && !permissions[requiredPermission](user.role)) {
        // Redirect to appropriate role-based dashboard
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin')
            break
          case 'LAB_TECHNICIAN':
            router.push('/lab-tech')
            break
          case 'RESEARCHER':
            router.push('/researcher')
            break
          case 'MANUFACTURING_ENGINEER':
            router.push('/manufacturing')
            break
          case 'USER':
          default:
            router.push('/user')
            break
        }
        return
      }
    }
  }, [user, loading, router, requiredRole, requiredPermission])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  // Check permission requirement
  if (requiredPermission && !permissions[requiredPermission](user.role)) {
    return null
  }

  return <>{children}</>
} 