import { createClient } from '@supabase/supabase-js'
import { prisma } from '../lib/prisma-config'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSupabaseAdmin() {
  console.log('🔐 Creating Supabase admin user...')

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@lab.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    })

    if (authError) {
      console.error('❌ Error creating Supabase user:', authError)
      return
    }

    console.log('✅ Supabase admin user created:', authData.user?.email)

    // Update the existing Prisma user with Supabase auth ID
    if (authData.user) {
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@lab.com' },
        data: { 
          id: authData.user.id,
          // Keep other fields as they are
        }
      })

      console.log('✅ Prisma user updated with Supabase ID')
      console.log('🎉 Admin setup complete!')
      console.log('📧 Email: admin@lab.com')
      console.log('🔑 Password: admin123')
    }

  } catch (error) {
    console.error('❌ Error setting up admin:', error)
  }
}

createSupabaseAdmin()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
