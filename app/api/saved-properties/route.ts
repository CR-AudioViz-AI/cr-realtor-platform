import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

// GET - Get saved properties for a customer
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        id,
        created_at,
        notes,
        properties (
          id, address, city, state, zip, price, bedrooms, bathrooms, sqft,
          property_type, status, photos, description, lot_size, year_built,
          listing_agent_id
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ saved_properties: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Save a property
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { customer_id, property_id, notes } = body

    if (!customer_id || !property_id) {
      return NextResponse.json({ error: 'Customer ID and Property ID required' }, { status: 400 })
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('customer_id', customer_id)
      .eq('property_id', property_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Property already saved', saved: existing }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('saved_properties')
      .insert({
        customer_id,
        property_id,
        notes,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        created_at,
        properties (id, address, city, price, bedrooms, bathrooms, sqft)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Track this as activity - agent sees customer interest
    await supabase
      .from('property_views')
      .insert({
        property_id,
        customer_id,
        action: 'saved',
        created_at: new Date().toISOString()
      })

    return NextResponse.json({ saved: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Unsave a property
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const propertyId = searchParams.get('property_id')

    if (!customerId || !propertyId) {
      return NextResponse.json({ error: 'Customer ID and Property ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('customer_id', customerId)
      .eq('property_id', propertyId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
