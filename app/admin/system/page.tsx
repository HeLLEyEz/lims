'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package,
  LogOut,
  User,
  BarChart3,
  LayoutDashboard,
  FileText,
  Settings,
  Shield,
  ArrowLeft,
  Database
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

export default function AdminSystemPage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) {
      return firstName[0].toUpperCase()
    }
    if (lastName) {
      return lastName[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Side Panel */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Full System Access</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/admin/overview">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-3 h-4 w-4" />
                Overview
              </Button>
            </Link>
            
            <Link href="/admin/components">
              <Button variant="ghost" className="w-full justify-start">
                <Package className="mr-3 h-4 w-4" />
                Components
              </Button>
            </Link>
            
            <Link href="/admin/transactions">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="mr-3 h-4 w-4" />
                Transactions
              </Button>
            </Link>
            
            <Link href="/admin/reports">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-3 h-4 w-4" />
                Reports
              </Button>
            </Link>
            
            <Link href="/admin/users">
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-3 h-4 w-4" />
                Users
              </Button>
            </Link>
            
            <Button variant="default" className="w-full justify-start">
              <Settings className="mr-3 h-4 w-4" />
              System
            </Button>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback>
                      {getUserInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Role: {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Manage Users</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-4">
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">System Settings</h2>
                <p className="text-gray-600">System configuration and settings</p>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>Manage system configuration and settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Database Status</Label>
                        <Badge variant="default" className="mt-1">Connected</Badge>
                      </div>
                      <div>
                        <Label>System Version</Label>
                        <p className="text-sm text-gray-600 mt-1">v1.0.0</p>
                      </div>
                      <div>
                        <Label>Last Backup</Label>
                        <p className="text-sm text-gray-600 mt-1">2024-01-15 10:30 AM</p>
                      </div>
                      <div>
                        <Label>System Uptime</Label>
                        <p className="text-sm text-gray-600 mt-1">15 days, 8 hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Maintenance</CardTitle>
                  <CardDescription>System backup and maintenance operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button variant="outline">
                        Create Backup
                      </Button>
                      <Button variant="outline">
                        System Maintenance
                      </Button>
                      <Button variant="outline">
                        Clear Cache
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Recent system activity and logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">User login: admin@example.com</span>
                      <span className="text-xs text-gray-500">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Component added: Arduino Uno R3</span>
                      <span className="text-xs text-gray-500">15 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Transaction processed: OUTWARD</span>
                      <span className="text-xs text-gray-500">1 hour ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 