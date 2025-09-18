'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, AuthUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  updateUser: (userData: AuthUser) => void
  clearSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const userDetails = await getUserDetails(session.user.id)
          if (userDetails) {
            setUser(userDetails)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const { user: supabaseUser, userDetails } = await auth.getCurrentUser()
      if (userDetails) {
        setUser(userDetails)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserDetails = async (userId: string): Promise<AuthUser | null> => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Error fetching user details:', error)
      return null
    }
  }

  const login = async (email: string, password: string): Promise<AuthUser> => {
    try {
      const { user: supabaseUser, userDetails } = await auth.signIn({ email, password })
      
      if (!userDetails) {
        throw new Error('User details not found')
      }
      
      setUser(userDetails)
      return userDetails
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const clearSession = () => {
    setUser(null)
  }

  const updateUser = (userData: AuthUser) => {
    setUser(userData)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    clearSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 