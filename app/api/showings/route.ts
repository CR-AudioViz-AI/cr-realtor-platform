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

// GET - Get showing requests (for agents or customers)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const agentId = searchParams.get('agent_id')
    const propertyId = searchParams.get('property_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('showing_requests')
      .select(`
        *,
        properties (id, address, city, state, price, photos),
        customers (id, full_name, email, phone)
      `)
      .order('requested_date', { ascending: true })

    if (customerId) query = query.eq('customer_id', customerId)
    if (agentId) query = query.eq('agent_id', agentId)
    if (propertyId) query = query.eq('property_id', propertyId)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ showings: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create showing request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { 
      property_id, 
      customer_id, 
      customer_name,
      customer_email,
      customer_phone,
      requested_date, 
      requested_time, 
      notes,
      property_address // for non-database properties
    } = body

    // If we have a property_id, get the agent from the property
    let agentId = null
    if (property_id) {
      const { data: property } = await supabase
        .from('properties')
        .select('listing_agent_id')
        .eq('id', property_id)
        .single()
      
      agentId = property?.listing_agent_id
    }

    // Create the showing request
    const { data: showing, error } = await supabase
      .from('showing_requests')
      .insert({
        property_id,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        agent_id: agentId,
        requested_date,
        requested_time,
        notes,
        property_address,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also create a lead from this showing request if customer info provided
    if (customer_email) {
      await supabase
        .from('realtor_leads')
        .upsert({
          email: customer_email,
          full_name: customer_name,
          phone: customer_phone,
          source: 'showing_request',
          status: 'new',
          notes: `Showing request for: ${property_address || 'Property ID: ' + property_id}`,
          assigned_to: agentId,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })
    }

    return NextResponse.json({ showing })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update showing status (for agents)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, status, agent_notes, confirmed_date, confirmed_time } = body

    const updateData: any = { status }
    if (agent_notes) updateData.agent_notes = agent_notes
    if (confirmed_date) updateData.confirmed_date = confirmed_date
    if (confirmed_time) updateData.confirmed_time = confirmed_time
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('showing_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ showing: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
