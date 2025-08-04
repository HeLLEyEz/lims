import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        include: {
          component: {
            select: {
              name: true,
              partNumber: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count()
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      componentId,
      type,
      quantity,
      reason,
      project,
      remarks
    } = body

    // Validate required fields
    if (!componentId || !type || !quantity) {
      return NextResponse.json(
        { error: 'Component ID, type, and quantity are required' },
        { status: 400 }
      )
    }

    // Check if component exists and has sufficient stock for outward transactions
    if (type === 'OUTWARD') {
      const component = await prisma.component.findUnique({
        where: { id: componentId }
      })

      if (!component) {
        return NextResponse.json(
          { error: 'Component not found' },
          { status: 404 }
        )
      }

      if (component.quantity < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Available: ${component.quantity}, Requested: ${quantity}` },
          { status: 400 }
        )
      }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        type,
        quantity,
        reason,
        project,
        remarks,
        componentId,
        userId: 'temp-user-id' // TODO: Get from auth session
      },
      include: {
        component: {
          select: {
            name: true,
            partNumber: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Update component quantity
    const quantityChange = type === 'INWARD' ? quantity : -quantity
    await prisma.component.update({
      where: { id: componentId },
      data: {
        quantity: {
          increment: quantityChange
        },
        ...(type === 'OUTWARD' && { lastOutwardDate: new Date() })
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
} 