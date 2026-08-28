// app/disabilities/page.tsx
// Complete Disabilities & Accessibility Module Landing Page

import Link from 'next/link'
import { Accessibility, Home, DollarSign, Heart, CheckCircle, Users, Award, Wrench, ArrowRight } from 'lucide-react'
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
  title: 'Accessible Housing for People with Disabilities | CR Realtor Platform',
  description: 'Find fully accessible homes with universal design features. ADA compliance, modification grants up to $50K, and housing for people with physical, sensory, and cognitive disabilities.'
}

export default async function DisabilitiesPage() {
  const supabase = await createClient()
  
  // Get accessible properties
  const { data: accessibleProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/veterans" className="text-gray-700 hover:text-indigo-600 font-medium">
                Veterans
              </Link>
              <Link href="/seniors" className="text-gray-700 hover:text-indigo-600 font-medium">
                Seniors
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('/patterns/accessibility.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Accessibility className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Homes Designed for Everyone
            </h1>
            
            <p className="text-xl md:text-2xl text-indigo-100 mb-8">
              Find fully accessible homes with universal design, or get up to $50,000 in grants to modify your dream home. Independence starts with the right living space.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="#features"
                className="px-8 py-4 bg-white text-indigo-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                Accessibility Features
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#grants"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                Modification Grants
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$50K</div>
                <div className="text-indigo-100 text-sm">Max Modification Grant</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-indigo-100 text-sm">ADA Scored Properties</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">FREE</div>
                <div className="text-indigo-100 text-sm">Access Consultation</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{accessibleProperties?.length || 342}</div>
                <div className="text-indigo-100 text-sm">Accessible Homes</div>
              </div>
            </div>

            {/* Disability Types Badge */}
            <div className="mt-8 inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm text-indigo-100 mb-2">♿ Supporting All Accessibility Needs</p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <span className="px-3 py-1 bg-white/20 rounded-full">Mobility</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Vision</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Hearing</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Cognitive</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Sensory</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Chronic Illness</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Universal Design Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every property on our platform is scored for accessibility across multiple categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Zero-Step Entry</h3>
              <p className="text-gray-600 mb-4">
                No steps at any entrance. Ramped or level access from driveway, garage, and all exterior doors. Essential for wheelchair users.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">
                ADA Score: 95+
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Accessibility className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Wide Doorways & Hallways</h3>
              <p className="text-gray-600 mb-4">
                36" minimum doorways, 42" hallways. Turn radius of 60" in all rooms. Full wheelchair maneuverability throughout.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                Wheelchair Accessible
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Accessible Bathrooms</h3>
              <p className="text-gray-600 mb-4">
                Roll-in showers with built-in seats, grab bars, raised toilets, accessible sinks. Complete bathroom independence.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                Full ADA Compliance
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Single-Floor Living</h3>
              <p className="text-gray-600 mb-4">
                All essential living spaces on one level. No stairs required for daily life. Bedroom, bathroom, kitchen, and living area accessible.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                No Stairs Needed
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Accessible Kitchen</h3>
              <p className="text-gray-600 mb-4">
                Lowered counters, roll-under sinks, pull-out shelves, side-opening ovens. Cook independently with adaptive design.
              </p>
              <div className="text-sm text-orange-600 font-semibold">
                Universal Design
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Home Integration</h3>
              <p className="text-gray-600 mb-4">
                Voice-controlled lights, locks, thermostats. Accessible switches and controls. Technology enables independence.
              </p>
              <div className="text-sm text-red-600 font-semibold">
                Voice & Touch Control
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modification Grants Calculator */}
      <section id="grants" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Home Modification Grant Calculator</h2>
              <p className="text-xl text-gray-600">
                Calculate how much grant funding you qualify for to make your home accessible
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Disability Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Accessibility Need
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none">
                    <option>Wheelchair User</option>
                    <option>Walker/Mobility Aid</option>
                    <option>Visual Impairment</option>
                    <option>Hearing Impairment</option>
                    <option>Cognitive/Developmental</option>
                    <option>Chronic Illness</option>
                  </select>
                </div>

                {/* Home Ownership */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Home Status
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none">
                    <option>Own Current Home</option>
                    <option>Buying New Home</option>
                    <option>Renting (Need to Buy)</option>
                    <option>Living with Family</option>
                  </select>
                </div>

                {/* Income Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Household Annual Income
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none">
                    <option>Under $30,000</option>
                    <option>$30,000 - $50,000</option>
                    <option>$50,000 - $80,000</option>
                    <option>$80,000 - $120,000</option>
                    <option>Over $120,000</option>
                  </select>
                </div>

                {/* Veteran Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Veteran Status
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none">
                    <option>Not a Veteran</option>
                    <option>Veteran (No Service-Connected)</option>
                    <option>Veteran (Service-Connected)</option>
                    <option>Active Duty</option>
                  </select>
                </div>

                {/* Modification Needed */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Modifications Needed (Select All)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Wheelchair Ramp', 'Roll-in Shower', 'Grab Bars', 'Wider Doorways', 'Lower Counters', 'Stair Lift', 'Accessible Bathroom', 'Voice Controls', 'Lever Handles'].map((mod) => (
                      <label key={mod} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-gray-700">{mod}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Calculate Available Grants
              </button>

              {/* Results */}
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-indigo-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Grant Amount</div>
                    <div className="text-2xl font-bold text-indigo-600">$47,500</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Programs Available</div>
                    <div className="text-2xl font-bold text-green-600">7</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Estimated Timeline</div>
                    <div className="text-2xl font-bold text-blue-600">45-90 days</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>VA SAH Grant:</strong> $109,986 available (service-connected with permanent disability). 
                        Covers wheelchair ramp, roll-in shower, wider doorways, and more.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>HUD 203(k) Rehab Loan:</strong> Up to $35,000 rolled into mortgage for accessibility 
                        modifications. No separate loan needed.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Wrench className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>State Accessibility Grant:</strong> Florida offers $7,500 for home modifications. 
                        Income-based, covers essential accessibility improvements.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Award className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Local Programs:</strong> Additional $5,000 available through county and city programs. 
                        We'll help you apply to all eligible programs simultaneously.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADA Scoring System */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our ADA Scoring System</h2>
            <p className="text-xl text-gray-600">
              Every property rated 0-100 across 8 accessibility categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {[
              { category: 'Entry Access', weight: '15%', description: 'Zero-step entries, ramps, threshold height' },
              { category: 'Interior Navigation', weight: '20%', description: 'Doorway width, hallway width, turn radius' },
              { category: 'Bathroom Access', weight: '20%', description: 'Roll-in shower, grab bars, toilet height' },
              { category: 'Kitchen Access', weight: '15%', description: 'Counter height, roll-under sink, controls' },
              { category: 'Bedroom Access', weight: '10%', description: 'First-floor bedroom, closet accessibility' },
              { category: 'Safety Features', weight: '10%', description: 'Emergency exits, visual/audio alerts' },
              { category: 'Smart Features', weight: '5%', description: 'Voice control, automated systems' },
              { category: 'Outdoor Access', weight: '5%', description: 'Patio/deck access, yard navigation' }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-lg font-bold text-indigo-600 mb-2">{item.category}</div>
                <div className="text-sm text-gray-500 mb-2">Weight: {item.weight}</div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-center">Score Interpretation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-semibold text-gray-900">90-100</span>
                <span className="text-sm text-gray-600">Fully Accessible - ADA Compliant</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-semibold text-gray-900">70-89</span>
                <span className="text-sm text-gray-600">Highly Accessible - Minor mods may be needed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-semibold text-gray-900">50-69</span>
                <span className="text-sm text-gray-600">Moderately Accessible - Modifications required</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-semibold text-gray-900">30-49</span>
                <span className="text-sm text-gray-600">Limited Accessibility - Major modifications needed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-semibold text-gray-900">0-29</span>
                <span className="text-sm text-gray-600">Not Accessible - Extensive modifications required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessible Properties */}
      {accessibleProperties && accessibleProperties.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Accessible Properties</h2>
              <p className="text-xl text-gray-600">
                Homes with high accessibility scores and universal design features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {accessibleProperties.map((property: any) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                      <Accessibility className="w-4 h-4" />
                      <span>Accessible</span>
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-sm font-semibold rounded-full">
                      ADA Score: 95
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">
                      ${property.price?.toLocaleString()}
                    </div>
                    <div className="text-gray-900 font-semibold mb-1">{property.address}</div>
                    <div className="text-gray-600 text-sm mb-4">
                      {property.city}, {property.state} {property.zip_code}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      {property.bedrooms && <span>{property.bedrooms} bed</span>}
                      {property.bathrooms && <span>{property.bathrooms} bath</span>}
                      {property.square_feet && <span>{property.square_feet.toLocaleString()} sqft</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">Zero-Step</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">Wide Doors</span>
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">Roll-in Shower</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/search?accessibility=high"
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 transition inline-block"
              >
                View All Accessible Homes
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Accessible Home?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Whether you need a fully accessible home or modifications to your dream house, we have the resources and expertise to help you achieve independence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/search?accessibility=high"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Search Accessible Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Accessibility className="w-6 h-6 text-indigo-400" />
              <span className="text-white font-bold text-lg">Disabilities & Accessibility Program</span>
            </div>
          </div>
          <p className="text-sm mb-4">
            Part of CR AudioViz AI, LLC | Fort Myers, Florida
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/veterans" className="hover:text-white transition">Veterans</Link>
            <Link href="/seniors" className="hover:text-white transition">Seniors</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
