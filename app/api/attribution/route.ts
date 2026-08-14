// app/api/attribution/route.ts — agent attribution
//
// The commercial premise of Zoyzy: a consumer who arrives through an agent's
// link stays attributed to that agent, so the lead routes to them and no
// 35-40% referral fee is paid to anyone.
//
// 2026-08-14 rewrite. What was wrong with the previous version:
//
//   It defined getSupabase() and then used a bare `supabase` identifier that
//   was never declared — lines 46, 85, 142 and 220. Every request threw a
//   ReferenceError. Confirmed against production: POST returned
//   {"success":false,"message":"Failed to record attribution"}. Not one
//   attribution event has ever been recorded.
//
//   It queried attribution_events and attribution_chains, neither of which
//   existed in the database.
//
//   It checked consent_records for agent_id, status, scope and expires_at.
//   That table has none of those columns — it has session_id, purposes (jsonb)
//   and recorded_at. The consent gate could never have passed.
//
// The design fault underneath: it assumed a signed-in user with a known
// agent_id at the moment of attribution. The actual case is an ANONYMOUS
// visitor clicking zoyzy.com/search?ref=tony-harvey. There is no user yet —
// only a session. Events carry session_id and gain user_id later, at signup.
//
// CR AudioViz AI, LLC · EIN 39-3646201
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** Built on first use — a build must never need a service-role key. */
let _db: SupabaseClient | null = null
function db(): SupabaseClient {
  if (_db) return _db
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for attribution')
  }
  _db = createClient(url, key, { auth: { persistSession: false } })
  return _db
}

const ATTRIBUTION_WINDOW_DAYS = 30

interface Body {
  session_id?: string
  user_id?: string | null
  agent_ref?: string
  source?: string
  landing_page?: string
  referrer_url?: string | null
  utm?: Record<string, string | undefined>
}

/**
 * Confidence that this attribution is real rather than noise. Not a gate —
 * a low score is still recorded, because the alternative is silently losing a
 * legitimate lead. It exists so disputes between agents can be judged.
 */
function trustScore(b: Body): number {
  let score = 50
  if (b.referrer_url) score += 10
  if (b.utm?.source) score += 10
  if (b.utm?.medium) score += 10
  if (b.utm?.campaign) score += 10
  if (b.source === 'referral') score += 8
  return Math.min(score, 100)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const sessionId = body.session_id?.trim()
  const agentRef = body.agent_ref?.trim()
  if (!sessionId || !agentRef) {
    return NextResponse.json(
      { success: false, message: 'session_id and agent_ref are required' },
      { status: 400 },
    )
  }

  try {
    const sb = db()

    // Consent is checked against the table as it actually exists: purposes is
    // jsonb, and attribution is only recorded when the visitor allowed it.
    // No consent record simply means no tracking — not an error, and never a
    // reason to fail the page the visitor is looking at.
    const { data: consent } = await sb
      .from('consent_records')
      .select('id, purposes, recorded_at')
      .eq('session_id', sessionId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const purposes = (consent?.purposes ?? []) as unknown
    const allowed =
      Array.isArray(purposes)
        ? purposes.includes('attribution') || purposes.includes('all')
        : typeof purposes === 'object' && purposes !== null
          ? Boolean((purposes as Record<string, unknown>).attribution)
          : false

    if (!consent || !allowed) {
      return NextResponse.json({
        success: true,
        tracked: false,
        message: 'Attribution not recorded — no consent for this session',
      })
    }

    const score = trustScore(body)

    const { data: event, error: eventErr } = await sb
      .from('attribution_events')
      .insert({
        session_id: sessionId,
        user_id: body.user_id ?? null,
        agent_ref: agentRef,
        source: body.source ?? 'referral',
        landing_page: body.landing_page ?? null,
        referrer_url: body.referrer_url ?? null,
        utm_source: body.utm?.source ?? null,
        utm_medium: body.utm?.medium ?? null,
        utm_campaign: body.utm?.campaign ?? null,
        utm_term: body.utm?.term ?? null,
        utm_content: body.utm?.content ?? null,
        trust_score: score,
        consent_id: consent.id,
      })
      .select('id')
      .single()

    if (eventErr) throw new Error(eventErr.message)

    // The chain is what an agent is actually paid on. first_touch is never
    // overwritten: the agent whose link brought the visitor keeps the credit
    // even if the visitor later arrives directly.
    const touchpoint = {
      id: event.id,
      agent_ref: agentRef,
      source: body.source ?? 'referral',
      at: new Date().toISOString(),
    }

    const { data: chain } = await sb
      .from('attribution_chains')
      .select('id, touchpoints, first_touch_agent')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (chain) {
      const touchpoints = [...((chain.touchpoints as unknown[]) ?? []), touchpoint]
      await sb
        .from('attribution_chains')
        .update({
          touchpoints,
          last_touch_agent: agentRef,
          total_touchpoints: touchpoints.length,
          user_id: body.user_id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chain.id)
    } else {
      await sb.from('attribution_chains').insert({
        session_id: sessionId,
        user_id: body.user_id ?? null,
        first_touch_agent: agentRef,
        last_touch_agent: agentRef,
        touchpoints: [touchpoint],
        total_touchpoints: 1,
        expires_at: new Date(Date.now() + ATTRIBUTION_WINDOW_DAYS * 86400000).toISOString(),
      })
    }

    return NextResponse.json({ success: true, tracked: true, attribution_id: event.id, trust_score: score })
  } catch (error) {
    // An attribution failure must never break the page the visitor is on.
    return NextResponse.json(
      { success: false, tracked: false, message: error instanceof Error ? error.message : 'Failed to record attribution' },
      { status: 500 },
    )
  }
}

/** Agent-facing reporting. Identity is checked here, not left to RLS. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const agentRef = request.nextUrl.searchParams.get('agent_ref')
  if (!agentRef) {
    return NextResponse.json({ success: false, message: 'agent_ref is required' }, { status: 400 })
  }

  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sb = db()
    const { data: user } = await sb.auth.getUser(auth.slice(7).trim())
    if (!user?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { data: events, error } = await sb
      .from('attribution_events')
      .select('id, session_id, user_id, agent_ref, source, landing_page, trust_score, created_at')
      .eq('agent_ref', agentRef)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw new Error(error.message)

    const bySource: Record<string, number> = {}
    let total = 0
    for (const e of events ?? []) {
      bySource[e.source] = (bySource[e.source] ?? 0) + 1
      total += e.trust_score ?? 0
    }

    return NextResponse.json({
      success: true,
      events,
      stats: {
        total: events?.length ?? 0,
        by_source: bySource,
        average_trust_score: events?.length ? Math.round(total / events.length) : 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to retrieve attribution' },
      { status: 500 },
    )
  }
}
