// app/tiny-homes/page.tsx
// Tiny Home Communities Module

import Link from 'next/link'
import { Home, Minimize, DollarSign, Users, Leaf, CheckCircle, ArrowRight } from 'lucide-react'
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
  title: 'Tiny Home Communities | CR Realtor Platform',
  description: 'Tiny homes and micro-living. Affordable minimalist housing, sustainable communities, and freedom from excess. Live simply, live well.'
}

export default async function TinyHomesPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Minimize className="w-16 h-16" /></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Live Big in a Tiny Home</h1>
            <p className="text-xl md:text-2xl text-amber-100 mb-8">
              Tiny homes, micro-living, and minimalist communities. Affordable housing under 600 sqft. Less space, more freedom, lower costs, simpler life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#communities" className="px-8 py-4 bg-white text-amber-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                Find Communities <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$50K</div>
                <div className="text-amber-100 text-sm">Starting Price</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">400</div>
                <div className="text-amber-100 text-sm">Square Feet Average</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$300</div>
                <div className="text-amber-100 text-sm">Monthly Expenses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{properties?.length || 178}</div>
                <div className="text-amber-100 text-sm">Tiny Homes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="communities" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Tiny Home Living Benefits</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Why people choose to live small</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Extremely Affordable</h3>
              <p className="text-gray-600 mb-4">$50K-$150K purchase price. $200-$500 monthly costs. Own a home without debt. Financial freedom.</p>
              <div className="text-sm text-amber-600 font-semibold">Debt-Free Living</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Minimize className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Minimalist Lifestyle</h3>
              <p className="text-gray-600 mb-4">Less stuff, less stress. Focus on experiences. Freedom from clutter. Intentional living.</p>
              <div className="text-sm text-yellow-600 font-semibold">Simple Living</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Eco-Friendly</h3>
              <p className="text-gray-600 mb-4">Smaller carbon footprint. Less energy use. Solar-powered options. Sustainable by design.</p>
              <div className="text-sm text-green-600 font-semibold">Green Living</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Design</h3>
              <p className="text-gray-600 mb-4">Every inch counts. Built-in storage. Multi-function spaces. Surprisingly livable.</p>
              <div className="text-sm text-blue-600 font-semibold">Clever Layout</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Living</h3>
              <p className="text-gray-600 mb-4">Tiny home villages. Shared amenities. Close neighbors. Built-in community.</p>
              <div className="text-sm text-purple-600 font-semibold">Social Connection</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Location Flexibility</h3>
              <p className="text-gray-600 mb-4">Some tiny homes are mobile. Change locations. Travel while living. Ultimate freedom.</p>
              <div className="text-sm text-red-600 font-semibold">Go Anywhere</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Tiny Home Cost Calculator</h2>
              <p className="text-xl text-gray-600">See how affordable tiny living can be</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 shadow-xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiny Home Purchase Price</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none">
                    <option>$50,000 - Basic</option>
                    <option>$75,000 - Standard</option>
                    <option>$100,000 - Upgraded</option>
                    <option>$150,000 - Luxury Tiny</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Land/Lot Rent</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none">
                    <option>$200/month - Rural</option>
                    <option>$400/month - Suburban</option>
                    <option>$600/month - Urban</option>
                    <option>Own Land - $0</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-amber-200">
                <h3 className="font-bold mb-4">Monthly Cost Breakdown:</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between"><span>Lot Rent:</span><span>$400</span></div>
                  <div className="flex justify-between"><span>Utilities:</span><span>$80</span></div>
                  <div className="flex justify-between"><span>Insurance:</span><span>$50</span></div>
                  <div className="flex justify-between"><span>Maintenance:</span><span>$70</span></div>
                  <div className="pt-2 border-t-2 flex justify-between font-bold text-lg">
                    <span>Total Monthly:</span><span className="text-amber-600">$600</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Compare to $1,800+ for traditional housing. Save $14,400/year!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Less House, More Life</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Tiny homes aren't about sacrifice. They're about freedom, simplicity, and living the life you actually want.
          </p>
          <Link href="/auth/signup" className="px-8 py-4 bg-white text-amber-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-block">
            Explore Tiny Living
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Minimize className="w-6 h-6 text-amber-400" />
              <span className="text-white font-bold text-lg">Tiny Home Communities</span>
            </div>
          </div>
          <p className="text-sm">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
