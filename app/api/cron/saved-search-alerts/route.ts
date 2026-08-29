import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
export const dynamic = 'force-dynamic'
export const revalidate = 0
// app/api/cron/saved-search-alerts/route.ts
// Cron job to send saved search email alerts
// Run daily via Vercel Cron
// Created: December 1, 2025 - 2:15 PM EST

import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET

interface SavedSearch {
  id: string
  customer_id: string
  name: string
  criteria: {
    cities?: string[]
    min_price?: number
    max_price?: number
    bedrooms?: number
    bathrooms?: number
    property_types?: string[]
    features?: string[]
  }
  email_alerts: boolean
  alert_frequency: 'daily' | 'weekly' | 'instant'
  last_alert_sent_at: string | null
  customers: {
    id: string
    full_name: string
    email: string
    assigned_agent_id: string
    profiles: {
      full_name: string
      email: string
    }
  }
}

interface NewListing {
  id: string
  address: string
  city: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  images: string[]
  created_at: string
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    processed: 0,
    alerts_sent: 0,
    errors: [] as string[],
  }

  try {
    // Get all saved searches that have alerts enabled
    const { data: searches, error: searchError } = await supabase
      .from('saved_searches')
      .select(`
        id,
        customer_id,
        name,
        criteria,
        email_alerts,
        alert_frequency,
        last_alert_sent_at,
        customers (
          id,
          full_name,
          email,
          assigned_agent_id,
          profiles:assigned_agent_id (
            full_name,
            email
          )
        )
      `)
      .eq('email_alerts', true)
      .eq('is_active', true)

    if (searchError) {
      throw new Error(`Failed to fetch saved searches: ${searchError.message}`)
    }

    if (!searches || searches.length === 0) {
      return NextResponse.json({ message: 'No saved searches with alerts enabled', results })
    }

    // Process each saved search
    for (const search of searches as unknown as SavedSearch[]) {
      results.processed++

      // Check if we should send alert based on frequency
      if (search.last_alert_sent_at) {
        const lastSent = new Date(search.last_alert_sent_at)
        const now = new Date()
        const hoursSinceLastAlert = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)

        if (search.alert_frequency === 'daily' && hoursSinceLastAlert < 24) continue
        if (search.alert_frequency === 'weekly' && hoursSinceLastAlert < 168) continue
      }

      // Build query based on criteria
      let query = supabase
        .from('properties')
        .select('id, address, city, price, bedrooms, bathrooms, square_feet, images, created_at')
        .eq('status', 'active')

      const criteria = search.criteria || {}

      // Apply filters
      if (criteria.cities?.length) {
        query = query.in('city', criteria.cities)
      }
      if (criteria.min_price) {
        query = query.gte('price', criteria.min_price)
      }
      if (criteria.max_price) {
        query = query.lte('price', criteria.max_price)
      }
      if (criteria.bedrooms) {
        query = query.gte('bedrooms', criteria.bedrooms)
      }
      if (criteria.bathrooms) {
        query = query.gte('bathrooms', criteria.bathrooms)
      }
      if (criteria.property_types?.length) {
        query = query.in('property_type', criteria.property_types)
      }

      // Only get listings created since last alert (or last 7 days for first alert)
      const sinceDate = search.last_alert_sent_at 
        ? new Date(search.last_alert_sent_at).toISOString()
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      query = query.gte('created_at', sinceDate)
      query = query.order('created_at', { ascending: false })
      query = query.limit(10)

      const { data: newListings, error: listingsError } = await query

      if (listingsError) {
        results.errors.push(`Search ${search.id}: ${listingsError.message}`)
        continue
      }

      // Skip if no new listings
      if (!newListings || newListings.length === 0) {
        continue
      }

      // Send email alert
      const customer = search.customers
      if (!customer?.email) {
        results.errors.push(`Search ${search.id}: No customer email`)
        continue
      }

      try {
        // Send via your email service (Resend, SendGrid, etc.)
        // For now, we'll log and update the database
        
        console.log(`Sending alert to ${customer.email}:`)
        console.log(`  Search: ${search.name}`)
        console.log(`  New listings: ${newListings.length}`)
        console.log(`  Listings: ${newListings.map((l: { address: string }) => l.address).join(', ')}`)

        // In production, you would call your email service here:
        // await sendEmail({
        //   to: customer.email,
        //   subject: `${newListings.length} New Listings Match Your Search "${search.name}"`,
        //   template: 'saved-search-alert',
        //   data: {
        //     customerName: customer.full_name,
        //     searchName: search.name,
        //     listings: newListings,
        //     agentName: customer.profiles?.full_name,
        //     agentEmail: customer.profiles?.email,
        //   }
        // })

        // Update last alert sent timestamp
        await supabase
          .from('saved_searches')
          .update({ 
            last_alert_sent_at: new Date().toISOString(),
            new_listings_count: newListings.length,
          })
          .eq('id', search.id)

        results.alerts_sent++
      } catch (emailError: any) {
        results.errors.push(`Search ${search.id}: Email error - ${emailError.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        results 
      }, 
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
