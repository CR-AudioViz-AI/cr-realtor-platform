// app/dashboard/specialties/page.tsx
// Agent Specialty Selection - Choose Your 20 Social Impact Niches

'use client'
// 2026-08-20: was a SERVER component gating itself with a cookie-based
// getUser(). Sessions live in localStorage, so it returned null on every request
// - for a signed-in agent too - and redirect() in a page component renders a
// BLANK PAGE rather than issuing a 307. This page never displayed anything.
//
// app/dashboard/layout.tsx already verifies access client-side. Identity and the
// agent's profile now come from /api/me/entitlements, which is behind
// requireUser(). The markup below is unchanged.
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SpecialtySelector from '@/components/SpecialtySelector'


export const metadata = {
  title: 'My Specialties | CR Realtor Platform',
  description: 'Choose your social impact specialties to receive targeted leads'
}

const AVAILABLE_SPECIALTIES = [
  { id: 'veterans', name: 'Veterans', description: 'VA loans, military families, base proximity', market: '$239M', icon: '🪖' },
  { id: 'first_responders', name: 'First Responders', description: 'Police, fire, EMT hero programs', market: '$48M', icon: '🚒' },
  { id: 'seniors', name: 'Seniors 55+', description: 'Downsizing, accessibility, retirement', market: '$478M', icon: '👴' },
  { id: 'first_time_buyers', name: 'First-Time Buyers', description: 'Education, affordable programs', market: '$120M', icon: '🏠' },
  { id: 'faith_based', name: 'Faith-Based', description: 'Churches, ministry housing', market: '$72M', icon: '⛪' },
  { id: 'disabilities', name: 'Disabilities', description: 'ADA accessible, modifications', market: '$156M', icon: '♿' },
  { id: 'healthcare_workers', name: 'Healthcare Workers', description: 'Hospital proximity, shift-friendly', market: '$98M', icon: '🏥' },
  { id: 'teachers', name: 'Teachers & Educators', description: 'Education discounts, grants', market: '$187M', icon: '📚' },
  { id: 'low_income', name: 'Low-Income Housing', description: 'Affordable, Section 8, assistance', market: '$425M', icon: '🏘️' },
  { id: 'single_parents', name: 'Single Parents', description: 'Flexible income, childcare proximity', market: '$142M', icon: '👨‍👧' },
  { id: 'military_families', name: 'Military Families', description: 'PCS moves, BAH optimization', market: '$95M', icon: '🎖️' },
  { id: 'lgbtq', name: 'LGBTQ+ Friendly', description: 'Inclusive communities, safe spaces', market: '$234M', icon: '🏳️‍🌈' },
  { id: 'artists', name: 'Artists & Creatives', description: 'Studio spaces, affordable', market: '$67M', icon: '🎨' },
  { id: 'refugees', name: 'Refugees & Immigrants', description: 'Multilingual, cultural support', market: '$89M', icon: '🌍' },
  { id: 'remote_workers', name: 'Remote Workers', description: 'Home office, gigabit internet', market: '$312M', icon: '💻' },
  { id: 'foster_families', name: 'Foster/Adoptive Families', description: 'Extra bedrooms, licensing', market: '$54M', icon: '👨‍👩‍👧‍👦' },
  { id: 'survivors', name: 'DV Survivors', description: 'Safe, confidential housing', market: '$43M', icon: '🛡️' },
  { id: 'eco_living', name: 'Green/Eco Living', description: 'Solar, sustainable, energy efficient', market: '$287M', icon: '🌱' },
  { id: 'tiny_homes', name: 'Tiny Homes', description: 'Minimalist, affordable living', market: '$78M', icon: '🏡' },
  { id: 'co_living', name: 'Co-Housing', description: 'Intentional communities, shared living', market: '$156M', icon: '🤝' }
]

interface MeProfile { id: string; role?: string; specialties?: string[] }

export default function SpecialtiesPage() {
  const router = useRouter()
  const [me, setMe] = useState<MeProfile | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'denied'>('loading')

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setState('denied'); return }
        const res = await fetch('/api/me/entitlements', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setState('denied'); return }
        const d = await res.json()
        if (!live) return
        // Specialty selection is realtor-only. Absent profile or wrong role is a
        // denial, not an error - the same rule the server version enforced.
        if (!d.isRealtor) { setState('denied'); return }
        setMe(d.profile as MeProfile)
        setState('ready')
      } catch {
        if (live) setState('denied')   // fail closed
      }
    })()
    return () => { live = false }
  }, [])

  useEffect(() => {
    if (state === 'denied') router.replace('/dashboard')
  }, [state, router])

  if (state !== 'ready' || !me) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading your specialties…</div>
      </div>
    )
  }

  const profileData = { role: me.role, specialties: me.specialties }
  const user = { id: me.id }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Choose Your Specialties</h1>
          <p className="text-xl text-gray-600">
            Select the social impact markets you want to serve. You'll receive exclusive leads in these areas.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Stats Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-1">{AVAILABLE_SPECIALTIES.length}</div>
                <div className="text-blue-100">Available Specialties</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">$3.8B</div>
                <div className="text-blue-100">Total Market</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">0</div>
                <div className="text-blue-100">Your Specialties</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">∞</div>
                <div className="text-blue-100">Leads Per Month</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6">How Specialty-Based Leads Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <h3 className="font-bold mb-2">Select Your Specialties</h3>
                <p className="text-sm text-gray-600">Choose 1-5 social impact markets you want to serve. Each has unique needs and opportunities.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <h3 className="font-bold mb-2">Receive Exclusive Leads</h3>
                <p className="text-sm text-gray-600">When buyers search on HomeFinder AI for properties matching your specialties, leads route to YOU.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <h3 className="font-bold mb-2">Close More Deals</h3>
                <p className="text-sm text-gray-600">No bidding wars. No shared leads. These buyers are looking for YOUR expertise.</p>
              </div>
            </div>
          </div>

          {/* Specialty Grid */}
          <SpecialtySelector 
            specialties={AVAILABLE_SPECIALTIES} 
            currentSpecialties={profileData.specialties || []}
            userId={user.id}
          />

          {/* Pricing Notice */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mt-8">
            <div className="flex items-start">
              <div className="text-3xl mr-4">💰</div>
              <div>
                <h3 className="text-xl font-bold text-emerald-900 mb-2">Included in Your $399/month Plan</h3>
                <p className="text-emerald-800">
                  Unlimited leads from ALL selected specialties. No per-lead fees. No bidding. Just exclusive opportunities in your chosen markets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
