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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      propertyId, 
      name, 
      email, 
      phone, 
      message, 
      preferredContact,
      interestType 
    } = body

    // Get property details to route lead correctly
    const { data: property } = await (supabase as any)
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    // Determine which agent to route to
    let assignedRealtorId = property?.listing_agent_id || null
    
    // If no listing agent, try to match by specialty
    if (!assignedRealtorId && property?.category) {
      const { data: matchingAgent } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('role', 'agent')
        .limit(1)
        .single()
      
      if (matchingAgent) {
        assignedRealtorId = matchingAgent.id
      }
    }

    // Create lead record
    const { data: lead, error } = await (supabase as any)
      .from('realtor_leads')
      .insert({
        name,
        email,
        phone,
        message,
        property_id: propertyId,
        realtor_id: assignedRealtorId,
        status: 'new',
        source: 'website',
        preferred_contact: preferredContact || 'email',
        interest_type: interestType || 'viewing',
      })
      .select()
      .single()

    if (error) {
      console.error('Lead creation error:', error)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      leadId: lead?.id,
      message: 'Thank you! An agent will contact you within 2 hours.'
    })

  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
