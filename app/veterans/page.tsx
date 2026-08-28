// app/veterans/page.tsx
// Complete Veterans Module Landing Page

import Link from 'next/link'
import { Shield, DollarSign, Home, CheckCircle, MapPin, Users, Award, ArrowRight } from 'lucide-react'
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
  title: 'Veterans Home Program | CR Realtor Platform',
  description: 'Thank you for your service. Find your dream home with exclusive VA benefits, $0 down loans, and dedicated veteran realtors.'
}

export default async function VeteransPage() {
  const supabase = await createClient()
  
  // Get veteran-friendly properties
  const { data: veteranProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('social_impact_type', 'veterans')
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/first-responders" className="text-gray-700 hover:text-blue-600 font-medium">
                First Responders
              </Link>
              <Link href="/seniors" className="text-gray-700 hover:text-blue-600 font-medium">
                Seniors
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('/patterns/military.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Shield className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome Home, Soldier
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              You served our country. Now let us serve you. Exclusive benefits, $0 down VA loans, and homes near bases.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="#benefits"
                className="px-8 py-4 bg-white text-blue-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                See Your Benefits
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#calculator"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                Calculate VA Loan
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">$0</div>
                <div className="text-blue-100">Down Payment Required</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">50%</div>
                <div className="text-blue-100">Off Platform Fees</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">{veteranProperties?.length || 47}</div>
                <div className="text-blue-100">Veteran Properties Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VA Loan Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Exclusive VA Benefits</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              As a veteran, you've earned special privileges. Here's what you get with CR Realtor Platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">$0 Down Payment</h3>
              <p className="text-gray-600 mb-4">
                VA loans require no down payment. Buy your dream home without saving for years.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                Save: $20,000 - $80,000+
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">No PMI Required</h3>
              <p className="text-gray-600 mb-4">
                VA loans don't require Private Mortgage Insurance, saving you hundreds monthly.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                Save: $250 - $400/month
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lower Interest Rates</h3>
              <p className="text-gray-600 mb-4">
                VA loans typically offer rates 0.5-1% lower than conventional mortgages.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                Save: $100 - $300/month
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Base Proximity Search</h3>
              <p className="text-gray-600 mb-4">
                Find homes near military bases with commute time calculations and base info.
              </p>
              <div className="text-sm text-orange-600 font-semibold">
                Exclusive Feature
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Veteran Realtors</h3>
              <p className="text-gray-600 mb-4">
                Work with realtors who served. They understand military life and PCS moves.
              </p>
              <div className="text-sm text-red-600 font-semibold">
                Priority Matching
              </div>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">50% Off Fees</h3>
              <p className="text-gray-600 mb-4">
                Our thank you for your service. Half price on all platform fees and services.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">
                Save: $2,500+
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VA Loan Calculator */}
      <section id="calculator" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">VA Loan Calculator</h2>
              <p className="text-xl text-gray-600">
                See how much home you can afford with your VA benefits
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Monthly Income */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Gross Income
                  </label>
                  <input
                    type="number"
                    placeholder="$5,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Monthly Debts */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Debt Payments
                  </label>
                  <input
                    type="number"
                    placeholder="$500"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    placeholder="6.5"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none">
                    <option>Fort Myers, FL</option>
                    <option>Tampa, FL</option>
                    <option>Orlando, FL</option>
                    <option>Jacksonville, FL</option>
                    <option>Miami, FL</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Calculate My VA Loan
              </button>

              {/* Results Placeholder */}
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Maximum Home Price</div>
                    <div className="text-2xl font-bold text-blue-600">$425,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
                    <div className="text-2xl font-bold text-green-600">$2,315</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Down Payment</div>
                    <div className="text-2xl font-bold text-purple-600">$0</div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <strong>You're pre-qualified!</strong> With a VA loan, you could buy a home up to $425,000 with $0 down. 
                      That's a savings of $85,000 compared to conventional 20% down.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Veteran Properties */}
      {veteranProperties && veteranProperties.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Veteran-Friendly Homes</h2>
              <p className="text-xl text-gray-600">
                Properties tagged for veterans, near bases, or with veteran sellers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {veteranProperties.map((property: any) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Veteran</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
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
                href="/search?social_impact=veterans"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition inline-block"
              >
                View All Veteran Properties
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Home?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of veterans who've found their dream homes with CR Realtor Platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/search?social_impact=veterans"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Search Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <span className="text-white font-bold text-lg">Veterans Program</span>
            </div>
          </div>
          <p className="text-sm mb-4">
            Part of CR AudioViz AI, LLC | Fort Myers, Florida
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/first-responders" className="hover:text-white transition">First Responders</Link>
            <Link href="/seniors" className="hover:text-white transition">Seniors</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
