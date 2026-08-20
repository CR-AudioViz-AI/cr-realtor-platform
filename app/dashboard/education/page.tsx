import Link from 'next/link'
'use client'
// 2026-08-20: was a SERVER component gating itself with a cookie-based getUser().
// Sessions live in localStorage, so it returned null on every request - for a
// signed-in agent too - and redirect() in a page component renders a BLANK PAGE
// rather than a 307. This page never displayed anything.
//
// app/dashboard/layout.tsx already verifies access. Entitlements come from
// /api/me/entitlements, behind requireUser(). Markup unchanged.
import { useEffect, useState } from 'react'
import {
  GraduationCap, BookOpen, Video, FileText, Calculator, DollarSign,
  Home, Shield, Users, Award, ChevronRight, PlayCircle, Download,
  CheckCircle, Star, Clock, Target, TrendingUp, Key, Briefcase,
  Lock, Zap, ExternalLink
} from 'lucide-react';



const LEARNING_TRACKS = [
  {
    id: 'first-time-buyer',
    title: 'First-Time Homebuyer Academy',
    description: 'Everything your clients need to buy their first home with confidence',
    icon: Home,
    color: 'from-blue-500 to-indigo-600',
    modules: 12,
    duration: '4-6 hours',
    level: 'Beginner',
    topics: ['Credit Basics', 'Down Payment', 'Mortgage Types', 'Home Search', 'Offers', 'Closing'],
    href: '/dashboard/education/first-time-buyer'
  },
  {
    id: 'seller-guide',
    title: 'Home Seller Masterclass',
    description: 'Help sellers maximize value and navigate the process',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    modules: 8,
    duration: '3-4 hours',
    level: 'All Levels',
    topics: ['Pricing Strategy', 'Staging', 'Marketing', 'Negotiations', 'Closing Costs'],
    href: '/dashboard/education/seller-guide'
  },
  {
    id: 'investor',
    title: 'Real Estate Investing 101',
    description: 'For clients building wealth through property investments',
    icon: TrendingUp,
    color: 'from-purple-500 to-violet-600',
    modules: 10,
    duration: '5-7 hours',
    level: 'Intermediate',
    topics: ['Analysis', 'Rentals', 'Fix & Flip', '1031 Exchanges', 'Tax Strategy'],
    href: '/dashboard/education/investing'
  },
  {
    id: 'realtor-pro',
    title: 'Realtor Success Program',
    description: 'Advanced strategies for your own business growth',
    icon: Award,
    color: 'from-amber-500 to-orange-600',
    modules: 15,
    duration: '8-10 hours',
    level: 'Professional',
    topics: ['Lead Gen', 'Client Management', 'Listing Presentations', 'Negotiation', 'Marketing'],
    href: '/dashboard/education/realtor-pro'
  },
]

const QUICK_GUIDES = [
  { title: 'Understanding Credit Scores', icon: Target, time: '10 min' },
  { title: 'Down Payment Options', icon: DollarSign, time: '15 min' },
  { title: 'FHA vs Conventional Loans', icon: FileText, time: '12 min' },
  { title: 'Home Inspection Checklist', icon: CheckCircle, time: '10 min' },
]

export default function EducationCenterPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setHasAccess(false); return }
        const res = await fetch('/api/me/entitlements', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setHasAccess(false); return }
        const d = await res.json()
        if (!live) return
        setHasAccess(Boolean(d.entitlements?.education))
        setDiscountPercent(d.discountPercent ?? 0)
      } catch {
        if (live) setHasAccess(false)   // fail closed
      }
    })()
    return () => { live = false }
  }, [])

  const hasRealtorAccount = discountPercent > 0
  const basePrice = 49
  const finalPrice = Math.round(basePrice * (1 - discountPercent / 100))

  // null means "not answered yet", distinct from false: showing the paywall while
  // the answer is in flight would flash "buy this" at someone who owns it.
  if (hasAccess === null) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse text-gray-500">Checking your access…</div>
      </div>
    )
  }

  // If no access, show paywall
  if (!hasAccess) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
            <GraduationCap size={20} />
            <span className="font-medium">Premium Add-On</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Education Center</h1>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Comprehensive real estate education for you AND your clients. 
            Share courses, guides, and resources to help everyone succeed.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <BookOpen size={18} />
              <span>45+ Courses</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Video size={18} />
              <span>100+ Videos</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Users size={18} />
              <span>Share with Clients</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 max-w-md mx-auto mb-6">
            {hasRealtorAccount && (
              <div className="text-sm text-green-300 mb-2">
                ✓ Realtor account discount applied!
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              {discountPercent > 0 && (
                <span className="text-2xl text-white/50 line-through">${basePrice}</span>
              )}
              <span className="text-5xl font-bold">${finalPrice}</span>
              <span className="text-xl text-white/70">/month</span>
            </div>
          </div>

          <Link href={`/dashboard/checkout?addon=education&discount=${discountPercent}`}>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors">
              Unlock Education Center
            </button>
          </Link>
        </div>

        {/* Preview of what they'll get */}
        <h2 className="text-2xl font-bold mb-6">What's Included</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {LEARNING_TRACKS.map(track => (
            <div key={track.id} className="bg-white rounded-xl border p-5 opacity-75">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 bg-gradient-to-r ${track.color} rounded-lg text-white`}>
                  <track.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">{track.title}</h3>
                  <p className="text-sm text-gray-500">{track.modules} modules • {track.duration}</p>
                </div>
                <Lock className="ml-auto text-gray-400" size={18} />
              </div>
              <p className="text-sm text-gray-600">{track.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-800 mb-2">💡 Why Realtors Love This</h3>
          <ul className="space-y-2 text-amber-900">
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-amber-600 mt-0.5" />
              <span>Share with unlimited clients at no extra cost</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-amber-600 mt-0.5" />
              <span>Educated clients make faster, more confident decisions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-amber-600 mt-0.5" />
              <span>Professional courses you don't have to create yourself</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-amber-600 mt-0.5" />
              <span>Certificate programs may qualify clients for down payment assistance</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  // Full access view
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap size={40} />
          <h1 className="text-3xl font-bold">Education Center</h1>
          <span className="ml-auto bg-green-500 text-white text-sm px-3 py-1 rounded-full">
            ✓ Active
          </span>
        </div>
        <p className="text-xl text-blue-100 mb-6 max-w-2xl">
          Share these courses with your clients to help them succeed. 
          Educated clients make better decisions and smoother transactions.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <BookOpen size={18} />
            <span>45+ Courses</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Video size={18} />
            <span>100+ Videos</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <FileText size={18} />
            <span>Checklists</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Users size={18} />
            <span>Share with Clients</span>
          </div>
        </div>
      </div>

      {/* Mortgage App Link */}
      <div className="bg-gray-100 rounded-xl p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="text-blue-600" size={24} />
          <div>
            <p className="font-medium">Need Calculators?</p>
            <p className="text-sm text-gray-600">Mortgage calculators are in the Mortgage Rate Monitor app</p>
          </div>
        </div>
        <a 
          href="https://mortgage.craudiovizai.com/calculators" 
          target="_blank"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Open Calculators <ExternalLink size={16} />
        </a>
      </div>

      {/* Learning Tracks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Learning Tracks</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {LEARNING_TRACKS.map(track => (
            <Link key={track.id} href={track.href}>
              <div className="bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                <div className={`bg-gradient-to-r ${track.color} p-6 text-white`}>
                  <track.icon size={32} className="mb-3" />
                  <h3 className="text-xl font-bold mb-2">{track.title}</h3>
                  <p className="text-white/80 text-sm">{track.description}</p>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <BookOpen size={16} /> {track.modules} Modules
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Clock size={16} /> {track.duration}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{track.level}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {track.topics.slice(0, 4).map(topic => (
                      <span key={topic} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {topic}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-blue-600 font-medium group-hover:gap-3 transition-all">
                    Start Learning <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Guides */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Quick Guides</h2>
          <Link href="/dashboard/education/guides" className="text-blue-600 hover:underline flex items-center gap-1">
            View All <ChevronRight size={18} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_GUIDES.map(guide => (
            <div key={guide.title} className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <guide.icon size={20} className="text-blue-600" />
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {guide.time}
                </span>
              </div>
              <h3 className="font-medium text-gray-900">{guide.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Resources & Glossary Links */}
      <section className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/education/resources">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <Download className="text-green-600 mb-3" size={32} />
            <h3 className="text-xl font-bold mb-2">Checklists & Templates</h3>
            <p className="text-gray-600">10+ downloadable resources for every stage of the transaction</p>
          </div>
        </Link>
        <Link href="/dashboard/education/glossary">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <BookOpen className="text-purple-600 mb-3" size={32} />
            <h3 className="text-xl font-bold mb-2">Real Estate Glossary</h3>
            <p className="text-gray-600">100+ terms explained in plain English for your clients</p>
          </div>
        </Link>
      </section>
    </div>
  )
}
