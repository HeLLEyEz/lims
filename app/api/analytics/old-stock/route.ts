import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { subMonths } from 'date-fns'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    const threeMonthsAgo = subMonths(new Date(), 3)

    // Get components that haven't been used (outwarded) in 3 months
    const { data: oldStockComponents, error } = await supabase
      .from('components')
      .select(`
        *,
        category:categories(name)
      `)
      .or(`lastOutwardDate.lt.${threeMonthsAgo.toISOString()},lastOutwardDate.is.null`)
      .gt('quantity', 0) // Only components with stock
      .order('lastOutwardDate', { ascending: true, nullsFirst: true })
      .order('quantity', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch old stock components' },
        { status: 500 }
      )
    }

    // Calculate total value of old stock
    const totalOldStockValue = (oldStockComponents || []).reduce((sum, component) => {
      return sum + (parseFloat(component.unitPrice.toString()) * component.quantity)
    }, 0)

    return NextResponse.json({
      oldStock: oldStockComponents || [],
      summary: {
        count: (oldStockComponents || []).length,
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