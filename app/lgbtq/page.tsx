// app/lgbtq/page.tsx
// LGBTQ+ Friendly Housing Module

import Link from 'next/link'
import { Heart, Home, Users, Shield, CheckCircle, MapPin, ArrowRight } from 'lucide-react'
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
  title: 'LGBTQ+ Friendly Housing | CR Realtor Platform',
  description: 'Safe, welcoming communities for LGBTQ+ individuals and families. Anti-discrimination protections, inclusive neighborhoods, and rainbow-friendly realtors.'
}

export default async function LGBTQPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Heart className="w-16 h-16" /></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Find Your Safe Space</h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              LGBTQ+ friendly neighborhoods, anti-discrimination protections, inclusive communities, and realtors who understand your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#neighborhoods" className="px-8 py-4 bg-white text-purple-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                Find Communities <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-purple-100 text-sm">Inclusive Realtors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">SAFE</div>
                <div className="text-purple-100 text-sm">Verified Communities</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">LEGAL</div>
                <div className="text-purple-100 text-sm">Discrimination Protection</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{properties?.length || 756}</div>
                <div className="text-purple-100 text-sm">Rainbow Homes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="neighborhoods" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">LGBTQ+ Friendly Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">What we look for in inclusive communities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Legal Protections</h3>
              <p className="text-gray-600 mb-4">Fair housing laws enforced. Anti-discrimination ordinances. Legal recourse if needed.</p>
              <div className="text-sm text-purple-600 font-semibold">Protected Rights</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Presence</h3>
              <p className="text-gray-600 mb-4">Active LGBTQ+ population. Pride events. LGBTQ+ owned businesses nearby.</p>
              <div className="text-sm text-pink-600 font-semibold">You're Not Alone</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inclusive Amenities</h3>
              <p className="text-gray-600 mb-4">LGBTQ+ healthcare providers. Gender-neutral facilities. Supportive schools.</p>
              <div className="text-sm text-blue-600 font-semibold">Full Support</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Welcoming Neighbors</h3>
              <p className="text-gray-600 mb-4">Acceptance scores. Low hate crime rates. Rainbow flags visible.</p>
              <div className="text-sm text-green-600 font-semibold">Be Yourself</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rainbow Realtors</h3>
              <p className="text-gray-600 mb-4">LGBTQ+ agents or strong allies. No judgment. Complete understanding.</p>
              <div className="text-sm text-indigo-600 font-semibold">Represented</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Family Recognition</h3>
              <p className="text-gray-600 mb-4">All families respected. Marriage equality honored. Adoption-friendly.</p>
              <div className="text-sm text-red-600 font-semibold">All Love Valid</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Love Lives Here</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Find a home where you can be yourself, love who you love, and live authentically.
          </p>
          <Link href="/auth/signup" className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-block">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Heart className="w-6 h-6 text-purple-400" />
              <span className="text-white font-bold text-lg">LGBTQ+ Friendly Program</span>
            </div>
          </div>
          <p className="text-sm">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
