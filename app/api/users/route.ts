import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')

    let query = supabase
      .from('users')
      .select('id, username, email, firstName, lastName, role, isActive, createdAt, lastLoginAt')
      .order('createdAt', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }
    
    if (isActive !== null) {
      query = query.eq('isActive', isActive === 'true')
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json(users || [])
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      email,
      firstName,
      lastName,
      role = 'USER',
      password
    } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email}${id ? `,id.eq.${id}` : ''}`)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password (we'll use a simple hash for now since Supabase handles auth)
    const hashedPassword = Buffer.from(password).toString('base64') // Simple encoding

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: id || undefined, // Use provided ID or let Supabase generate
        username: email.split('@')[0], // Use email prefix as username
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select('id, username, email, firstName, lastName, role, isActive, createdAt')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 