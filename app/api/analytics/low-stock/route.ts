import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get components with critically low stock
    const lowStockComponents = await prisma.component.findMany({
      where: {
        quantity: {
          lte: prisma.component.fields.criticalLowThreshold
        }
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        quantity: 'asc'
      }
    })

    // Get components that are out of stock
    const outOfStockComponents = await prisma.component.findMany({
      where: {
        quantity: 0
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      lowStock: lowStockComponents,
      outOfStock: outOfStockComponents,
      summary: {
        lowStockCount: lowStockComponents.length,
        outOfStockCount: outOfStockComponents.length,
        totalCritical: lowStockComponents.length + outOfStockComponents.length
      }
    })
  } catch (error) {
    console.error('Error fetching low stock analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch low stock analytics' },
      { status: 500 }
    )
  }
} 