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
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

export default function LabTechOverviewPage() {
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
    <ProtectedRoute requiredRole="LAB_TECHNICIAN">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Side Panel */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lab Technician</h1>
                <p className="text-sm text-gray-600">Lab Operations</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/lab-tech">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            <Button variant="default" className="w-full justify-start">
              <BarChart3 className="mr-3 h-4 w-4" />
              Overview
            </Button>
            
            <Link href="/lab-tech/components">
              <Button variant="ghost" className="w-full justify-start">
                <Package className="mr-3 h-4 w-4" />
                Components
              </Button>
            </Link>
            
            <Link href="/lab-tech/transactions">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="mr-3 h-4 w-4" />
                Transactions
              </Button>
            </Link>
            
            <Link href="/lab-tech/reports">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-3 h-4 w-4" />
                Reports
              </Button>
            </Link>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>
                      {getUserInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/lab-tech" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Lab Overview</h1>
            <p className="text-gray-600">Monitor lab operations and component usage.</p>
          </div>

          {/* Analytics Charts */}
          <div className="space-y-6">
            <DashboardCharts />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 