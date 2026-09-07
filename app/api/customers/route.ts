import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

// GET - Get customer profile and data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('id')
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from('realtor_customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError) {
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    // Get saved properties
    const { data: savedProperties } = await supabase
      .from('customer_saved_properties')
      .select(`
        id,
        created_at,
        properties (
          id, address, city, state, zip, price, bedrooms, bathrooms, sqft, 
          property_type, status, photos, description
        )
      `)
      .eq('customer_id', customerId)

    // Get showing requests
    const { data: showingRequests } = await supabase
      .from('showing_requests')
      .select(`
        *,
        properties (id, address, city)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    // Get messages
    const { data: messages } = await supabase
      .from('customer_messages')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      customer,
      saved_properties: savedProperties || [],
      showing_requests: showingRequests || [],
      messages: messages || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// POST - Create/register customer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    if (action === 'register') {
      const { email, password, full_name, phone } = body
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone,
            user_type: 'customer'
          }
        }
      })

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      // Create customer record
      const { data: customer, error: customerError } = await supabase
        .from('realtor_customers')
        .insert({
          id: authData.user?.id,
          email,
          full_name,
          phone,
          status: 'active'
        })
        .select()
        .single()

      if (customerError) {
        return NextResponse.json({ error: customerError.message }, { status: 500 })
      }

      return NextResponse.json({ customer, user: authData.user })
    }

    if (action === 'login') {
      const { email, password } = body
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 401 })
      }

      // Get customer record
      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('*')
        .eq('id', authData.user?.id)
        .single()

      return NextResponse.json({ customer, session: authData.session })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
