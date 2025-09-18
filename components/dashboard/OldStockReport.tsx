'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Clock, Package, Loader2, Calendar } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface OldStockComponent {
  id: string
  name: string
  partNumber: string
  quantity: number
  unitPrice: string
  lastOutwardDate?: string
  category: {
    name: string
  }
}

interface OldStockData {
  oldStock: OldStockComponent[]
  summary: {
    count: number
    totalValue: number
    threeMonthsAgo: string
  }
}

export function OldStockReport() {
  const [data, setData] = useState<OldStockData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOldStockData()
  }, [])

  const fetchOldStockData = async () => {
    try {
      const response = await fetch('/api/analytics/old-stock')
      if (response.ok) {
        const oldStockData = await response.json()
        setData(oldStockData)
      }
    } catch (error) {
      console.error('Error fetching old stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAgeColor = (lastOutwardDate?: string) => {
    if (!lastOutwardDate) return 'text-gray-500'
    
    const date = new Date(lastOutwardDate)
    const monthsAgo = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)
    
    if (monthsAgo > 6) return 'text-red-600'
    if (monthsAgo > 4) return 'text-orange-600'
    return 'text-yellow-600'
  }

  const getAgeText = (lastOutwardDate?: string) => {
    if (!lastOutwardDate) return 'Never used'
    
    const date = new Date(lastOutwardDate)
    return formatDistanceToNow(date, { addSuffix: true })
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
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">Unable to load old stock information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Old Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{data.summary.count}</div>
            <p className="text-xs text-yellow-600">Not used in 3+ months</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.summary.totalValue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Value of old stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Old Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Old Stock Report
          </CardTitle>
          <CardDescription>
            Components that haven&apos;t been used in the last 3 months (since {format(new Date(data.summary.threeMonthsAgo), 'MMM dd, yyyy')})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.oldStock.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Old Stock!</h3>
              <p className="text-gray-500">All components have been used recently</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.oldStock.map((component) => {
                  const ageColor = getAgeColor(component.lastOutwardDate)
                  const ageText = getAgeText(component.lastOutwardDate)
                  const componentValue = parseFloat(component.unitPrice) * component.quantity
                  
                  return (
                    <TableRow key={component.id} className="bg-yellow-50">
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
                        <span className="font-medium text-yellow-700">{component.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {component.lastOutwardDate 
                              ? format(new Date(component.lastOutwardDate), 'MMM dd, yyyy')
                              : 'Never'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${ageColor}`}>
                          {ageText}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-yellow-700">
                          ₹{componentValue.toFixed(2)}
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