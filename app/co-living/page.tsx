// app/co-living/page.tsx
// Co-Housing & Co-Living Module - FINAL MODULE #20

import Link from 'next/link'
import { Users, Home, Heart, Coffee, Utensils, CheckCircle, ArrowRight } from 'lucide-react'
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
  title: 'Co-Housing & Co-Living Communities | CR Realtor Platform',
  description: 'Intentional communities, co-housing, and shared living. Private space plus community. Combat isolation, share resources, build connections.'
}

export default async function CoLivingPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('*').eq('status', 'active').limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-fuchsia-900 via-purple-800 to-fuchsia-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Users className="w-16 h-16" /></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Live Together, Thrive Together</h1>
            <p className="text-xl md:text-2xl text-fuchsia-100 mb-8">
              Co-housing and co-living communities. Private space plus shared amenities. Combat loneliness, share resources, build real community. Modern living, ancient wisdom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#models" className="px-8 py-4 bg-white text-fuchsia-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                See Models <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">30%</div>
                <div className="text-fuchsia-100 text-sm">Lower Living Costs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">SHARED</div>
                <div className="text-fuchsia-100 text-sm">Common Spaces</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">PRIVATE</div>
                <div className="text-fuchsia-100 text-sm">Personal Units</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{properties?.length || 234}</div>
                <div className="text-fuchsia-100 text-sm">Co-Living Spaces</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="models" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Co-Living Models</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Different ways to live in community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-fuchsia-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-fuchsia-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Traditional Co-Housing</h3>
              <p className="text-gray-600 mb-4">Private homes clustered around shared common house. Communal dining 2-3x/week. Shared gardens, workshops.</p>
              <div className="text-sm text-fuchsia-600 font-semibold">Own + Share</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Modern Co-Living</h3>
              <p className="text-gray-600 mb-4">Private bedrooms/studios in shared building. Common kitchen, living room. Like dorms for adults.</p>
              <div className="text-sm text-purple-600 font-semibold">All-Inclusive</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Intentional Communities</h3>
              <p className="text-gray-600 mb-4">Shared values and purpose. Cooperative decision-making. Sustainable living. Deep connection.</p>
              <div className="text-sm text-pink-600 font-semibold">Value-Based</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Coffee className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Senior Co-Housing</h3>
              <p className="text-gray-600 mb-4">Aging in community. Mutual support. Shared meals and activities. Safety in numbers.</p>
              <div className="text-sm text-blue-600 font-semibold">Age Together</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Utensils className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Shared Housing</h3>
              <p className="text-gray-600 mb-4">Multiple unrelated people in one house. Private bedrooms, shared common areas. Roommates 2.0.</p>
              <div className="text-sm text-green-600 font-semibold">Affordable</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pocket Neighborhoods</h3>
              <p className="text-gray-600 mb-4">Small clusters of homes around shared courtyard. Front porches face common space. Built-in community.</p>
              <div className="text-sm text-orange-600 font-semibold">New Urbanism</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Benefits of Co-Living</h2>
              <p className="text-xl text-gray-600">Why people choose community living</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-xl p-6">
                <h3 className="font-bold mb-3 text-lg">Social Benefits</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Combat loneliness and isolation</li>
                  <li>• Built-in friendships and support</li>
                  <li>• Share life's ups and downs</li>
                  <li>• Intergenerational connections</li>
                  <li>• Sense of belonging</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="font-bold mb-3 text-lg">Financial Benefits</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Share costs of amenities</li>
                  <li>• Lower utility bills</li>
                  <li>• Shared tools and equipment</li>
                  <li>• Group buying power</li>
                  <li>• Affordable homeownership</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl p-6">
                <h3 className="font-bold mb-3 text-lg">Practical Benefits</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Shared childcare and eldercare</li>
                  <li>• Help with home maintenance</li>
                  <li>• Share skills and knowledge</li>
                  <li>• Safety and security</li>
                  <li>• Sustainable resource use</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
                <h3 className="font-bold mb-3 text-lg">Environmental Benefits</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Smaller individual footprint</li>
                  <li>• Shared solar and energy systems</li>
                  <li>• Community gardens</li>
                  <li>• Less car dependence</li>
                  <li>• Reduced consumption</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-center">Is Co-Living Right for You?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">You value community and don't want to live alone</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">You're comfortable sharing some spaces and decisions</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">You want to reduce living costs without sacrificing quality</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">You believe in sustainability and shared resources</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">You're open to new ways of living and relating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Community Is the New Luxury</h2>
          <p className="text-xl text-fuchsia-100 mb-8 max-w-2xl mx-auto">
            In a world of isolation, connection is revolutionary. Find your people. Build your village. Live in community.
          </p>
          <Link href="/auth/signup" className="px-8 py-4 bg-white text-fuchsia-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-block">
            Find Your Community
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Users className="w-6 h-6 text-fuchsia-400" />
              <span className="text-white font-bold text-lg">Co-Housing & Co-Living Program</span>
            </div>
          </div>
          <p className="text-sm mb-2">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
          <p className="text-xs text-gray-500">Module 20 of 20 - Social Impact Housing Complete</p>
        </div>
      </footer>
    </div>
  )
}
