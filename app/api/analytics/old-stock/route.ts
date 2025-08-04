import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subMonths } from 'date-fns'

export async function GET() {
  try {
    const threeMonthsAgo = subMonths(new Date(), 3)

    // Get components that haven't been used (outwarded) in 3 months
    const oldStockComponents = await prisma.component.findMany({
      where: {
        OR: [
          {
            lastOutwardDate: {
              lt: threeMonthsAgo
            }
          },
          {
            lastOutwardDate: null
          }
        ],
        quantity: {
          gt: 0 // Only components with stock
        }
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        {
          lastOutwardDate: 'asc'
        },
        {
          quantity: 'desc'
        }
      ]
    })

    // Calculate total value of old stock
    const totalOldStockValue = oldStockComponents.reduce((sum, component) => {
      return sum + (parseFloat(component.unitPrice.toString()) * component.quantity)
    }, 0)

    return NextResponse.json({
      oldStock: oldStockComponents,
      summary: {
        count: oldStockComponents.length,
        totalValue: totalOldStockValue,
        threeMonthsAgo: threeMonthsAgo.toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching old stock analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch old stock analytics' },
      { status: 500 }
    )
  }
} 