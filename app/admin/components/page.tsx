'use client'

import { Button } from '@/components/ui/button'
import { 
  Package,
  LogOut,
  User,
  BarChart3,
  LayoutDashboard,
  FileText,
  Settings,
  Shield,
  ArrowLeft
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { ComponentSearch } from '@/components/inventory/ComponentSearch'

export default function AdminComponentsPage() {
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
            
            <Button variant="default" className="w-full justify-start">
              <Package className="mr-3 h-4 w-4" />
              Components
            </Button>
            
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
            
            <Link href="/admin/system">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-3 h-4 w-4" />
                System
              </Button>
            </Link>
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
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Component Management</h1>
            <p className="text-gray-600">Search and manage inventory components.</p>
          </div>

          {/* Component Search */}
          <div className="space-y-6">
            <ComponentSearch />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 