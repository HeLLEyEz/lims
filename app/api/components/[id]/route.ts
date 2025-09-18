import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { data: component, error } = await supabase
      .from('components')
      .select(`
        *,
        category:categories(*),
        creator:users(id, firstName, lastName, email)
      `)
      .eq('id', id)
      .single()

    if (error || !component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(component)
  } catch (error) {
    console.error('Error fetching component:', error)
    return NextResponse.json(
      { error: 'Failed to fetch component' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check if component exists
    const { data: existingComponent, error: componentError } = await supabase
      .from('components')
      .select('id, partNumber')
      .eq('id', id)
      .single()

    if (componentError || !existingComponent) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
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

    // Check if part number already exists (excluding current component)
    if (partNumber !== existingComponent.partNumber) {
      const { data: duplicateComponent } = await supabase
        .from('components')
        .select('id')
        .eq('partNumber', partNumber)
        .single()

      if (duplicateComponent) {
        return NextResponse.json(
          { error: 'Part number already exists' },
          { status: 400 }
        )
      }
    }

    // Update component
    const { data: component, error: updateError } = await supabase
      .from('components')
      .update({
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
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        creator:users(id, firstName, lastName, email)
      `)
      .single()

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update component' },
        { status: 500 }
      )
    }

    return NextResponse.json(component)
  } catch (error) {
    console.error('Error updating component:', error)
    return NextResponse.json(
      { error: 'Failed to update component' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if component exists
    const { data: existingComponent, error: componentError } = await supabase
      .from('components')
      .select('id')
      .eq('id', id)
      .single()

    if (componentError || !existingComponent) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      )
    }

    // Delete component
    const { error: deleteError } = await supabase
      .from('components')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete component' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Component deleted successfully' })
  } catch (error) {
    console.error('Error deleting component:', error)
    return NextResponse.json(
      { error: 'Failed to delete component' },
      { status: 500 }
    )
  }
}
