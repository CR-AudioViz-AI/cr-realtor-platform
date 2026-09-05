export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'

/**
 * 2026-09-04: the actor comes from the caller's token, not from the body.
 *
 * This recorded activity under whichever userId was posted, against a
 * service-role client. Anyone could write entries into another person's activity
 * history - which is both a falsified audit trail and, since the same rows drive
 * usage reporting, a way to attribute someone else's usage to them.
 */
async function callerId(request: Request): Promise<string | null> {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  if (!token) return null
  try {
    const { data, error } = await getSupabase().auth.getUser(token)
    if (error || !data?.user) return null
    return data.user.id
  } catch {
    return null
  }
}

function unauthorised(): NextResponse {
  return NextResponse.json({ error: 'Sign in required.', code: 'AUTH_REQUIRED' }, { status: 401 })
}
import { createClient } from '@supabase/supabase-js'

// Central Supabase for logging
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // userId deliberately not taken from the body.
    const { action, appId, metadata } = body

    const userId = await callerId(request)
    if (!userId) return unauthorised()

    if (!action || !appId) {
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
