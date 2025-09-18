import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@prisma/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  isActive: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: UserRole
}

// Authentication functions
export const auth = {
  // Sign in with email and password
  async signIn({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // Get user details from our database and update last login
    if (data.user) {
      const userDetails = await getUserDetails(data.user.id)
      // Update last login timestamp
      await updateLastLogin(data.user.id)
      return { user: data.user, userDetails }
    }
    
    return { user: data.user, userDetails: null }
  },

  // Sign up new user
  async signUp({ email, password, firstName, lastName, role = 'USER' }: RegisterData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    
    // Create user record in our database
    if (data.user) {
      const userDetails = await createUserDetails({
        id: data.user.id,
        email,
        firstName,
        lastName,
        role,
      })
      return { user: data.user, userDetails }
    }
    
    return { user: data.user, userDetails: null }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    if (user) {
      const userDetails = await getUserDetails(user.id)
      // Update last login timestamp
      await updateLastLogin(user.id)
      return { user, userDetails }
    }
    
    return { user: null, userDetails: null }
  },

  // Get user session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database functions for user management
async function getUserDetails(userId: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (response.ok) {
      return await response.json()
    }
    
    // If user not found in database, try to create them
    if (response.status === 404) {
      console.log('User not found in database, attempting to create...')
      
      // Get user info from Supabase Auth
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
      if (error || !supabaseUser) {
        console.error('Error getting Supabase user:', error)
        return null
      }
      
      // Create user in database (without password since they're authenticated via Supabase)
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: supabaseUser.id,
          email: supabaseUser.email,
          username: supabaseUser.email?.split('@')[0] || 'user',
          firstName: supabaseUser.user_metadata?.firstName || '',
          lastName: supabaseUser.user_metadata?.lastName || '',
          role: 'USER', // Default role
          password: 'temp-password' // Temporary password since they're authenticated via Supabase
        }),
      })
      
      if (createResponse.ok) {
        return await createResponse.json()
      } else {
        console.error('Failed to create user in database')
        return null
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching user details:', error)
    return null
  }
}

async function updateLastLogin(userId: string): Promise<void> {
  try {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updateLastLogin: true }),
    })
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

async function createUserDetails(userData: {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
}): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Error creating user details:', error)
    return null
  }
}

// Permission checking functions
export const permissions = {
  // Check if user can manage users (Admin only)
  canManageUsers(userRole: UserRole): boolean {
    return userRole === 'ADMIN'
  },

  // Check if user can manage inventory (Admin, LAB_TECHNICIAN)
  canManageInventory(userRole: UserRole): boolean {
    return ['ADMIN', 'LAB_TECHNICIAN'].includes(userRole)
  },

  // Check if user can perform transactions (All authenticated users)
  canPerformTransactions(userRole: UserRole): boolean {
    return ['ADMIN', 'LAB_TECHNICIAN', 'USER', 'RESEARCHER', 'MANUFACTURING_ENGINEER'].includes(userRole)
  },

  // Check if user can view reports (Admin, LAB_TECHNICIAN, RESEARCHER)
  canViewReports(userRole: UserRole): boolean {
    return ['ADMIN', 'LAB_TECHNICIAN', 'RESEARCHER'].includes(userRole)
  },

  // Check if user can manage categories (Admin only)
  canManageCategories(userRole: UserRole): boolean {
    return userRole === 'ADMIN'
  }
} 