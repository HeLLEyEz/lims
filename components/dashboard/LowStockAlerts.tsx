'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, Package, Loader2, AlertCircle } from 'lucide-react'

interface LowStockComponent {
  id: string
  name: string
  partNumber: string
  quantity: number
  criticalLowThreshold: number
  unitPrice: string
  category: {
    name: string
  }
}

interface LowStockData {
  lowStock: LowStockComponent[]
  outOfStock: LowStockComponent[]
  summary: {
    lowStockCount: number
    outOfStockCount: number
    totalCritical: number
  }
}

export function LowStockAlerts() {
  const [data, setData] = useState<LowStockData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLowStockData()
  }, [])

  const fetchLowStockData = async () => {
    try {
      const response = await fetch('/api/analytics/low-stock')
      if (response.ok) {
        const lowStockData = await response.json()
        setData(lowStockData)
      }
    } catch (error) {
      console.error('Error fetching low stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    if (quantity <= threshold) return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: Package }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">Unable to load low stock information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const allCriticalComponents = [...data.outOfStock, ...data.lowStock]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{data.summary.outOfStockCount}</div>
            <p className="text-xs text-red-600">Components with zero stock</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{data.summary.lowStockCount}</div>
            <p className="text-xs text-orange-600">Components below threshold</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalCritical}</div>
            <p className="text-xs text-gray-600">Items needing attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Components Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Critical Stock Alerts
          </CardTitle>
          <CardDescription>
            Components that are out of stock or below critical threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allCriticalComponents.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
              <p className="text-gray-500">No critical stock alerts at the moment</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCriticalComponents.map((component) => {
                  const stockStatus = getStockStatus(component.quantity, component.criticalLowThreshold)
                  const StatusIcon = stockStatus.icon
                  
                  return (
                    <TableRow key={component.id} className={component.quantity === 0 ? 'bg-red-50' : 'bg-orange-50'}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{component.name}</div>
                            <div className="text-sm text-gray-500">{component.partNumber}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{component.category.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${component.quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {component.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{component.criticalLowThreshold}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₹{(parseFloat(component.unitPrice) * component.quantity).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 