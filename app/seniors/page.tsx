// app/seniors/page.tsx
// Complete Seniors (55+) Module Landing Page

import Link from 'next/link'
import { Heart, Home, DollarSign, CheckCircle, Users, Award, Sun, ArrowRight, Accessibility } from 'lucide-react'
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
  title: 'Seniors Home Program (55+) | CR Realtor Platform',
  description: 'Find your perfect retirement or downsizing home. Age-friendly communities, accessibility features, and senior-specific financial programs.'
}

export default async function SeniorsPage() {
  const supabase = await createClient()
  
  // Get senior-friendly properties
  const { data: seniorProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('social_impact_type', 'seniors')
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/veterans" className="text-gray-700 hover:text-purple-600 font-medium">
                Veterans
              </Link>
              <Link href="/first-responders" className="text-gray-700 hover:text-purple-600 font-medium">
                First Responders
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/patterns/waves.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Sun className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Next Chapter Starts Here
            </h1>
            
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              Whether you're downsizing, relocating, or finding your dream retirement home, we have programs designed specifically for seniors 55+.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="#benefits"
                className="px-8 py-4 bg-white text-purple-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                Explore Benefits
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#downsizing"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                Downsizing Calculator
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">55+</div>
                <div className="text-purple-100 text-sm">Age Qualified</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-purple-100 text-sm">Accessible Homes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$10K+</div>
                <div className="text-purple-100 text-sm">Senior Grants Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{seniorProperties?.length || 64}</div>
                <div className="text-purple-100 text-sm">Senior Properties</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Senior Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Senior Benefits Package</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive support for seniors buying, selling, or downsizing their homes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Accessibility className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Accessibility Scoring</h3>
              <p className="text-gray-600 mb-4">
                Every property rated for accessibility features: ramps, wide doorways, grab bars, and zero-step entries.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                Find the Right Fit
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Downsizing Made Easy</h3>
              <p className="text-gray-600 mb-4">
                Free moving coordination, estate sale services, and help finding the perfect smaller home.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                Stress-Free Transition
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Senior Financial Programs</h3>
              <p className="text-gray-600 mb-4">
                Reverse mortgages, property tax exemptions, and senior-specific loan programs explained clearly.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                Maximize Your Benefits
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">55+ Communities</h3>
              <p className="text-gray-600 mb-4">
                Search exclusively in age-restricted communities with amenities designed for active adults.
              </p>
              <div className="text-sm text-orange-600 font-semibold">
                Active Lifestyle
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare Proximity</h3>
              <p className="text-gray-600 mb-4">
                Filter by distance to hospitals, urgent care, pharmacies, and medical specialists.
              </p>
              <div className="text-sm text-red-600 font-semibold">
                Peace of Mind
              </div>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Age-in-Place Support</h3>
              <p className="text-gray-600 mb-4">
                Find homes that can be modified for aging in place, plus contractor referrals for modifications.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">
                Long-term Planning
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Downsizing Calculator */}
      <section id="downsizing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Downsizing Calculator</h2>
              <p className="text-xl text-gray-600">
                See how much you could save by moving to a smaller, more manageable home
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Current Home Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Home Value
                  </label>
                  <input
                    type="number"
                    placeholder="$450,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Current Mortgage Balance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Mortgage Balance
                  </label>
                  <input
                    type="number"
                    placeholder="$150,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Target Home Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Home Price
                  </label>
                  <input
                    type="number"
                    placeholder="$300,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Current Monthly Costs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Monthly Costs (All)
                  </label>
                  <input
                    type="number"
                    placeholder="$3,200"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Calculate My Downsizing Savings
              </button>

              {/* Results */}
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Cash From Sale</div>
                    <div className="text-2xl font-bold text-green-600">$285,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Monthly Savings</div>
                    <div className="text-2xl font-bold text-purple-600">$1,450</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Annual Savings</div>
                    <div className="text-2xl font-bold text-blue-600">$17,400</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Equity Available:</strong> With $285,000 cash from your sale, you could buy outright 
                        or have a small mortgage with very low monthly payments.
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Lower Costs:</strong> Smaller home means less maintenance, lower utilities, 
                        lower property taxes, and lower insurance. Save $1,450/month.
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>More Freedom:</strong> Less house to maintain means more time for travel, 
                        hobbies, and family. Plus extra cash for retirement goals.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Features Guide */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Essential Accessibility Features</h2>
            <p className="text-xl text-gray-600">
              What to look for when choosing an age-friendly home
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3 text-purple-600">✓ Entry & Mobility</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Zero-step or ramped entry</li>
                <li>• Wide doorways (36" minimum)</li>
                <li>• Lever-style door handles</li>
                <li>• Open floor plan (no steps between rooms)</li>
                <li>• First-floor bedroom and bath</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3 text-blue-600">✓ Bathroom Safety</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Walk-in or roll-in shower</li>
                <li>• Grab bars near toilet and shower</li>
                <li>• Non-slip flooring</li>
                <li>• Raised toilet seat height</li>
                <li>• Accessible sink height</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3 text-green-600">✓ Kitchen Adaptations</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Lower countertops or varied heights</li>
                <li>• Pull-out shelves and drawers</li>
                <li>• Easy-reach appliances</li>
                <li>• Good lighting and contrast</li>
                <li>• Space for seated work</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3 text-orange-600">✓ Safety & Convenience</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Bright, even lighting throughout</li>
                <li>• Easy-access electrical outlets</li>
                <li>• Emergency call system ready</li>
                <li>• Low-maintenance exterior</li>
                <li>• Security system friendly</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              All homes on our platform are rated with an Accessibility Score (0-100)
            </p>
            <Link
              href="/search?accessibility=high"
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition inline-block"
            >
              Search High-Accessibility Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Senior Properties */}
      {seniorProperties && seniorProperties.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Senior-Friendly Properties</h2>
              <p className="text-xl text-gray-600">
                Homes designed or adapted for comfortable senior living
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {seniorProperties.map((property: any) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                      <Sun className="w-4 h-4" />
                      <span>55+</span>
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-purple-600 text-sm font-semibold rounded-full">
                      Accessibility: High
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      ${property.price?.toLocaleString()}
                    </div>
                    <div className="text-gray-900 font-semibold mb-1">{property.address}</div>
                    <div className="text-gray-600 text-sm mb-4">
                      {property.city}, {property.state} {property.zip_code}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {property.bedrooms && <span>{property.bedrooms} bed</span>}
                      {property.bathrooms && <span>{property.bathrooms} bath</span>}
                      {property.square_feet && <span>{property.square_feet.toLocaleString()} sqft</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/search?social_impact=seniors"
                className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition inline-block"
              >
                View All Senior Properties
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Next Chapter?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Whether downsizing, relocating, or finding your dream retirement home, we're here to help every step of the way
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/search?social_impact=seniors"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Search Senior Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Sun className="w-6 h-6 text-purple-400" />
              <span className="text-white font-bold text-lg">Seniors Program (55+)</span>
            </div>
          </div>
          <p className="text-sm mb-4">
            Part of CR AudioViz AI, LLC | Fort Myers, Florida
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/veterans" className="hover:text-white transition">Veterans</Link>
            <Link href="/first-responders" className="hover:text-white transition">First Responders</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
