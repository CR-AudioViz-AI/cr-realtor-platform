// app/api/saved/searches/route.ts — saved searches and new-listing alerts
//
// A saved search is what turns a property site from somewhere you visit once
// into somewhere you return to. It is also the mechanic that makes agent
// attribution pay: the visitor who saved a search under an agent's ref comes
// back through that agent's alert.
//
// last_seen_ids exists so an alert can say "3 new" rather than re-sending the
// whole result set. Without it every alert is a full search dump and people
// unsubscribe.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = 'force-dynamic'

const FREQUENCIES = new Set(['instant', 'daily', 'weekly'])

let _db: SupabaseClient | null = null
function db(): SupabaseClient {
  if (_db) return _db
  const url = supabaseUrl()
  const key = secretKey()
  if (!url || !key) throw new Error('Supabase is not configured')
  _db = createClient(url, key, { auth: { persistSession: false } })
  return _db
}

async function userFrom(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const { data } = await db().auth.getUser(auth.slice(7).trim())
  return data?.user?.id ?? null
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await userFrom(request)
    if (!userId) return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 })

    const { data, error } = await db()
      .from('saved_searches')
      .select('id, name, criteria, alert_enabled, alert_frequency, last_run_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, count: data?.length ?? 0, searches: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to load searches' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await userFrom(request)
    if (!userId) return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 })

    const body = (await request.json()) as {
      name?: string
      criteria?: Record<string, unknown>
      alert_enabled?: boolean
      alert_frequency?: string
    }

    const name = body.name?.trim()
    if (!name || !body.criteria || Object.keys(body.criteria).length === 0) {
      return NextResponse.json(
        { success: false, message: 'name and criteria are required' },
        { status: 400 },
      )
    }

    const frequency = body.alert_frequency ?? 'daily'
    if (!FREQUENCIES.has(frequency)) {
      return NextResponse.json(
        { success: false, message: 'alert_frequency must be instant, daily or weekly' },
        { status: 400 },
      )
    }

    const { data, error } = await db()
      .from('saved_searches')
      .insert({
        user_id: userId,
        name,
        criteria: body.criteria,
        alert_enabled: body.alert_enabled ?? false,
        alert_frequency: frequency,
      })
      .select('id')
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to save search' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await userFrom(request)
    if (!userId) return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 })

    const body = (await request.json()) as {
      id?: string
      alert_enabled?: boolean
      alert_frequency?: string
      name?: string
    }
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'id is required' }, { status: 400 })
    }
    if (body.alert_frequency && !FREQUENCIES.has(body.alert_frequency)) {
      return NextResponse.json(
        { success: false, message: 'alert_frequency must be instant, daily or weekly' },
        { status: 400 },
      )
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.alert_enabled !== undefined) patch.alert_enabled = body.alert_enabled
    if (body.alert_frequency) patch.alert_frequency = body.alert_frequency
    if (body.name) patch.name = body.name

    // Scoped to the owner: an id alone must never be enough to edit someone
    // else's alert.
    const { error } = await db()
      .from('saved_searches')
      .update(patch)
      .eq('id', body.id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await userFrom(request)
    if (!userId) return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'id is required' }, { status: 400 })

    const { error } = await db().from('saved_searches').delete().eq('id', id).eq('user_id', userId)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 },
    )
  }
}
