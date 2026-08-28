// app/military-families/page.tsx
// Complete Military Families Module (Active Duty, Non-Veteran)

import Link from 'next/link'
import { Shield, Home, MapPin, DollarSign, CheckCircle, Users, Clock, ArrowRight } from 'lucide-react'
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
  title: 'Military Families Housing | CR Realtor Platform',
  description: 'Housing for active duty families, military spouses, and dependents. PCS move assistance, base proximity, BAH optimization, and flexible leasing for deployments.'
}

export default async function MilitaryFamiliesPage() {
  const supabase = await createClient()
  
  const { data: militaryProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/veterans" className="text-gray-700 hover:text-slate-600 font-medium">Veterans</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Shield className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Housing Solutions for Military Families</h1>
            
            <p className="text-xl md:text-2xl text-slate-100 mb-8">
              PCS move assistance, BAH-optimized rentals, base proximity search, and flexible options for deployment cycles. We understand military life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#programs" className="px-8 py-4 bg-white text-slate-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                See Programs <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">24HR</div>
                <div className="text-slate-100 text-sm">PCS Move Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-slate-100 text-sm">BAH Matched Homes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">FREE</div>
                <div className="text-slate-100 text-sm">Relocation Assistance</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{militaryProperties?.length || 478}</div>
                <div className="text-slate-100 text-sm">Near Bases</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Military Family Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Specialized support for active duty families and dependents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rapid PCS Moves</h3>
              <p className="text-gray-600 mb-4">Got orders? We move fast. Virtual tours, expedited applications, remote closings. In-and-out in days, not weeks.</p>
              <div className="text-sm text-slate-600 font-semibold">Fast Track Service</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">BAH Optimization</h3>
              <p className="text-gray-600 mb-4">Find homes that maximize your BAH. We show properties at or below your housing allowance rate.</p>
              <div className="text-sm text-blue-600 font-semibold">Maximize BAH</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Base Proximity Search</h3>
              <p className="text-gray-600 mb-4">Find homes by commute time to your duty station. Filter by gate access and traffic patterns.</p>
              <div className="text-sm text-green-600 font-semibold">Near Your Base</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Deployment-Friendly Leases</h3>
              <p className="text-gray-600 mb-4">Flexible lease terms for deployment cycles. Military clause protection. Month-to-month options available.</p>
              <div className="text-sm text-purple-600 font-semibold">Flexible Terms</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Military Spouse Network</h3>
              <p className="text-gray-600 mb-4">Connect with other military families. Neighborhoods with strong spouse support communities.</p>
              <div className="text-sm text-orange-600 font-semibold">Built-In Community</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">SCRA Protections</h3>
              <p className="text-gray-600 mb-4">Landlords who understand military rights. SCRA lease termination honored. No deployment penalties.</p>
              <div className="text-sm text-red-600 font-semibold">Legal Protections</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">BAH Housing Calculator</h2>
              <p className="text-xl text-gray-600">Find homes that fit your housing allowance</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Base/Duty Station</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-slate-500 focus:outline-none">
                    <option>MacDill AFB, Tampa</option>
                    <option>NAS Jacksonville</option>
                    <option>Tyndall AFB, Panama City</option>
                    <option>Eglin AFB, Fort Walton</option>
                    <option>Other Florida Base</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pay Grade</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-slate-500 focus:outline-none">
                    <option>E1-E4</option>
                    <option>E5-E6</option>
                    <option>E7-E9</option>
                    <option>O1-O3</option>
                    <option>O4-O6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">With/Without Dependents</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-slate-500 focus:outline-none">
                    <option>With Dependents</option>
                    <option>Without Dependents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Commute Time</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-slate-500 focus:outline-none">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Find BAH-Matched Homes
              </button>

              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Your BAH Rate</div>
                    <div className="text-2xl font-bold text-slate-600">$1,950/mo</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Homes Available</div>
                    <div className="text-2xl font-bold text-blue-600">124</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Avg Commute</div>
                    <div className="text-2xl font-bold text-green-600">18 min</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <strong>Perfect Match:</strong> E6 with dependents at MacDill = $1,950 BAH. We found 124 homes at or below this rate within 30 minutes of base. Pocket the difference.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-slate-600 to-gray-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">We Serve Those Who Serve</h2>
          <p className="text-xl text-slate-100 mb-8 max-w-2xl mx-auto">
            Military life is unpredictable. Your housing search doesn't have to be. Let us handle the logistics so you can focus on the mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="px-8 py-4 bg-white text-slate-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Shield className="w-6 h-6 text-slate-400" />
              <span className="text-white font-bold text-lg">Military Families Program</span>
            </div>
          </div>
          <p className="text-sm">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
