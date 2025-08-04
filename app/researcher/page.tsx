'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Search,
  Filter,
  LogOut,
  User,
  BarChart3,
  LayoutDashboard,
  FileText,
  Microscope,
  BookOpen
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ComponentSearch } from '@/components/inventory/ComponentSearch'
import { TransactionManager } from '@/components/transactions/TransactionManager'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { LowStockAlerts } from '@/components/dashboard/LowStockAlerts'
import { OldStockReport } from '@/components/dashboard/OldStockReport'

// Mock data - replace with actual API calls
const mockStats = {
  totalComponents: 1247,
  lowStockItems: 23,
  totalCategories: 14,
  totalValue: 45678.50,
  researchProjects: 12,
  dataPoints: 2456
}

const mockRecentTransactions = [
  {
    id: '1',
    component: 'Arduino Uno R3',
    type: 'OUTWARD',
    quantity: 5,
    user: 'John Doe',
    date: '2024-01-15T10:30:00Z',
    project: 'IoT Research Project'
  },
  {
    id: '2',
    component: 'Raspberry Pi 4',
    type: 'INWARD',
    quantity: 10,
    user: 'Jane Smith',
    date: '2024-01-15T09:15:00Z',
    project: 'AI Research Lab'
  },
  {
    id: '3',
    component: 'LED Strip WS2812B',
    type: 'OUTWARD',
    quantity: 2,
    user: 'Mike Johnson',
    date: '2024-01-14T16:45:00Z',
    project: 'Optical Research'
  }
]

export default function ResearcherDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, logout } = useAuth()

  useEffect(() => {
    // Fetch categories
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Analytics Charts */}
            <DashboardCharts />
          </div>
        )
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Research Component Search</CardTitle>
                <CardDescription>Find components for research projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Components</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name, part number, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-48">
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Research Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Research Transactions</CardTitle>
                <CardDescription>Latest component usage in research projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{transaction.component}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.project} • {transaction.user}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={transaction.type === 'INWARD' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                        <span className="font-medium">{transaction.quantity}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case 'components':
        return <ComponentSearch />
      case 'transactions':
        return <TransactionManager />
      case 'reports':
        return (
          <div className="space-y-8">
            <LowStockAlerts />
            <OldStockReport />
          </div>
        )
      case 'research':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Research Projects
                </CardTitle>
                <CardDescription>Manage and track research project requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium">IoT Research Project</h3>
                      <p className="text-sm text-gray-600">Components needed: 15</p>
                      <Badge variant="outline" className="mt-2">Active</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium">AI Research Lab</h3>
                      <p className="text-sm text-gray-600">Components needed: 8</p>
                      <Badge variant="outline" className="mt-2">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return <DashboardCharts />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Side Panel */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Microscope className="h-6 w-6 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Researcher</h1>
                <p className="text-sm text-gray-600">Analytics & Reports</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="mr-3 h-4 w-4" />
              Overview
            </Button>
            
            <Button
              variant={activeTab === 'components' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('components')}
            >
              <Package className="mr-3 h-4 w-4" />
              Components
            </Button>
            
            <Button
              variant={activeTab === 'transactions' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('transactions')}
            >
              <FileText className="mr-3 h-4 w-4" />
              Transactions
            </Button>
            
            <Button
              variant={activeTab === 'reports' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 className="mr-3 h-4 w-4" />
              Reports
            </Button>
            
            <Button
              variant={activeTab === 'research' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('research')}
            >
              <BookOpen className="mr-3 h-4 w-4" />
              Research
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
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeTab === 'dashboard' ? 'Research Analytics Dashboard' : 
                   activeTab === 'overview' ? 'Research Overview' :
                   activeTab === 'components' ? 'Component Search' :
                   activeTab === 'transactions' ? 'Transaction History' :
                   activeTab === 'reports' ? 'Research Reports' :
                   activeTab === 'research' ? 'Research Projects' : 'Research Dashboard'}
                </h2>
                <p className="text-gray-600">
                  {activeTab === 'dashboard' ? 'Research analytics and data insights' :
                   activeTab === 'overview' ? 'Quick search and research activity overview' :
                   activeTab === 'components' ? 'Search and browse available components' :
                   activeTab === 'transactions' ? 'Track research component usage' :
                   activeTab === 'reports' ? 'Analytics and research reports' :
                   activeTab === 'research' ? 'Manage research projects and requirements' : 'Research Dashboard'}
                </p>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            {/* Stats Cards - Only show on dashboard */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Components</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.totalComponents.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      For research use
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Research Projects</CardTitle>
                    <BookOpen className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{mockStats.researchProjects}</div>
                    <p className="text-xs text-muted-foreground">
                      Active projects
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Data Points</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{mockStats.dataPoints}</div>
                    <p className="text-xs text-muted-foreground">
                      Collected this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{mockStats.lowStockItems}</div>
                    <p className="text-xs text-muted-foreground">
                      May need restocking
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Page Content */}
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 