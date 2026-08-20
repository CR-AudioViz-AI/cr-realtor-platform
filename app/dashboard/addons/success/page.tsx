'use client'
// 2026-08-20: this page GRANTED the entitlement itself - it upserted
// addon_subscriptions to status 'active' using an addon id taken from the QUERY
// STRING. Anyone visiting ?addon=full-bundle would have self-granted the most
// expensive bundle. It was inert only because its cookie-based auth could never
// find a session, so the bug was accidentally the protection.
//
// It also carried the comment "webhook will also do this, but belt & suspenders".
// There was NO webhook. This page was the only path that ever activated an add-on,
// and it never ran, so every customer who paid received nothing.
//
// Now it CONFIRMS and grants nothing. app/api/webhooks/stripe verifies Stripe's
// signature and grants from metadata we set at checkout; this page polls
// /api/me/entitlements to report what actually happened.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'


const ADDON_NAMES: Record<string, string> = {
  'education': 'Education Center',
  'crm': 'Lead Scoring & CRM Pro',
  'vendors': 'Vendor Network',
  'marketing': 'Property Marketing Suite',
  'ai-assistant': 'AI Assistant Pro',
  'full-bundle': 'Complete Realtor Suite',
}

const ADDON_PATHS: Record<string, string> = {
  'education': '/dashboard/education',
  'crm': '/dashboard/crm',
  'vendors': '/dashboard/vendors',
  'marketing': '/dashboard/marketing',
  'ai-assistant': '/dashboard/assistant',
  'full-bundle': '/dashboard',
}

export default function SuccessPage() {
  const [state, setState] = useState<'checking' | 'active' | 'pending'>('checking')
  const [addonId, setAddonId] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    let tries = 0
    const poll = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setState('pending'); return }
        const res = await fetch('/api/me/entitlements', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (res.ok) {
          const d = await res.json()
          const owned: string[] = d.addons ?? []
          if (!live) return
          if (owned.length) {
            setAddonId(owned[owned.length - 1])
            setState('active')
            return
          }
        }
      } catch { /* fall through to the retry */ }
      // The webhook usually lands within a second or two, but Stripe does not
      // promise it has arrived before the browser gets here. Poll briefly rather
      // than claim success we cannot see, or declare failure too early.
      if (live && tries++ < 6) setTimeout(poll, 1500)
      else if (live) setState('pending')
    }
    poll()
    return () => { live = false }
  }, [])

  const addonName = (addonId && ADDON_NAMES[addonId]) || 'Your add-on'
  const addonPath = (addonId && ADDON_PATHS[addonId]) || '/dashboard'

  if (state === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-pulse text-gray-500 mb-2">Confirming your payment…</div>
          <p className="text-sm text-gray-400">This usually takes a moment.</p>
        </div>
      </div>
    )
  }

  if (state === 'pending') {
    // Deliberately does NOT say "activated". The payment may well have gone
    // through - it is the ACTIVATION we cannot confirm yet, and claiming
    // otherwise is how a customer ends up believing they have access they do not.
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Payment received</h1>
          <p className="text-gray-600 mb-6">
            We are still confirming your add-on. This can take a minute. If it has not
            appeared shortly, contact support with your receipt and we will sort it out -
            you will not be charged twice.
          </p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">You're All Set!</h1>
          <p className="text-gray-600 mb-6">
            <span className="font-semibold text-green-600">{addonName}</span> has been activated on your account.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Sparkles className="text-amber-500" size={20} />
              <span>Your add-on is ready to use!</span>
            </div>
          </div>

          <Link href={addonPath}>
            <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2 mb-4">
              Go to {addonName} <ArrowRight size={18} />
            </button>
          </Link>

          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            Return to Dashboard
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          A receipt has been sent to your email.
        </p>
      </div>
    </div>
  )
}
