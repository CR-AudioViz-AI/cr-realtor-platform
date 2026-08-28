// app/eco-living/page.tsx
// Green & Eco Living Housing Module

import Link from 'next/link'
import { Leaf, Home, Sun, Droplet, Wind, CheckCircle, ArrowRight } from 'lucide-react'
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
  title: 'Eco-Friendly & Sustainable Housing | CR Realtor Platform',
  description: 'Green homes with solar panels, energy efficiency, sustainable features, and eco-conscious communities. Live lightly on the earth.'
}

export default async function EcoLivingPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-green-900 via-teal-800 to-green-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Leaf className="w-16 h-16" /></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Live Green, Live Well</h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8">
              Eco-friendly homes with solar power, energy efficiency, sustainable materials, and green communities. Reduce your footprint without sacrificing comfort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#features" className="px-8 py-4 bg-white text-green-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                Green Features <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">SOLAR</div>
                <div className="text-green-100 text-sm">Panel Ready Homes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">NET-0</div>
                <div className="text-green-100 text-sm">Energy Options</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">ECO</div>
                <div className="text-green-100 text-sm">Communities</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{properties?.length || 456}</div>
                <div className="text-green-100 text-sm">Green Homes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Sustainable Home Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Eco-friendly amenities that save money and the planet</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Sun className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Solar Power</h3>
              <p className="text-gray-600 mb-4">Existing solar panels or solar-ready roofs. Net metering. Battery storage options. Energy independence.</p>
              <div className="text-sm text-green-600 font-semibold">$0 Electric Bills</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Wind className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Energy Efficiency</h3>
              <p className="text-gray-600 mb-4">High-efficiency HVAC. LED lighting. Smart thermostats. Excellent insulation. Low utility costs.</p>
              <div className="text-sm text-teal-600 font-semibold">Save 30-50%</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Droplet className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Water Conservation</h3>
              <p className="text-gray-600 mb-4">Low-flow fixtures. Rainwater collection. Drought-tolerant landscaping. Greywater systems.</p>
              <div className="text-sm text-blue-600 font-semibold">Use 40% Less</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sustainable Materials</h3>
              <p className="text-gray-600 mb-4">Bamboo floors. Recycled content. Low-VOC paints. Reclaimed materials. Healthy indoor air.</p>
              <div className="text-sm text-yellow-600 font-semibold">Non-Toxic Living</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Green Communities</h3>
              <p className="text-gray-600 mb-4">Walkable neighborhoods. Bike paths. Community gardens. Composting programs. Like-minded neighbors.</p>
              <div className="text-sm text-purple-600 font-semibold">Eco-Conscious Living</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Green Certifications</h3>
              <p className="text-gray-600 mb-4">LEED certified. Energy Star. Green Build. Third-party verified sustainability.</p>
              <div className="text-sm text-orange-600 font-semibold">Verified Green</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Green Home Savings Calculator</h2>
              <p className="text-xl text-gray-600">See how much you'll save with sustainable features</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Monthly Electric</label>
                  <input type="number" placeholder="$180" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Monthly Water</label>
                  <input type="number" placeholder="$75" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
                </div>
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Calculate Green Savings
              </button>
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-green-200">
                <h3 className="font-bold mb-4">Estimated Annual Savings:</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Solar Panels:</span>
                    <span className="font-bold text-green-600">$1,800/year</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Energy Efficiency:</span>
                    <span className="font-bold text-teal-600">$540/year</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Water Conservation:</span>
                    <span className="font-bold text-blue-600">$360/year</span>
                  </div>
                  <div className="pt-3 border-t-2 flex justify-between items-center">
                    <span className="font-bold">Total Savings:</span>
                    <span className="font-bold text-2xl text-green-600">$2,700/year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Sustainable Living Starts at Home</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Reduce your carbon footprint and your utility bills. Green homes are good for the planet and your wallet.
          </p>
          <Link href="/auth/signup" className="px-8 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-block">
            Find Your Green Home
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Leaf className="w-6 h-6 text-green-400" />
              <span className="text-white font-bold text-lg">Eco-Living Program</span>
            </div>
          </div>
          <p className="text-sm">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
