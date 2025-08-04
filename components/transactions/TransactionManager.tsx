'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, ArrowUpDown, Package, Loader2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { TransactionType } from '@prisma/client'

interface Component {
  id: string
  name: string
  partNumber: string
  quantity: number
  category: {
    name: string
  }
}

interface Transaction {
  id: string
  type: TransactionType
  quantity: number
  reason?: string
  project?: string
  remarks?: string
  createdAt: string
  component: {
    name: string
    partNumber: string
  }
  user: {
    firstName?: string
    lastName?: string
  }
}

export function TransactionManager() {
  const [openDialog, setOpenDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [components, setComponents] = useState<Component[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    componentId: '',
    type: 'OUTWARD' as TransactionType,
    quantity: '',
    reason: '',
    project: '',
    remarks: ''
  })

  useEffect(() => {
    fetchComponents()
    fetchTransactions()
  }, [])

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/components?limit=100')
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components || [])
      }
    } catch (error) {
      console.error('Error fetching components:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity) || 0
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
      }

      toast({
        title: 'Success',
        description: 'Transaction logged successfully',
      })

      setOpenDialog(false)
      setFormData({
        componentId: '',
        type: 'OUTWARD',
        quantity: '',
        reason: '',
        project: '',
        remarks: ''
      })
      fetchTransactions()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create transaction',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getTransactionTypeColor = (type: TransactionType) => {
    return type === 'INWARD' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getTransactionTypeIcon = (type: TransactionType) => {
    return type === 'INWARD' ? '↗️' : '↘️'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({
              componentId: '',
              type: 'OUTWARD',
              quantity: '',
              reason: '',
              project: '',
              remarks: ''
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Log Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Transaction</DialogTitle>
              <DialogDescription>
                Record component usage or incoming stock
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="componentId">Component *</Label>
                <Select value={formData.componentId} onValueChange={(value) => handleInputChange('componentId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((component) => (
                      <SelectItem key={component.id} value={component.id}>
                        <div className="flex flex-col">
                          <span>{component.name}</span>
                          <span className="text-xs text-gray-500">
                            {component.partNumber} (Stock: {component.quantity})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type *</Label>
                <Select value={formData.type} onValueChange={(value: TransactionType) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INWARD">Inward (Stock In)</SelectItem>
                    <SelectItem value="OUTWARD">Outward (Stock Out)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason/Purpose</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="e.g., Production batch, Research project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  value={formData.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  placeholder="e.g., IoT Project, Batch #123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging...
                    </>
                  ) : (
                    'Log Transaction'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest component movements and usage</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{transaction.component.name}</div>
                          <div className="text-sm text-gray-500">{transaction.component.partNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTransactionTypeColor(transaction.type)}>
                        {getTransactionTypeIcon(transaction.type)} {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{transaction.quantity}</span>
                    </TableCell>
                    <TableCell>
                      {transaction.project || '-'}
                    </TableCell>
                    <TableCell>
                      {transaction.user.firstName} {transaction.user.lastName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 