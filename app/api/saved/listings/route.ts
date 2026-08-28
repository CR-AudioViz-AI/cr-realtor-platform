// app/api/saved/listings/route.ts — save a home
//
// 2026-08-14: Zoyzy had none of the ten account features in the spec — no saved
// properties, no saved searches, no alerts, no compare, no recently viewed. A
// property search you cannot save anything in is a search engine, not a
// product; saving is what brings someone back.
//
// Writes to saved_listings, not the pre-existing saved_properties. That table
// foreign-keys property_id to properties(id), a uuid, and is correct for our
// own inventory — but RentCast ids are strings like
// '5529-5531-10th-Ave,-Fort-Myers,-FL-33907'. Widening that column would break
// a working foreign key on a table holding real rows.
//
// The listing snapshot is stored with the reference. A saved home whose price
// and address vanish when the feed drops it is not saved at all, and RentCast
// is capped at 50 requests a month — re-fetching every saved listing on every
// dashboard view would exhaust that in a day.
//
// CR AudioViz AI, LLC · EIN 39-3646201
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = 'force-dynamic'

let _db: SupabaseClient | null = null
function db(): SupabaseClient {
  if (_db) return _db
  const url = supabaseUrl()
  const key = secretKey()
  if (!url || !key) throw new Error('Supabase is not configured')
  _db = createClient(url, key, { auth: { persistSession: false } })
  return _db
}

/** The signed-in user, or null. Saved homes are private; there is no anonymous mode. */
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
      .from('saved_listings')
      .select('id, listing_ref, source, snapshot, notes, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, count: data?.length ?? 0, saved: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to load saved homes' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await userFrom(request)
    if (!userId) return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 })

    const body = (await request.json()) as {
      listing_ref?: string
      source?: string
      snapshot?: Record<string, unknown>
      notes?: string
    }
    const listingRef = body.listing_ref?.trim()
    if (!listingRef) {
      return NextResponse.json({ success: false, message: 'listing_ref is required' }, { status: 400 })
    }

    // upsert: saving twice is a no-op, not an error the UI has to handle.
    const { data, error } = await db()
      .from('saved_listings')
      .upsert(
        {
          user_id: userId,
          listing_ref: listingRef,
          source: body.source ?? 'rentcast',
          snapshot: body.snapshot ?? {},
          notes: body.notes ?? null,
        },
        { onConflict: 'user_id,listing_ref' },
      )
      .select('id')
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to save' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await userFrom(request)
    if (!userId) return NextResponse.json({ success: false, message: 'Sign in required' }, { status: 401 })

    const listingRef = request.nextUrl.searchParams.get('listing_ref')
    if (!listingRef) {
      return NextResponse.json({ success: false, message: 'listing_ref is required' }, { status: 400 })
    }

    const { error } = await db()
      .from('saved_listings')
      .delete()
      .eq('user_id', userId)
      .eq('listing_ref', listingRef)

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to remove' },
      { status: 500 },
    )
  }
}
