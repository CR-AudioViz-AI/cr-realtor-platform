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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Updated to match actual database columns
    const propertyType = searchParams.get('property_type') || searchParams.get('category')
    const city = searchParams.get('city')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const bedrooms = searchParams.get('bedrooms')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status') || 'active'

    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    // Use correct column names
    if (propertyType) query = query.eq('property_type', propertyType)
    if (city) query = query.ilike('city', `%${city}%`)
    if (minPrice) query = query.gte('price', parseInt(minPrice))
    if (maxPrice) query = query.lte('price', parseInt(maxPrice))
    if (bedrooms) query = query.gte('bedrooms', parseInt(bedrooms))
    if (featured === 'true') query = query.eq('is_featured', true)  // Fixed: is_featured not featured

    const { data: properties, error } = await query

    if (error) {
      console.error('Properties fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ properties: properties || [] })
  } catch (error: any) {
    console.error('Properties API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const propertyData = {
      ...body,
      agent_id: user.id,  // Fixed: agent_id not listing_agent_id
      status: body.status || 'active',
    }

    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (error) {
      console.error('Property insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ property: data })
  } catch (error: any) {
    console.error('Property POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
