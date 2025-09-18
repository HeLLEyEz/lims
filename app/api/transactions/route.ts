import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get total count for pagination
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    // Get transactions with related data
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        component:components(name, partNumber),
        user:users(firstName, lastName)
      `)
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
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
      const { data: component, error: componentError } = await supabase
        .from('components')
        .select('id, quantity')
        .eq('id', componentId)
        .single()

      if (componentError || !component) {
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
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type,
        quantity,
        reason,
        project,
        remarks,
        componentId,
        userId: '84d5071d-6e38-4350-8974-f7474071fd2a', // Use admin ID for now
        createdAt: new Date().toISOString()
      })
      .select(`
        *,
        component:components(name, partNumber),
        user:users(firstName, lastName)
      `)
      .single()

    if (transactionError) {
      console.error('Supabase error:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Update component quantity
    const quantityChange = type === 'INWARD' ? quantity : -quantity
    const updateData: any = {
      quantity: quantityChange,
      updatedAt: new Date().toISOString()
    }
    
    if (type === 'OUTWARD') {
      updateData.lastOutwardDate = new Date().toISOString()
    }

    const { error: updateError } = await supabase.rpc('increment_component_quantity', {
      component_id: componentId,
      quantity_change: quantityChange,
      last_outward_date: type === 'OUTWARD' ? new Date().toISOString() : null
    })

    if (updateError) {
      console.error('Error updating component quantity:', updateError)
      // Still return the transaction even if quantity update fails
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
} 