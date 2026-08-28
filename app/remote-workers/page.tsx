// app/remote-workers/page.tsx
// Remote Workers Housing Module

import Link from 'next/link'
import { Wifi, Home, Monitor, Coffee, CheckCircle, ArrowRight } from 'lucide-react'
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
  title: 'Remote Worker Housing | CR Realtor Platform',
  description: 'Homes optimized for remote work with dedicated office space and high-speed internet.'
}

export default async function RemoteWorkersPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center bg-blue-500/30 px-4 py-2 rounded-full mb-6">
            <Wifi className="w-5 h-5 mr-2" />
            <span>Work From Anywhere</span>
          </div>
          <h1 className="text-5xl font-bold mb-6">Remote Worker Housing</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Find homes designed for productivity. Dedicated office space, gigabit internet, and communities that understand work-life balance.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/properties?type=remote" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100">
              Browse Remote-Friendly Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes a Home Remote-Work Ready</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">High-Speed Internet</h3>
              <p className="text-gray-600">Gigabit fiber available. Perfect for video calls and large file transfers.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dedicated Office Space</h3>
              <p className="text-gray-600">Separate room or area designed for focused work and professional video backgrounds.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Coffee className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nearby Amenities</h3>
              <p className="text-gray-600">Coffee shops, co-working spaces, and restaurants within walking distance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Remote-Friendly Housing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Verified high-speed internet availability",
              "Homes with dedicated office or flex spaces",
              "Quiet neighborhoods for focused work",
              "Natural lighting for video calls",
              "Proximity to co-working spaces",
              "Tax-friendly locations for remote workers"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Home Office?</h2>
          <p className="text-xl text-blue-100 mb-8">Our remote-work specialists understand what digital professionals need.</p>
          <Link href="/auth/signup" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100">
            Connect with a Specialist
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Wifi className="w-6 h-6 text-blue-400" />
            <span className="text-white font-bold text-lg">Remote Workers Program</span>
          </div>
          <p className="text-sm mb-4">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/veterans" className="hover:text-white">Veterans</Link>
            <Link href="/seniors" className="hover:text-white">Seniors</Link>
            <Link href="/help" className="hover:text-white">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
