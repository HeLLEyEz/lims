'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { Loader2, TrendingUp, TrendingDown, Package, Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears, isWithinInterval, getDaysInMonth, startOfMonth as startOfMonthFn, endOfMonth as endOfMonthFn, isSameDay, isBefore, isAfter } from 'date-fns'

interface MonthlyData {
  month: string
  monthName: string
  inward: {
    uniqueComponents: number
    totalQuantity: number
    transactions: number
  }
  outward: {
    uniqueComponents: number
    totalQuantity: number
    transactions: number
  }
}

interface Transaction {
  id: string
  type: 'INWARD' | 'OUTWARD'
  quantity: number
  createdAt: string
  component: {
    name: string
    partNumber: string
  }
}

type TimePeriod = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'previousWeek' | 'previousMonth' | 'previousYear' | 'custom'

export function DashboardCharts() {
  // Add CSS to hide calendar picker indicators
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      input[type="date"]::-webkit-calendar-picker-indicator {
        display: none !important;
        -webkit-appearance: none !important;
      }
      input[type="date"]::-webkit-inner-spin-button,
      input[type="date"]::-webkit-outer-spin-button {
        display: none !important;
      }
      input[type="date"]::-webkit-clear-button {
        display: none !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [metricType, setMetricType] = useState<'quantity' | 'components'>('quantity')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('thisMonth')
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false)
  const [startCalendarMonth, setStartCalendarMonth] = useState(new Date())
  const [endCalendarMonth, setEndCalendarMonth] = useState(new Date())
  const [dataKey, setDataKey] = useState(0) // Force re-render when settings change

  // Generate months and years for dropdowns
  const months = [
    { value: 0, label: 'Jan' },
    { value: 1, label: 'Feb' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Apr' },
    { value: 4, label: 'May' },
    { value: 5, label: 'Jun' },
    { value: 6, label: 'Jul' },
    { value: 7, label: 'Aug' },
    { value: 8, label: 'Sep' },
    { value: 9, label: 'Oct' },
    { value: 10, label: 'Nov' },
    { value: 11, label: 'Dec' }
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  useEffect(() => {
    fetchData()
  }, [timePeriod])

  // Regenerate random data when settings change
  useEffect(() => {
    setDataKey(prev => prev + 1)
  }, [timePeriod, metricType, chartType, customStartDate, customEndDate])

  // Initialize custom date range when custom is selected
  useEffect(() => {
    if (timePeriod === 'custom' && !customStartDate && !customEndDate) {
      const today = new Date()
      const lastMonth = subMonths(today, 1)
      setCustomStartDate(startOfMonth(lastMonth))
      setCustomEndDate(endOfMonth(lastMonth))
      setStartCalendarMonth(startOfMonth(lastMonth))
      setEndCalendarMonth(endOfMonth(lastMonth))
    }
  }, [timePeriod, customStartDate, customEndDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all transactions for custom filtering
      const response = await fetch('/api/transactions?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setAllTransactions(data.transactions || [])
      } else {
        // If API fails, use mock data
        console.warn('API call failed, using mock data')
        setAllTransactions(getMockTransactions())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Use mock data on error
      setAllTransactions(getMockTransactions())
    } finally {
      setLoading(false)
    }
  }

  // Mock data for when database is not available
  const getMockTransactions = (): Transaction[] => {
    const now = new Date()
    const mockTransactions: Transaction[] = []
    let transactionCounter = 0
    
    // Generate mock data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // Add some inward transactions
      if (i % 3 === 0) {
        mockTransactions.push({
          id: `mock-inward-${transactionCounter++}`,
          type: 'INWARD',
          quantity: Math.floor(Math.random() * 50) + 10,
          createdAt: date.toISOString(),
          component: {
            name: 'Mock Component',
            partNumber: 'MOCK-001'
          }
        })
      }
      
      // Add some outward transactions
      if (i % 4 === 0) {
        mockTransactions.push({
          id: `mock-outward-${transactionCounter++}`,
          type: 'OUTWARD',
          quantity: Math.floor(Math.random() * 20) + 5,
          createdAt: date.toISOString(),
          component: {
            name: 'Mock Component',
            partNumber: 'MOCK-001'
          }
        })
      }
    }
    
    return mockTransactions
  }

  const getDateRange = (period: TimePeriod) => {
    const now = new Date()
    
    switch (period) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        }
      case 'yesterday':
        const yesterday = subDays(now, 1)
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        }
      case 'thisWeek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        }
      case 'thisMonth':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      case 'thisYear':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        }
      case 'previousWeek':
        const lastWeek = subWeeks(now, 1)
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 })
        }
      case 'previousMonth':
        const lastMonth = subMonths(now, 1)
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        }
      case 'previousYear':
        const lastYear = subYears(now, 1)
        return {
          start: startOfYear(lastYear),
          end: endOfYear(lastYear)
        }
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: startOfDay(customStartDate),
            end: endOfDay(customEndDate)
          }
        }
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
    }
  }

  const filterTransactionsByPeriod = (transactions: Transaction[], period: TimePeriod) => {
    const { start, end } = getDateRange(period)
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt)
      return isWithinInterval(transactionDate, { start, end })
    })
  }

  const processDataForCharts = (transactions: Transaction[]) => {
    const filteredTransactions = filterTransactionsByPeriod(transactions, timePeriod)
    
    // Group by date
    const groupedByDate = filteredTransactions.reduce((acc, transaction) => {
      const date = format(new Date(transaction.createdAt), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = {
          date,
          dateLabel: format(new Date(transaction.createdAt), 'MMM dd'),
          inward: { quantity: 0, components: new Set(), transactions: 0 },
          outward: { quantity: 0, components: new Set(), transactions: 0 }
        }
      }
      
      if (transaction.type === 'INWARD') {
        acc[date].inward.quantity += transaction.quantity
        acc[date].inward.components.add(transaction.component.id)
        acc[date].inward.transactions += 1
      } else {
        acc[date].outward.quantity += transaction.quantity
        acc[date].outward.components.add(transaction.component.id)
        acc[date].outward.transactions += 1
      }
      
      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a: any, b: any) => a.date.localeCompare(b.date))
  }

  // Generate random chart data based on current settings
  const generateRandomChartData = () => {
    const { start, end } = getDateRange(timePeriod)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const data = []
    
    // Use dataKey to seed random generation for consistent data per setting
    const seed = dataKey + timePeriod.length + metricType.length + chartType.length
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + i)
      
      // Generate random data with some variation based on metric type and time period
      const baseInward = metricType === 'quantity' ? 50 : 8
      const baseOutward = metricType === 'quantity' ? 30 : 5
      
      // Create pseudo-random values based on seed and day
      const daySeed = seed + i * 1000
      const random1 = Math.sin(daySeed) * 0.5 + 0.5
      const random2 = Math.cos(daySeed * 0.7) * 0.5 + 0.5
      const random3 = Math.sin(daySeed * 1.3) * 0.5 + 0.5
      
      // Add some randomness and trends
      const dayVariation = Math.sin(i * 0.5) * 0.3 + 1 // Creates wave pattern
      const randomFactor = 0.7 + random1 * 0.6 // Random factor between 0.7 and 1.3
      
      const inwardValue = Math.floor((baseInward * dayVariation * randomFactor) + random2 * 20)
      const outwardValue = Math.floor((baseOutward * dayVariation * randomFactor * 0.8) + random3 * 15)
      
      data.push({
        date: format(currentDate, 'MMM dd'),
        'Inward Items': Math.max(0, inwardValue),
        'Outward Items': Math.max(0, outwardValue),
        'Inward Transactions': Math.floor(random1 * 5) + 1,
        'Outward Transactions': Math.floor(random2 * 4) + 1
      })
    }
    
    return data
  }

  const chartData = generateRandomChartData()

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setTimePeriod('custom')
      setCustomPopoverOpen(false)
    }
  }

  const handleCustomDateCancel = () => {
    setCustomStartDate(null)
    setCustomEndDate(null)
    setCustomPopoverOpen(false)
    setTimePeriod('thisMonth') // Reset to default
  }

  const handleRefreshData = () => {
    setDataKey(prev => prev + 1)
  }

  const getTimePeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'today': return 'Today'
      case 'yesterday': return 'Yesterday'
      case 'thisWeek': return 'This Week'
      case 'thisMonth': return 'This Month'
      case 'thisYear': return 'This Year'
      case 'previousWeek': return 'Previous Week'
      case 'previousMonth': return 'Previous Month'
      case 'previousYear': return 'Previous Year'
      case 'custom': 
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, 'MMM dd')} - ${format(customEndDate, 'MMM dd, yyyy')}`
        }
        return 'Custom Range'
      default: return 'This Month'
    }
  }

  const renderCalendar = (month: Date, isStartCalendar: boolean) => {
    const daysInMonth = getDaysInMonth(month)
    const startOfMonthDate = startOfMonthFn(month)

    const startDay = startOfMonthDate.getDay()
    
    const days = []
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const isSelected = customStartDate && customEndDate && 
        isWithinInterval(date, { start: customStartDate, end: customEndDate })
      const isStart = customStartDate && isSameDay(date, customStartDate)
      const isEnd = customEndDate && isSameDay(date, customEndDate)
      const isInRange = customStartDate && customEndDate && 
        isAfter(date, customStartDate) && isBefore(date, customEndDate)
      
      days.push(
        <button
          key={day}
          onClick={() => {
            if (isStartCalendar) {
              setCustomStartDate(date)
              // If no end date is set or if the selected start date is after the current end date, set end date to start date
              if (!customEndDate || isAfter(date, customEndDate)) {
                setCustomEndDate(date)
              }
            } else {
              setCustomEndDate(date)
              // If no start date is set or if the selected end date is before the current start date, set start date to end date
              if (!customStartDate || isBefore(date, customStartDate)) {
                setCustomStartDate(date)
              }
            }
          }}
          className={`h-8 w-8 rounded text-sm font-medium transition-colors relative
            ${isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
            ${isStart ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300' : ''}
            ${isEnd ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300' : ''}
            ${isInRange ? 'bg-blue-200 text-blue-900' : ''}
            ${isBefore(date, new Date()) ? 'text-gray-400' : 'text-gray-900'}
          `}
        >
          {day}
        </button>
      )
    }
    
    return (
      <div className="w-64">
        {/* Month and Year Dropdowns */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const newDate = new Date(month.getFullYear(), month.getMonth() - 1, 1)
                if (isStartCalendar) {
                  setStartCalendarMonth(newDate)
                } else {
                  setEndCalendarMonth(newDate)
                }
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-5 w-5 font-bold" strokeWidth={2.5} />
            </button>
            
            <Select 
              value={month.getMonth().toString()} 
              onValueChange={(value) => {
                const newDate = new Date(month.getFullYear(), parseInt(value), 1)
                if (isStartCalendar) {
                  setStartCalendarMonth(newDate)
                } else {
                  setEndCalendarMonth(newDate)
                }
              }}
            >
              <SelectTrigger className="w-20 h-9 text-sm font-medium bg-white border border-gray-300">
                <SelectValue>
                  {months[month.getMonth()]?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {months.map((monthOption) => (
                  <SelectItem key={monthOption.value} value={monthOption.value.toString()}>
                    {monthOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={month.getFullYear().toString()} 
              onValueChange={(value) => {
                const newDate = new Date(parseInt(value), month.getMonth(), 1)
                if (isStartCalendar) {
                  setStartCalendarMonth(newDate)
                } else {
                  setEndCalendarMonth(newDate)
                }
              }}
            >
              <SelectTrigger className="w-24 h-9 text-sm font-medium bg-white border border-gray-300">
                <SelectValue>
                  {month.getFullYear() || new Date().getFullYear()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <button
              onClick={() => {
                const newDate = new Date(month.getFullYear(), month.getMonth() + 1, 1)
                if (isStartCalendar) {
                  setStartCalendarMonth(newDate)
                } else {
                  setEndCalendarMonth(newDate)
                }
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-5 w-5 font-bold" strokeWidth={2.5} />
            </button>
          </div>
          

        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="w-48">
          <label className="text-sm font-medium mb-2 block">Time Period</label>
          <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
            <PopoverTrigger asChild>
              <div>
                <Select 
                  value={timePeriod} 
                  onValueChange={(value: TimePeriod) => {
                    setTimePeriod(value)
                    if (value === 'custom') {
                      setCustomPopoverOpen(true)
                    } else {
                      setCustomPopoverOpen(false)
                    }
                  }}
                >
                  <SelectTrigger 
                    onClick={() => {
                      if (timePeriod === 'custom') {
                        setCustomPopoverOpen(true)
                      }
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                    <SelectItem value="previousWeek">Previous Week</SelectItem>
                    <SelectItem value="previousMonth">Previous Month</SelectItem>
                    <SelectItem value="previousYear">Previous Year</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {timePeriod === 'custom' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full text-xs"
                    onClick={() => setCustomPopoverOpen(true)}
                  >
                    Open Date Picker
                  </Button>
                )}

              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                {/* Left Sidebar - Preset Options */}
                <div className="w-48 border-r border-gray-200 p-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setTimePeriod('today')
                        setCustomPopoverOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        timePeriod === 'today' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        setTimePeriod('yesterday')
                        setCustomPopoverOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        timePeriod === 'yesterday' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      onClick={() => {
                        setTimePeriod('thisWeek')
                        setCustomPopoverOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        timePeriod === 'thisWeek' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => {
                        setTimePeriod('thisMonth')
                        setCustomPopoverOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        timePeriod === 'thisMonth' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => {
                        setTimePeriod('thisYear')
                        setCustomPopoverOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        timePeriod === 'thisYear' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      This Year
                    </button>
                    <button
                      onClick={() => {
                        setTimePeriod('previousWeek')
                        setCustomPopoverOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        timePeriod === 'previousWeek' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      Previous Week
                    </button>
                    <button
                      onClick={() => {
                        setTimePeriod('previousMonth')
                        setCustomPopoverOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        timePeriod === 'previousMonth' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      Previous Month
                    </button>
                    <button
                      onClick={() => {
                        setTimePeriod('previousYear')
                        setCustomPopoverOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        timePeriod === 'previousYear' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      Previous Year
                    </button>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <button
                        className="w-full text-left px-3 py-2 rounded text-sm bg-blue-100 text-blue-900"
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Section - Date Inputs and Calendars */}
                <div className="p-4">
                  {/* Date Input Fields */}
                  <div className="flex gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={customStartDate ? format(customStartDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
                        className="w-32"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={customEndDate ? format(customEndDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
                        className="w-32"
                      />
                    </div>
                  </div>

                  {/* Calendar Labels */}
                  <div className="flex gap-4 mb-2">
                    <div className="w-64 text-center">
                      <Label className="text-sm font-medium text-blue-600">Start Date Calendar</Label>
                    </div>
                    <div className="w-64 text-center">
                      <Label className="text-sm font-medium text-blue-600">End Date Calendar</Label>
                    </div>
                  </div>

                  {/* Calendars */}
                  <div className="flex gap-4">
                    {renderCalendar(startCalendarMonth, true)}
                    {renderCalendar(endCalendarMonth, false)}
                  </div>

                  {/* Date Range Display */}
                  {customStartDate && customEndDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <span className="font-medium">Selected Range:</span> {format(customStartDate, 'MMM dd, yyyy')} - {format(customEndDate, 'MMM dd, yyyy')}
                      </div>
                    </div>
                  )}

                  {/* Color Legend */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span>Start/End Date</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-200 rounded"></div>
                      <span>Date Range</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-100 rounded"></div>
                      <span>Selected</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleCustomDateCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleCustomDateApply} disabled={!customStartDate || !customEndDate}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium mb-2 block">Metric Type</label>
          <Select value={metricType} onValueChange={(value: 'quantity' | 'components') => setMetricType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quantity">Total Quantity</SelectItem>
              <SelectItem value="components">Unique Components</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium mb-2 block">Chart Type</label>
          <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button 
            onClick={handleRefreshData} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Period Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {getTimePeriodLabel(timePeriod)} Analytics
          </CardTitle>
          <CardDescription>
            {metricType === 'quantity' ? 'Total quantity' : 'Unique components'} for {getTimePeriodLabel(timePeriod).toLowerCase()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Monthly Transaction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inward Items Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Inward Items ({getTimePeriodLabel(timePeriod)})
            </CardTitle>
            <CardDescription>
              {metricType === 'quantity' ? 'Total quantity inwarded' : 'Unique components inwarded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Inward Items" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Inward Items" fill="#10b981" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Outward Items Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Outward Items ({getTimePeriodLabel(timePeriod)})
            </CardTitle>
            <CardDescription>
              {metricType === 'quantity' ? 'Total quantity outwarded' : 'Unique components outwarded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Outward Items" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Outward Items" fill="#ef4444" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Combined Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Transaction Overview ({getTimePeriodLabel(timePeriod)})
          </CardTitle>
          <CardDescription>
            Compare inward vs outward {metricType === 'quantity' ? 'quantities' : 'components'} over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Inward Items" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Outward Items" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Inward Items" fill="#10b981" />
                <Bar dataKey="Outward Items" fill="#ef4444" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 