import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate a CUID-like ID
function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `cm${timestamp}${random}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minQuantity = searchParams.get('minQuantity')
    const maxQuantity = searchParams.get('maxQuantity')
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build Supabase query
    let query = supabase
      .from('components')
      .select(`
        *,
        category:categories(*),
        creator:users(id, firstName, lastName, email)
      `)
      .order('createdAt', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('categoryId', category)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,partNumber.ilike.%${search}%,description.ilike.%${search}%,manufacturer.ilike.%${search}%,supplier.ilike.%${search}%`)
    }

    if (minQuantity) {
      query = query.gte('quantity', parseInt(minQuantity))
    }
    
    if (maxQuantity) {
      query = query.lte('quantity', parseInt(maxQuantity))
    }

    if (location) {
      query = query.ilike('locationBin', `%${location}%`)
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('components')
      .select('*', { count: 'exact', head: true })

    // Apply pagination
    query = query.range(skip, skip + limit - 1)

    const { data: components, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch components' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      components: components || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
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
      categoryId,
      createdBy
    } = body

    // Validate required fields
    if (!name || !partNumber || !categoryId) {
      return NextResponse.json(
        { error: 'Name, part number, and category are required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const { data: categoryExists, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single()

    if (categoryError || !categoryExists) {
      console.error(`Category validation failed for ID: ${categoryId}`)
      return NextResponse.json(
        { error: `Selected category does not exist (ID: ${categoryId})` },
        { status: 400 }
      )
    }

    // Check if part number already exists
    const { data: existingComponent } = await supabase
      .from('components')
      .select('id')
      .eq('partNumber', partNumber)
      .single()

    if (existingComponent) {
      return NextResponse.json(
        { error: 'Part number already exists' },
        { status: 400 }
      )
    }

    // Get a default user ID if none provided (for now, use the first admin user)
    let userId = createdBy
    if (!userId) {
      const { data: defaultUser } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'ADMIN')
        .limit(1)
        .single()
      userId = defaultUser?.id || '84d5071d-6e38-4350-8974-f7474071fd2a' // Use admin ID as fallback
    }

    // Create component with generated ID
    const componentId = generateId()
    const { data: component, error } = await supabase
      .from('components')
      .insert({
        id: componentId,
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
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Failed to create component: ${error.message}` },
        { status: 500 }
      )
    }

    // Get the created component with related data
    const { data: componentWithRelations, error: relationError } = await supabase
      .from('components')
      .select(`
        *,
        category:categories(*),
        creator:users(id, firstName, lastName, email)
      `)
      .eq('id', component.id)
      .single()

    if (relationError) {
      console.error('Supabase relation error:', relationError)
      // Return the component without relations if that fails
      return NextResponse.json(component, { status: 201 })
    }

    return NextResponse.json(componentWithRelations, { status: 201 })
  } catch (error) {
    console.error('Error creating component:', error)
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 }
    )
  }
} 