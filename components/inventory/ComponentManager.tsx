'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Package, 
  MapPin, 
  AlertTriangle, 
  Loader2, 
  Plus, 
  Edit, 
  Eye,
  ExternalLink,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface Component {
  id: string
  name: string
  manufacturer?: string
  supplier?: string
  partNumber: string
  description?: string
  quantity: number
  locationBin?: string
  unitPrice: string
  datasheetLink?: string
  criticalLowThreshold: number
  category: {
    id: string
    name: string
  }
  creator: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
}

interface ComponentFormData {
  name: string
  manufacturer: string
  supplier: string
  partNumber: string
  description: string
  quantity: string
  locationBin: string
  unitPrice: string
  datasheetLink: string
  criticalLowThreshold: string
  categoryId: string
}

export function ComponentManager() {
  const [components, setComponents] = useState<Component[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [deletingComponent, setDeletingComponent] = useState<Component | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComponents, setTotalComponents] = useState(0)
  const [viewMode, setViewMode] = useState<'all' | 'search'>('all')
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [minQuantity, setMinQuantity] = useState('')
  const [maxQuantity, setMaxQuantity] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  
  const { toast } = useToast()
  const { user } = useAuth()

  // Form state
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    manufacturer: '',
    supplier: '',
    partNumber: '',
    description: '',
    quantity: '0',
    locationBin: '',
    unitPrice: '0',
    datasheetLink: '',
    criticalLowThreshold: '10',
    categoryId: ''
  })

  useEffect(() => {
    fetchCategories()
    fetchAllComponents()
  }, [])

  useEffect(() => {
    if (viewMode === 'all') {
      fetchAllComponents()
    }
  }, [currentPage, viewMode])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        console.log('Categories loaded:', data.map((c: Category) => ({ id: c.id, name: c.name })))
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchAllComponents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/components?page=${currentPage}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components || [])
        setTotalPages(data.pagination?.pages || 1)
        setTotalComponents(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching components:', error)
      toast({
        title: "Error",
        description: "Failed to fetch components",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    // Check if any filters are applied
    const hasFilters = selectedCategory !== 'all' || minQuantity || maxQuantity || locationFilter || searchTerm.trim()
    
    if (!hasFilters) {
      setViewMode('all')
      fetchAllComponents()
      return
    }

    setLoading(true)
    setViewMode('search')
    try {
      const params = new URLSearchParams({
        ...(searchTerm.trim() && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(minQuantity && { minQuantity }),
        ...(maxQuantity && { maxQuantity }),
        ...(locationFilter && { location: locationFilter })
      })

      const response = await fetch(`/api/components?${params}`)
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components || [])
        setTotalPages(data.pagination?.pages || 1)
        setTotalComponents(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error searching components:', error)
      toast({
        title: "Error",
        description: "Failed to search components",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      manufacturer: '',
      supplier: '',
      partNumber: '',
      description: '',
      quantity: '0',
      locationBin: '',
      unitPrice: '0',
      datasheetLink: '',
      criticalLowThreshold: '10',
      categoryId: ''
    })
    setEditingComponent(null)
  }

  const handleAddComponent = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditComponent = async (component: Component) => {
    // Refresh categories to ensure we have the latest data
    await fetchCategories()
    
    // Validate that the component's category exists in our categories list
    const componentCategory = categories.find(cat => cat.id === component.category.id)
    if (!componentCategory) {
      console.error(`Component category not found in categories list:`, {
        componentCategoryId: component.category.id,
        componentCategoryName: component.category.name,
        availableCategories: categories.map(c => ({ id: c.id, name: c.name }))
      })
      toast({
        title: "Error",
        description: "Component category not found. Please refresh the page and try again.",
        variant: "destructive"
      })
      return
    }
    
    setEditingComponent(component)
    setFormData({
      name: component.name,
      manufacturer: component.manufacturer || '',
      supplier: component.supplier || '',
      partNumber: component.partNumber,
      description: component.description || '',
      quantity: component.quantity.toString(),
      locationBin: component.locationBin || '',
      unitPrice: component.unitPrice,
      datasheetLink: component.datasheetLink || '',
      criticalLowThreshold: component.criticalLowThreshold.toString(),
      categoryId: component.category.id
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.partNumber || !formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Name, part number, and category are required",
        variant: "destructive"
      })
      return
    }

    // Validate that the selected category exists in our categories list
    let selectedCategory = categories.find(cat => cat.id === formData.categoryId)
    
    if (!selectedCategory) {
      console.warn(`Category ID ${formData.categoryId} not found in categories list. Available categories:`, categories.map(c => ({ id: c.id, name: c.name })))
      
      // Try to refresh categories and validate again
      await fetchCategories()
      selectedCategory = categories.find(cat => cat.id === formData.categoryId)
      
      if (!selectedCategory) {
        toast({
          title: "Validation Error",
          description: "Selected category is not valid. Please refresh the page and try again.",
          variant: "destructive"
        })
        return
      }
    }

    setLoading(true)
    try {
      const url = editingComponent ? `/api/components/${editingComponent.id}` : '/api/components'
      const method = editingComponent ? 'PUT' : 'POST'
      
      const requestData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        criticalLowThreshold: parseInt(formData.criticalLowThreshold),
        createdBy: user?.id
      }
      
      console.log('Submitting component data:', {
        method,
        url,
        categoryId: requestData.categoryId,
        selectedCategory: categories.find(cat => cat.id === requestData.categoryId),
        allCategories: categories.map(c => ({ id: c.id, name: c.name }))
      })
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingComponent ? "Component updated successfully" : "Component added successfully"
        })
        setIsDialogOpen(false)
        resetForm()
        fetchAllComponents()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save component",
          variant: "destructive"
        })
        
        // If it's a category error, refresh categories and try again
        if (error.error && error.error.includes('category')) {
          await fetchCategories()
        }
      }
    } catch (error) {
      console.error('Error saving component:', error)
      toast({
        title: "Error",
        description: "Failed to save component",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (quantity <= threshold) return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800' }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setMinQuantity('')
    setMaxQuantity('')
    setLocationFilter('')
    setViewMode('all')
    setCurrentPage(1)
    fetchAllComponents()
  }

  const handleDeleteClick = (component: Component) => {
    setDeletingComponent(component)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingComponent) return

    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Invalid Confirmation",
        description: "Please type 'DELETE' to confirm deletion",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/components/${deletingComponent.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Component deleted successfully"
        })
        fetchAllComponents()
        setDeletingComponent(null)
        setDeleteConfirmText('')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete component",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting component:', error)
      toast({
        title: "Error",
        description: "Failed to delete component",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeletingComponent(null)
    setDeleteConfirmText('')
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Component Inventory</h2>
          <p className="text-gray-600">Manage your laboratory components and inventory</p>
        </div>
        <Button onClick={handleAddComponent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Component
        </Button>
      </div>

      {/* Search and Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Components
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Term */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Name, part number, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location/Bin</Label>
              <Input
                id="location"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            {/* Quantity Range */}
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Min Quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                placeholder="Minimum quantity"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxQuantity">Max Quantity</Label>
              <Input
                id="maxQuantity"
                type="number"
                placeholder="Maximum quantity"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 items-end">
              <Button 
                onClick={handleSearch} 
                disabled={loading || (!searchTerm.trim() && selectedCategory === 'all' && !minQuantity && !maxQuantity && !locationFilter)} 
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {viewMode === 'all' ? (
            <>Showing {components.length} of {totalComponents} components</>
          ) : (
            <>Found {totalComponents} components matching your search</>
          )}
        </div>
        {viewMode === 'all' && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Components Table */}
      {components.length > 0 ? (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component) => {
                  const stockStatus = getStockStatus(component.quantity, component.criticalLowThreshold)
                  return (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{component.name}</div>
                            {component.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {component.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {component.manufacturer && (
                            <div className="font-medium">{component.manufacturer}</div>
                          )}
                          {component.supplier && (
                            <div className="text-gray-500">{component.supplier}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {component.partNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{component.category.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{component.quantity}</span>
                          {component.quantity <= component.criticalLowThreshold && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {component.locationBin ? (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{component.locationBin}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">₹{parseFloat(component.unitPrice).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditComponent(component)}
                            title="Edit component"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {component.datasheetLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(component.datasheetLink, '_blank')}
                              title="Open datasheet"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(component)}
                            title="Delete component"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
              <p className="text-gray-500 mb-4">
                {viewMode === 'search' 
                  ? "Try adjusting your search terms or filters"
                  : "Start by adding your first component to the inventory"
                }
              </p>
              {viewMode === 'all' && (
                <Button onClick={handleAddComponent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Component
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Component Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingComponent ? 'Edit Component' : 'Add New Component'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Component Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Component Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter component name"
                  required
                  className="w-full"
                />
              </div>

              {/* Part Number */}
              <div className="space-y-2">
                <Label htmlFor="partNumber">Part Number *</Label>
                <Input
                  id="partNumber"
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  placeholder="Enter part number"
                  required
                  className="w-full"
                />
              </div>

              {/* Manufacturer */}
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="Enter manufacturer"
                  className="w-full"
                />
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Enter supplier"
                  className="w-full"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="w-full"
                />
              </div>

              {/* Unit Price */}
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="Enter unit price"
                  className="w-full"
                />
              </div>

              {/* Location/Bin */}
              <div className="space-y-2">
                <Label htmlFor="locationBin">Location/Bin</Label>
                <Input
                  id="locationBin"
                  value={formData.locationBin}
                  onChange={(e) => setFormData({ ...formData, locationBin: e.target.value })}
                  placeholder="Enter location or bin"
                  className="w-full"
                />
              </div>

              {/* Critical Low Threshold */}
              <div className="space-y-2">
                <Label htmlFor="criticalLowThreshold">Critical Low Threshold</Label>
                <Input
                  id="criticalLowThreshold"
                  type="number"
                  min="0"
                  value={formData.criticalLowThreshold}
                  onChange={(e) => setFormData({ ...formData, criticalLowThreshold: e.target.value })}
                  placeholder="Enter threshold"
                  className="w-full"
                />
              </div>

              {/* Datasheet Link */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="datasheetLink">Datasheet Link</Label>
                <Input
                  id="datasheetLink"
                  type="url"
                  value={formData.datasheetLink}
                  onChange={(e) => setFormData({ ...formData, datasheetLink: e.target.value })}
                  placeholder="Enter datasheet URL"
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter component description"
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingComponent ? 'Update Component' : 'Add Component'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingComponent} onOpenChange={handleDeleteCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Component
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>"{deletingComponent?.name}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. The component will be permanently removed from the inventory.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
              </Label>
              <Input
                id="deleteConfirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="font-mono"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDeleteCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading || deleteConfirmText !== 'DELETE'}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Component
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
