import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Get components that are out of stock
    const { data: outOfStockComponents, error: outOfStockError } = await supabase
      .from('components')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('quantity', 0)

    if (outOfStockError) {
      console.error('Supabase error (out of stock):', outOfStockError)
      return NextResponse.json(
        { error: 'Failed to fetch out of stock components' },
        { status: 500 }
      )
    }

    // Get components with critically low stock (but not out of stock)
    const { data: allComponents, error: allComponentsError } = await supabase
      .from('components')
      .select(`
        *,
        category:categories(name)
      `)
      .gt('quantity', 0)  // Greater than 0 (not out of stock)

    if (allComponentsError) {
      console.error('Supabase error (all components):', allComponentsError)
      return NextResponse.json(
        { error: 'Failed to fetch components' },
        { status: 500 }
      )
    }
    
    // Filter for low stock components
    const lowStockComponents = (allComponents || []).filter(component => 
      component.quantity <= component.criticalLowThreshold
    ).sort((a, b) => a.quantity - b.quantity)

    return NextResponse.json({
      lowStock: lowStockComponents,
      outOfStock: outOfStockComponents || [],
      summary: {
        lowStockCount: lowStockComponents.length,
        outOfStockCount: (outOfStockComponents || []).length,
        totalCritical: lowStockComponents.length + (outOfStockComponents || []).length
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