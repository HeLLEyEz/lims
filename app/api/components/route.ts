import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (category && category !== 'all') {
      where.categoryId = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [components, total] = await Promise.all([
      prisma.component.findMany({
        where,
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.component.count({ where })
    ])

    return NextResponse.json({
      components,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching components:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      manufacturer,
      supplier,
      partNumber,
      description,
      quantity,
      locationBin,
      unitPrice,
      datasheetLink,
      criticalLowThreshold,
      categoryId
    } = body

    // Validate required fields
    if (!name || !partNumber || !categoryId) {
      return NextResponse.json(
        { error: 'Name, part number, and category are required' },
        { status: 400 }
      )
    }

    // Check if part number already exists
    const existingComponent = await prisma.component.findUnique({
      where: { partNumber }
    })

    if (existingComponent) {
      return NextResponse.json(
        { error: 'Part number already exists' },
        { status: 400 }
      )
    }

    // Create component
    const component = await prisma.component.create({
      data: {
        name,
        manufacturer,
        supplier,
        partNumber,
        description,
        quantity: quantity || 0,
        locationBin,
        unitPrice: unitPrice || 0,
        datasheetLink,
        criticalLowThreshold: criticalLowThreshold || 10,
        categoryId,
        createdBy: 'temp-user-id' // TODO: Get from auth session
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(component, { status: 201 })
  } catch (error) {
    console.error('Error creating component:', error)
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 }
    )
  }
} 