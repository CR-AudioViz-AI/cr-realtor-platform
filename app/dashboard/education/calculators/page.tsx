'use client'
import Link from 'next/link'
// 2026-08-20: was a SERVER component gating on a cookie-based getUser(). Sessions
// live in localStorage, so it returned null every time and redirect() renders a
// BLANK PAGE rather than a 307. This page never displayed anything.
//
// app/dashboard/layout.tsx already verifies access; the two entitlement flags come
// from /api/me/entitlements, behind requireUser(). Markup unchanged.
import { useEffect, useState } from 'react'
import {
  Calculator, ExternalLink, Home, DollarSign, TrendingUp,
  RefreshCcw, Scale, CreditCard, ArrowRight, Lock, Zap,
  CheckCircle, BarChart3, PiggyBank
} from 'lucide-react';



// Calculators available in the Mortgage Rate Monitor app
const MORTGAGE_APP_CALCULATORS = [
  {
    name: 'Mortgage Payment Calculator',
    description: 'Calculate monthly payments with taxes, insurance, and PMI',
    icon: Home,
    available: true,
  },
  {
    name: 'Affordability Calculator',
    description: 'How much home can you afford based on income and debts',
    icon: DollarSign,
    available: true,
  },
  {
    name: 'Refinance Calculator',
    description: 'Should you refinance? Calculate potential savings',
    icon: RefreshCcw,
    available: true,
  },
  {
    name: 'Rent vs Buy Calculator',
    description: 'Compare the long-term costs of renting vs buying',
    icon: Scale,
    available: true,
  },
  {
    name: 'Extra Payment Calculator',
    description: 'See how extra payments reduce your loan term and interest',
    icon: PiggyBank,
    available: true,
  },
]

// Additional calculators unique to Realtor Platform (add-on features)
const REALTOR_CALCULATORS = [
  {
    name: 'Investment Property Analyzer',
    description: 'Cap rate, cash-on-cash, NOI, and ROI calculations',
    icon: TrendingUp,
    addon: 'education',
  },
  {
    name: 'Closing Cost Estimator',
    description: 'Estimate all buyer and seller closing costs',
    icon: CreditCard,
    addon: 'education',
  },
  {
    name: 'Commission Calculator',
    description: 'Calculate your commission on any transaction',
    icon: BarChart3,
    addon: 'crm',
  },
]

export default function CalculatorsPage() {
  const [hasEducation, setHasEducation] = useState(false)
  const [hasCRM, setHasCRM] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setReady(true); return }
        const res = await fetch('/api/me/entitlements', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setReady(true); return }
        const d = await res.json()
        if (!live) return
        setHasEducation(Boolean(d.entitlements?.education))
        setHasCRM(Boolean(d.entitlements?.crm))
        setReady(true)
      } catch {
        if (live) setReady(true)   // fail closed: both stay false
      }
    })()
    return () => { live = false }
  }, [])

  if (!ready) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse text-gray-500">Checking your access…</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold">Financial Calculators</h1>
          <p className="text-gray-600">Powered by CR AudioViz AI Mortgage Platform</p>
        </div>
      </div>

      {/* Mortgage App Integration Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Mortgage Rate Monitor</h2>
            <p className="text-blue-100 mb-4">
              Access our full suite of mortgage calculators, live rates, and lender comparisons.
              All tools are included with your realtor account!
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {MORTGAGE_APP_CALCULATORS.slice(0, 3).map(calc => (
                <span key={calc.name} className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-full">
                  <CheckCircle size={14} /> {calc.name.replace(' Calculator', '')}
                </span>
              ))}
            </div>
          </div>
          <a 
            href="https://mortgage.craudiovizai.com/calculators" 
            target="_blank"
            className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 whitespace-nowrap"
          >
            Open Calculators <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* Included Calculators Grid */}
      <h2 className="text-xl font-bold mb-4">Included Calculators</h2>
      <p className="text-gray-600 mb-6">These calculators are available through our Mortgage Rate Monitor integration:</p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {MORTGAGE_APP_CALCULATORS.map(calc => (
          <a
            key={calc.name}
            href="https://mortgage.craudiovizai.com/calculators"
            target="_blank"
            className="bg-white rounded-xl border p-5 hover:shadow-lg hover:border-blue-300 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <calc.icon className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 group-hover:text-blue-600">{calc.name}</h3>
                <p className="text-sm text-gray-600">{calc.description}</p>
              </div>
              <ExternalLink className="text-gray-400 group-hover:text-blue-600" size={18} />
            </div>
          </a>
        ))}
      </div>

      {/* Realtor-Specific Calculators (Add-ons) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Premium Calculators</h2>
        <Link href="/dashboard/addons" className="text-blue-600 hover:underline flex items-center gap-1">
          View Add-Ons <ArrowRight size={16} />
        </Link>
      </div>
      <p className="text-gray-600 mb-6">Advanced tools for real estate professionals:</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REALTOR_CALCULATORS.map(calc => {
          const hasAccess = 
            (calc.addon === 'education' && hasEducation) ||
            (calc.addon === 'crm' && hasCRM)

          return (
            <div
              key={calc.name}
              className={`bg-white rounded-xl border p-5 ${
                hasAccess ? 'hover:shadow-lg hover:border-green-300 cursor-pointer' : 'opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${hasAccess ? 'bg-green-50' : 'bg-gray-100'}`}>
                  <calc.icon className={hasAccess ? 'text-green-600' : 'text-gray-400'} size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{calc.name}</h3>
                    {!hasAccess && <Lock className="text-gray-400" size={14} />}
                  </div>
                  <p className="text-sm text-gray-600">{calc.description}</p>
                  {!hasAccess && (
                    <Link href="/dashboard/addons" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                      Unlock with {calc.addon === 'education' ? 'Education Center' : 'CRM Pro'} add-on
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Embed Widget Promo */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6 border">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <Zap className="text-amber-500" size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold mb-1">Embed Calculators on Your Website</h3>
            <p className="text-gray-600">
              The Mortgage Rate Monitor offers embeddable widgets you can add to your personal website. 
              Show clients live rates and calculators with your branding.
            </p>
          </div>
          <a 
            href="https://mortgage.craudiovizai.com/api-docs"
            target="_blank"
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
          >
            Learn More <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  )
}
