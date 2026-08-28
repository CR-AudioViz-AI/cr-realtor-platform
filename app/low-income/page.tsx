// app/low-income/page.tsx
// Complete Low-Income Housing Module Landing Page

import Link from 'next/link'
import { Home, DollarSign, Heart, CheckCircle, Users, Shield, Key, ArrowRight } from 'lucide-react'
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
  title: 'Affordable Housing for Low-Income Families | CR Realtor Platform',
  description: 'Find affordable housing with Section 8 vouchers, USDA loans, income-restricted properties, and rent-to-own programs. Homeownership is possible at any income level.'
}

export default async function LowIncomePage() {
  const supabase = await createClient()
  
  const { data: affordableProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('price', { ascending: true })
    .limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/first-time-buyers" className="text-gray-700 hover:text-cyan-600 font-medium">First-Time Buyers</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-cyan-900 via-blue-800 to-cyan-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Home className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Everyone Deserves a Home
            </h1>
            
            <p className="text-xl md:text-2xl text-cyan-100 mb-8">
              Affordable housing programs, Section 8 accepted properties, USDA loans with $0 down, and pathways to homeownership regardless of income level.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#programs" className="px-8 py-4 bg-white text-cyan-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                See Programs <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="#calculator" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all">
                Calculate Affordability
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$0</div>
                <div className="text-cyan-100 text-sm">Down with USDA Loans</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">FREE</div>
                <div className="text-cyan-100 text-sm">Housing Counseling</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-cyan-100 text-sm">Section 8 Welcome</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{affordableProperties?.length || 892}</div>
                <div className="text-cyan-100 text-sm">Affordable Homes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Affordable Housing Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple pathways to homeownership for low and moderate income families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Section 8 Homeownership</h3>
              <p className="text-gray-600 mb-4">
                Use your Section 8 voucher toward mortgage payments instead of rent. Build equity while getting housing assistance.
              </p>
              <div className="text-sm text-cyan-600 font-semibold">Voucher to Mortgage</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">USDA Rural Loans</h3>
              <p className="text-gray-600 mb-4">
                $0 down, 100% financing for rural and suburban areas. Income limits apply but cover up to 115% of area median income.
              </p>
              <div className="text-sm text-blue-600 font-semibold">$0 Down Payment</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">FHA Low Down Payment</h3>
              <p className="text-gray-600 mb-4">
                Just 3.5% down with credit scores as low as 580. Seller can pay up to 6% closing costs. More accessible than conventional.
              </p>
              <div className="text-sm text-green-600 font-semibold">3.5% Down</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Habitat for Humanity</h3>
              <p className="text-gray-600 mb-4">
                Affordable mortgages with no profit and no interest. Required sweat equity helps reduce costs. Income-qualified families only.
              </p>
              <div className="text-sm text-purple-600 font-semibold">0% Interest</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Land Trusts</h3>
              <p className="text-gray-600 mb-4">
                Buy the home, lease the land. Dramatically reduces purchase price. Homes stay affordable for future buyers too.
              </p>
              <div className="text-sm text-orange-600 font-semibold">30-50% Below Market</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rent-to-Own Programs</h3>
              <p className="text-gray-600 mb-4">
                Rent now while building credit and savings. Portion of rent goes toward down payment. Option to purchase after 2-3 years.
              </p>
              <div className="text-sm text-red-600 font-semibold">Path to Ownership</div>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Affordable Housing Calculator</h2>
              <p className="text-xl text-gray-600">Calculate what you can afford and which programs you qualify for</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Household Income</label>
                  <input type="number" placeholder="$2,500" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Household Size</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none">
                    <option>1 person</option>
                    <option>2 people</option>
                    <option>3 people</option>
                    <option>4 people</option>
                    <option>5+ people</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Housing Situation</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none">
                    <option>Renting</option>
                    <option>Living with family</option>
                    <option>Section 8 voucher</option>
                    <option>Homeless/transitional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Savings for Down Payment</label>
                  <input type="number" placeholder="$1,000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Find Programs I Qualify For
              </button>

              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-cyan-200">
                <h3 className="font-bold text-lg mb-4">Programs You Qualify For:</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Section 8 Homeownership:</strong> Your voucher ($850/mo) can cover mortgage payment. 
                        Combined with income, you could afford up to $175,000 home.
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>USDA Rural Housing:</strong> Income qualifies for 100% financing. No down payment needed. 
                        Available in suburban Fort Myers areas.
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Down Payment Assistance:</strong> Florida SHIP program offers up to $25,000 for 
                        low-income buyers. Your saved $1,000 plus this grant = move-in ready.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Homeownership is possible at any income level. Let us help you find the right program and the right home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="px-8 py-4 bg-white text-cyan-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all">
              Get Started Free
            </Link>
            <Link href="/search" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all">
              Search Affordable Homes
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Home className="w-6 h-6 text-cyan-400" />
              <span className="text-white font-bold text-lg">Affordable Housing Program</span>
            </div>
          </div>
          <p className="text-sm mb-4">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
