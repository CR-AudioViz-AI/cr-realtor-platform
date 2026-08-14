'use client'

// components/AttributionTracker.tsx
//
// Middleware sets the cookies; this fires the event. Without it the chain never
// starts — which is why /api/attribution, written in December, had never
// recorded a single row.
//
// Fires once per session per agent. Attribution is a fact about how someone
// arrived, not a page-view counter, and re-posting on every navigation would
// bury the real touchpoints in noise.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { useEffect } from 'react'

function cookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : null
}

export default function AttributionTracker() {
  useEffect(() => {
    const sessionId = cookie('zsid')
    const agentRef = cookie('zref')
    if (!sessionId || !agentRef) return

    // One post per session per agent. sessionStorage is the right scope: it
    // survives navigation within the visit and resets on a genuinely new one.
    const marker = `zattr:${sessionId}:${agentRef}`
    try {
      if (sessionStorage.getItem(marker)) return
      sessionStorage.setItem(marker, '1')
    } catch {
      // Private browsing can throw on sessionStorage. Recording a duplicate is
      // better than recording nothing, so carry on.
    }

    const url = new URL(window.location.href)
    const utm = {
      source: url.searchParams.get('utm_source') ?? undefined,
      medium: url.searchParams.get('utm_medium') ?? undefined,
      campaign: url.searchParams.get('utm_campaign') ?? undefined,
      term: url.searchParams.get('utm_term') ?? undefined,
      content: url.searchParams.get('utm_content') ?? undefined,
    }

    void fetch('/api/attribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        agent_ref: agentRef,
        source: document.referrer ? 'referral' : 'direct',
        landing_page: url.pathname + url.search,
        referrer_url: document.referrer || null,
        utm,
      }),
      // Attribution must never delay or break what the visitor came to see.
      keepalive: true,
    }).catch(() => {})
  }, [])

  return null
}
