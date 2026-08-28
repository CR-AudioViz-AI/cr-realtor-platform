// app/survivors/page.tsx
// Domestic Violence Survivors Housing Module

import Link from 'next/link'
import { Shield, Home, Lock, Heart, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export const metadata = {
  title: 'Safe Housing for Survivors | CR Realtor Platform',
  description: 'Confidential housing assistance for domestic violence survivors. Safety planning, secure locations, rapid rehousing, and support services.'
}

export default async function SurvivorsPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-violet-900 via-purple-800 to-violet-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Shield className="w-16 h-16" /></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">You Deserve Safety</h1>
            <p className="text-xl md:text-2xl text-violet-100 mb-8">
              Confidential housing for survivors. Secure locations, safety planning, rapid rehousing assistance, and connection to support services. Your location stays private.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#safety" className="px-8 py-4 bg-white text-violet-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                Safety Features <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-violet-100 text-sm">Crisis Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-violet-100 text-sm">Confidential</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">SAFE</div>
                <div className="text-violet-100 text-sm">Secure Locations</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">FREE</div>
                <div className="text-violet-100 text-sm">Safety Planning</div>
              </div>
            </div>
            <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-violet-100">
                <strong>Need immediate help?</strong> National Domestic Violence Hotline: 1-800-799-7233 (24/7, confidential)
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="safety" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Safety-First Housing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Features designed for survivor safety</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Complete Confidentiality</h3>
              <p className="text-gray-600 mb-4">Your information never shared. Address confidential. No public records. Complete privacy.</p>
              <div className="text-sm text-violet-600 font-semibold">Protected Identity</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Locations</h3>
              <p className="text-gray-600 mb-4">Safe neighborhoods. Security features. Far from known danger areas. Peace of mind.</p>
              <div className="text-sm text-purple-600 font-semibold">Safety First</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rapid Rehousing</h3>
              <p className="text-gray-600 mb-4">Emergency housing within 24-48 hours. Short-term rentals. Bridge to permanent housing.</p>
              <div className="text-sm text-blue-600 font-semibold">Quick Placement</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Support Services</h3>
              <p className="text-gray-600 mb-4">Connection to counseling. Legal aid. Childcare help. Job training. Complete wraparound.</p>
              <div className="text-sm text-green-600 font-semibold">Full Support</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trauma-Informed Care</h3>
              <p className="text-gray-600 mb-4">Staff trained in trauma response. No judgment. Respect for your journey. Understanding support.</p>
              <div className="text-sm text-orange-600 font-semibold">Compassionate Help</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Financial Assistance</h3>
              <p className="text-gray-600 mb-4">Rent assistance. Security deposits covered. Furniture help. Move-in support. Fresh start funding.</p>
              <div className="text-sm text-red-600 font-semibold">Resources Available</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-violet-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Safety Planning</h3>
            <div className="space-y-4 text-gray-700">
              <p>When searching for housing, your safety is our priority. We work with:</p>
              <ul className="space-y-2 ml-6">
                <li>• Domestic violence shelters and transitional housing programs</li>
                <li>• Legal aid organizations for protective orders</li>
                <li>• Victim advocates who can attend showings</li>
                <li>• Law enforcement for safety planning</li>
                <li>• Counseling services for trauma support</li>
              </ul>
              <p className="font-semibold mt-6">Your housing search is completely confidential. We never share your information without explicit permission.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">You Are Not Alone</h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Leaving is the hardest part. Finding safe housing is next. We're here to help every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="px-8 py-4 bg-white text-violet-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all">
              Get Help Now
            </Link>
            <a href="tel:1-800-799-7233" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all">
              Call Hotline: 1-800-799-7233
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Shield className="w-6 h-6 text-violet-400" />
              <span className="text-white font-bold text-lg">Survivor Safety Program</span>
            </div>
          </div>
          <p className="text-sm mb-4">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
          <p className="text-xs text-gray-500">All survivor information is kept strictly confidential</p>
        </div>
      </footer>
    </div>
  )
}
