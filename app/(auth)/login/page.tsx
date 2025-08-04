'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login, user, clearSession } = useAuth()

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin/dashboard')
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
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', { email, password: '***' })
      const user = await login(email, password)
      console.log('Login successful:', user)
      
      // Redirect based on user role
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin/dashboard')
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
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Lab Inventory System
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>Demo Credentials:</p>
              <p>Email: admin@lab.com</p>
              <p>Password: admin123</p>
            </div>

            <div className="text-center">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  clearSession()
                  setError('Session cleared. Please log in again.')
                }}
                className="text-xs"
              >
                Clear Session
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 