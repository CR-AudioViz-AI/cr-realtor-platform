'use client'
import Link from 'next/link'
// 2026-08-20: was a SERVER component gating itself with a cookie-based getUser().
// Sessions live in localStorage, so it returned null on every request and
// redirect() renders a BLANK PAGE rather than a 307. This page never displayed.
//
// app/dashboard/layout.tsx already verifies access; the mortgage-plan discount
// comes from /api/me/entitlements, behind requireUser(). Markup unchanged.
import { useEffect, useState } from 'react'
import {
  Package, Check, Zap, GraduationCap, Building2, Target, 
  Share2, Bot, CreditCard, ArrowRight, Star, Shield,
  Calculator, TrendingUp, Users, Sparkles, ExternalLink
} from 'lucide-react';



const ADDONS = [
  {
    id: 'education',
    name: 'Education Center',
    description: 'Complete education library for your clients. First-time buyer courses, investing guides, and glossary access.',
    price: 49,
    icon: GraduationCap,
    color: 'from-blue-500 to-indigo-600',
    features: [
      'First-Time Homebuyer Academy (12 modules)',
      'Real Estate Investing 101 (10 modules)',
      'Home Seller Masterclass (8 modules)',
      '100+ term glossary',
      'Downloadable checklists & worksheets',
      'Certificate program access',
      'Share with unlimited clients',
    ],
    popular: true,
  },
  {
    id: 'crm',
    name: 'Lead Scoring & CRM Pro',
    description: 'AI-powered lead scoring, follow-up automation, and advanced CRM tools.',
    price: 79,
    icon: Target,
    color: 'from-purple-500 to-violet-600',
    features: [
      'Automatic A-F lead grading',
      'Hot/Warm/Cold prioritization',
      'Automated follow-up reminders',
      'Email template library (20+ templates)',
      'Kanban pipeline management',
      'Client activity tracking',
      'Performance analytics',
    ],
    popular: false,
  },
  {
    id: 'vendors',
    name: 'Vendor Network',
    description: 'Premium vendor directory with featured listings and priority connections.',
    price: 29,
    icon: Building2,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Access 500+ verified vendors',
      'Title companies, lenders, inspectors',
      'Insurance, contractors, photographers',
      'Priority contact queue',
      'Vendor ratings & reviews',
      'Custom referral tracking',
      'Commission tracking (coming soon)',
    ],
    popular: false,
  },
  {
    id: 'marketing',
    name: 'Property Marketing Suite',
    description: 'Professional marketing tools for every listing.',
    price: 39,
    icon: Share2,
    color: 'from-amber-500 to-orange-600',
    features: [
      'QR code generator for listings',
      'Social media share widgets',
      'Property comparison tool',
      'Interactive neighborhood maps',
      'School finder integration',
      'Weather widgets for open houses',
      'Printable flyer templates',
    ],
    popular: false,
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant Pro',
    description: 'AI-powered assistant to answer client questions 24/7.',
    price: 49,
    icon: Bot,
    color: 'from-cyan-500 to-blue-600',
    features: [
      'Expert real estate knowledge base',
      'Answers buying & selling questions',
      'Mortgage & financing guidance',
      'Legal term explanations',
      'Market insights',
      'Embed on your website',
      'Branded with your info',
    ],
    popular: false,
  },
]

const BUNDLE = {
  id: 'full-bundle',
  name: 'Complete Realtor Suite',
  description: 'Everything you need to dominate your market. All add-ons included.',
  price: 149,
  savings: 96,
  icon: Sparkles,
  color: 'from-pink-500 via-purple-500 to-indigo-600',
  includes: ['Education Center', 'Lead Scoring & CRM Pro', 'Vendor Network', 'Property Marketing Suite', 'AI Assistant Pro'],
}

const MORTGAGE_INTEGRATION = {
  name: 'Mortgage Rate Monitor Integration',
  description: 'Already included with any add-on! Connect to our powerful mortgage tools.',
  icon: Calculator,
  features: [
    'Live mortgage rate display',
    'Payment calculators',
    'Affordability calculator',
    'Refinance calculator',
    'Rent vs Buy analysis',
    'Rate alerts for clients',
    'Embeddable widgets',
  ],
  link: 'https://mortgage.craudiovizai.com',
}

export default function AddOnsPage() {
  const [hasMortgageApp, setHasMortgageApp] = useState<boolean | null>(null)

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setHasMortgageApp(false); return }
        const res = await fetch('/api/me/entitlements', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setHasMortgageApp(false); return }
        const d = await res.json()
        if (live) setHasMortgageApp(Boolean(d.hasMortgageApp))
      } catch {
        if (live) setHasMortgageApp(false)   // fail closed: no discount
      }
    })()
    return () => { live = false }
  }, [])

  // Undecided is treated as NO discount rather than showing a price that might
  // drop a moment later - a price that changes under the reader is worse than a
  // price that is simply full.
  const discountPercent = hasMortgageApp ? 20 : 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm mb-4">
          <Zap size={16} /> Supercharge Your Business
        </div>
        <h1 className="text-4xl font-bold mb-4">Premium Add-Ons</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Powerful tools to help you serve clients better and close more deals. 
          All add-ons integrate seamlessly with our Mortgage Rate Monitor.
        </p>
        
        {hasMortgageApp && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <Star size={16} /> You get 20% off as a Mortgage App subscriber!
          </div>
        )}
      </div>

      {/* Mortgage Integration Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/10 rounded-xl">
            <Calculator size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">{MORTGAGE_INTEGRATION.name}</h2>
            <p className="text-gray-300 mb-4">{MORTGAGE_INTEGRATION.description}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {MORTGAGE_INTEGRATION.features.slice(0, 4).map(f => (
                <span key={f} className="text-xs bg-white/10 px-3 py-1 rounded-full">{f}</span>
              ))}
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full">+{MORTGAGE_INTEGRATION.features.length - 4} more</span>
            </div>
          </div>
          <a 
            href={MORTGAGE_INTEGRATION.link} 
            target="_blank"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium whitespace-nowrap"
          >
            Open Mortgage App <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* Bundle Deal */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-2xl p-1 mb-8">
        <div className="bg-white rounded-xl p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white">
              <BUNDLE.icon size={48} />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
                <h2 className="text-2xl font-bold">{BUNDLE.name}</h2>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                  Save ${BUNDLE.savings}/mo
                </span>
              </div>
              <p className="text-gray-600 mb-4">{BUNDLE.description}</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {BUNDLE.includes.map(item => (
                  <span key={item} className="flex items-center gap-1 text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    <Check size={14} /> {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 line-through">
                ${ADDONS.reduce((sum, a) => sum + a.price, 0)}/mo
              </div>
              <div className="text-4xl font-bold text-purple-600">
                ${hasMortgageApp ? Math.round(BUNDLE.price * 0.8) : BUNDLE.price}
                <span className="text-lg font-normal text-gray-500">/mo</span>
              </div>
              {hasMortgageApp && (
                <div className="text-sm text-green-600">20% subscriber discount applied</div>
              )}
              <Link href={`/dashboard/checkout?addon=full-bundle&discount=${discountPercent}`}>
                <button className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Get Everything
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Add-Ons */}
      <h2 className="text-2xl font-bold mb-6">Individual Add-Ons</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ADDONS.map(addon => (
          <div 
            key={addon.id} 
            className={`bg-white rounded-xl border overflow-hidden ${addon.popular ? 'ring-2 ring-blue-500' : ''}`}
          >
            {addon.popular && (
              <div className="bg-blue-500 text-white text-center text-sm py-1 font-medium">
                Most Popular
              </div>
            )}
            <div className={`p-6 bg-gradient-to-r ${addon.color} text-white`}>
              <addon.icon size={32} className="mb-3" />
              <h3 className="text-xl font-bold">{addon.name}</h3>
              <p className="text-white/80 text-sm mt-1">{addon.description}</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                {hasMortgageApp && (
                  <span className="text-sm text-gray-500 line-through mr-2">${addon.price}</span>
                )}
                <span className="text-3xl font-bold">
                  ${hasMortgageApp ? Math.round(addon.price * 0.8) : addon.price}
                </span>
                <span className="text-gray-500">/mo</span>
              </div>
              
              <ul className="space-y-2 mb-6">
                {addon.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href={`/dashboard/checkout?addon=${addon.id}&discount=${discountPercent}`}>
                <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
                  Add to Plan <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Client Sharing */}
      <div className="bg-blue-50 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-blue-100 rounded-xl">
            <Users size={40} className="text-blue-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Share With Your Clients</h2>
            <p className="text-gray-600">
              Every add-on you purchase can be shared with your clients at no extra cost. 
              Give them access to education courses, calculators, and tools—all branded with your information.
            </p>
          </div>
          <Shield className="text-blue-600" size={48} />
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Can my clients access these tools?</h3>
            <p className="text-gray-600">Yes! You can share access to education courses, calculators, and resources with all your clients at no additional cost.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Do I get a discount if I have the Mortgage App?</h3>
            <p className="text-gray-600">Yes! Mortgage Rate Monitor Pro and Enterprise subscribers get 20% off all add-ons.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">Absolutely. All add-ons are month-to-month with no long-term commitment. Cancel anytime from your dashboard.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Are the calculators included?</h3>
            <p className="text-gray-600">Basic mortgage calculators are available through our Mortgage Rate Monitor integration at no extra cost. The calculators in the Mortgage App are more comprehensive.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a discount for annual billing?</h3>
            <p className="text-gray-600">Yes! Pay annually and save an additional 20% on top of any subscriber discounts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
