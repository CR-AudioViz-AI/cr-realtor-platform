// app/artists/page.tsx
// Artists & Creatives Housing Module

import Link from 'next/link'
import { Palette, Home, Users, Lightbulb, DollarSign, CheckCircle, ArrowRight } from 'lucide-react'
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
  title: 'Artist Housing & Creative Spaces | CR Realtor Platform',
  description: 'Affordable housing for artists, musicians, writers, and creatives. Studio spaces, creative communities, and homes that inspire.'
}

export default async function ArtistsPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-orange-900 via-red-800 to-orange-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Palette className="w-16 h-16" /></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Spaces That Inspire Creation</h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8">
              Affordable housing for artists, musicians, writers, and makers. Studio spaces, creative communities, and neighborhoods where art thrives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#features" className="px-8 py-4 bg-white text-orange-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                Find Studios <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">30%</div>
                <div className="text-orange-100 text-sm">Below Market Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">STUDIO</div>
                <div className="text-orange-100 text-sm">Space Included</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">LIVE</div>
                <div className="text-orange-100 text-sm">Work Zoning</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{properties?.length || 289}</div>
                <div className="text-orange-100 text-sm">Creative Spaces</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Artist Housing Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">What artists need in a home</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Studio Space</h3>
              <p className="text-gray-600 mb-4">Extra rooms, basements, garages perfect for studios. Natural light. High ceilings.</p>
              <div className="text-sm text-orange-600 font-semibold">Create at Home</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Affordable Artist Housing</h3>
              <p className="text-gray-600 mb-4">Below-market rentals. Artist live-work lofts. Income-restricted creative spaces.</p>
              <div className="text-sm text-red-600 font-semibold">Budget Friendly</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Creative Communities</h3>
              <p className="text-gray-600 mb-4">Arts districts. Gallery walks. Maker spaces nearby. Other artists as neighbors.</p>
              <div className="text-sm text-yellow-600 font-semibold">Find Your Tribe</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live-Work Zoning</h3>
              <p className="text-gray-600 mb-4">Homes zoned for business. Sell from home. Host workshops. Run a studio legally.</p>
              <div className="text-sm text-green-600 font-semibold">Business Ready</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Income</h3>
              <p className="text-gray-600 mb-4">Gig income accepted. Commission-based work. Portfolio as proof of income.</p>
              <div className="text-sm text-blue-600 font-semibold">Artist-Friendly</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inspiration Included</h3>
              <p className="text-gray-600 mb-4">Near nature, culture, urban energy. Whatever fuels your creativity.</p>
              <div className="text-sm text-purple-600 font-semibold">Muse Approved</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Your Art Deserves a Home</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Find affordable housing with space to create. Because every artist needs a studio, not just a bedroom.
          </p>
          <Link href="/auth/signup" className="px-8 py-4 bg-white text-orange-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-block">
            Find Your Studio
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Palette className="w-6 h-6 text-orange-400" />
              <span className="text-white font-bold text-lg">Artists & Creatives Program</span>
            </div>
          </div>
          <p className="text-sm">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
