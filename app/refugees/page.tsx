// app/refugees/page.tsx
// Refugees & Immigrants Housing Module

import Link from 'next/link'
import { Globe, Home, Users, Heart, Shield, CheckCircle, ArrowRight } from 'lucide-react'
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
  title: 'New American Housing Program | CR Realtor Platform',
  description: 'Housing assistance for refugees, immigrants, and new Americans. Multilingual support, cultural communities, and pathways to homeownership.'
}

export default async function RefugeesPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-teal-900 via-cyan-800 to-teal-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Globe className="w-16 h-16" /></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Welcome Home to America</h1>
            <p className="text-xl md:text-2xl text-teal-100 mb-8">
              Housing support for refugees and immigrants. Multilingual services, cultural communities, resettlement assistance, and pathways to ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#services" className="px-8 py-4 bg-white text-teal-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                Our Services <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">30+</div>
                <div className="text-teal-100 text-sm">Languages Spoken</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">FREE</div>
                <div className="text-teal-100 text-sm">Resettlement Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">SAFE</div>
                <div className="text-teal-100 text-sm">Verified Communities</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{properties?.length || 423}</div>
                <div className="text-teal-100 text-sm">Welcoming Homes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">New American Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Support for refugees and immigrants</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multilingual Support</h3>
              <p className="text-gray-600 mb-4">Staff speaks 30+ languages. Translation services. Documents in your language.</p>
              <div className="text-sm text-teal-600 font-semibold">We Speak Your Language</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cultural Communities</h3>
              <p className="text-gray-600 mb-4">Find neighborhoods with your culture. Ethnic groceries. Places of worship. Community centers.</p>
              <div className="text-sm text-cyan-600 font-semibold">Feel at Home</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resettlement Assistance</h3>
              <p className="text-gray-600 mb-4">Partners with resettlement agencies. Emergency housing. Furniture assistance. Move-in help.</p>
              <div className="text-sm text-blue-600 font-semibold">Complete Support</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Alternative Credit</h3>
              <p className="text-gray-600 mb-4">No US credit history needed. International credit accepted. Rent payment history counts.</p>
              <div className="text-sm text-green-600 font-semibold">Build Your Credit</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cultural Sensitivity</h3>
              <p className="text-gray-600 mb-4">Agents trained in cultural awareness. Respectful of traditions. Understanding of unique needs.</p>
              <div className="text-sm text-purple-600 font-semibold">Respectful Service</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Legal Assistance</h3>
              <p className="text-gray-600 mb-4">Connect with immigration attorneys. Housing rights education. Visa/green card guidance.</p>
              <div className="text-sm text-indigo-600 font-semibold">Know Your Rights</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Your American Dream Starts Here</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            From refugee to homeowner. We'll walk with you every step of your journey.
          </p>
          <Link href="/auth/signup" className="px-8 py-4 bg-white text-teal-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-block">
            Start Your Journey
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Globe className="w-6 h-6 text-teal-400" />
              <span className="text-white font-bold text-lg">New Americans Program</span>
            </div>
          </div>
          <p className="text-sm">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
