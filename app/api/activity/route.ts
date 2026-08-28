import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Central Supabase for logging
const SUPABASE_URL = supabaseUrl()
const SUPABASE_SERVICE_KEY = secretKey()

const supabase = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, appId, metadata } = body

    if (!userId || !action || !appId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Try to log to central Supabase
    if (supabase) {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          app_id: appId,
          metadata,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Activity log error:', error)
      }
    }

    // Also try to forward to central API
    try {
      await fetch('https://craudiovizai.com/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, appId, metadata })
      })
    } catch (e) {
      // Don't fail if central API is unavailable
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Activity API error:', error)
    return NextResponse.json({ success: true }) // Don't block user flow
  }
}
