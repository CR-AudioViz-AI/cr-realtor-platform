// app/foster-families/page.tsx
// Foster & Adoptive Families Housing Module

import Link from 'next/link'
import { Heart, Home, Users, Shield, CheckCircle, Smile, ArrowRight } from 'lucide-react'
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
  title: 'Foster & Adoptive Family Housing | CR Realtor Platform',
  description: 'Housing for foster and adoptive families. Extra bedrooms, safe neighborhoods, licensing requirements met, and support for growing families.'
}

export default async function FosterFamiliesPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-pink-900 via-rose-800 to-pink-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Heart className="w-16 h-16" /></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Homes That Make Room for More Love</h1>
            <p className="text-xl md:text-2xl text-pink-100 mb-8">
              Housing for foster and adoptive families. Extra bedrooms, licensing-ready homes, safe neighborhoods, and support for families opening their hearts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#features" className="px-8 py-4 bg-white text-pink-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                See Features <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">4-5</div>
                <div className="text-pink-100 text-sm">Bedroom Options</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">SAFE</div>
                <div className="text-pink-100 text-sm">Verified Neighborhoods</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$15K</div>
                <div className="text-pink-100 text-sm">Family Grants Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{properties?.length || 345}</div>
                <div className="text-pink-100 text-sm">Family Homes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Foster Family Housing Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">What foster and adoptive families need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Extra Bedrooms</h3>
              <p className="text-gray-600 mb-4">4-5+ bedrooms for growing families. Space for siblings. Room to say yes to more kids.</p>
              <div className="text-sm text-pink-600 font-semibold">Room to Grow</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Licensing Requirements</h3>
              <p className="text-gray-600 mb-4">Homes that meet state foster care standards. Safety features. Proper square footage per child.</p>
              <div className="text-sm text-rose-600 font-semibold">Pre-Qualified</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Family Neighborhoods</h3>
              <p className="text-gray-600 mb-4">Safe streets. Good schools. Parks nearby. Other foster families in area.</p>
              <div className="text-sm text-purple-600 font-semibold">Kid-Friendly</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Smile className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Space</h3>
              <p className="text-gray-600 mb-4">Playrooms. Homework areas. Therapy-friendly spaces. Room for family activities.</p>
              <div className="text-sm text-blue-600 font-semibold">Functional Layout</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Financial Assistance</h3>
              <p className="text-gray-600 mb-4">Grants for foster/adoptive families. Down payment help. Special financing programs.</p>
              <div className="text-sm text-green-600 font-semibold">$15K+ Available</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Support Network</h3>
              <p className="text-gray-600 mb-4">Connect with other foster families. Resources. Respite care nearby. Community support.</p>
              <div className="text-sm text-indigo-600 font-semibold">You're Not Alone</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Every Child Deserves a Home</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            You're opening your heart. We'll help you find a home with room for all that love.
          </p>
          <Link href="/auth/signup" className="px-8 py-4 bg-white text-pink-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-block">
            Find Your Family Home
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Heart className="w-6 h-6 text-pink-400" />
              <span className="text-white font-bold text-lg">Foster & Adoptive Families Program</span>
            </div>
          </div>
          <p className="text-sm">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
