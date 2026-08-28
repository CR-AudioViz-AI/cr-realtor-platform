// app/first-responders/page.tsx
// Complete First Responders Module Landing Page

import Link from 'next/link'
import { Flame, Heart, Shield, DollarSign, Home, CheckCircle, Clock, Users, Award, ArrowRight } from 'lucide-react'
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
  title: 'First Responders Home Program | CR Realtor Platform',
  description: 'Heroes deserve hero programs. Exclusive benefits for police, firefighters, EMTs, and dispatchers. Special financing and dedicated support.'
}

export default async function FirstRespondersPage() {
  const supabase = await createClient()
  
  // Get first responder-friendly properties
  const { data: responderProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('social_impact_type', 'first_responders')
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
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/veterans" className="text-gray-700 hover:text-red-600 font-medium">
                Veterans
              </Link>
              <Link href="/seniors" className="text-gray-700 hover:text-red-600 font-medium">
                Seniors
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-orange-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('/patterns/hero.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Flame className="w-12 h-12" />
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Shield className="w-12 h-12" />
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Heart className="w-12 h-12" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Heroes Deserve Hero Programs
            </h1>
            
            <p className="text-xl md:text-2xl text-red-100 mb-8">
              You protect our communities every day. Now it's our turn to help you find the perfect home with exclusive first responder benefits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="#benefits"
                className="px-8 py-4 bg-white text-red-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                See Your Benefits
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#properties"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                Search Homes
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$5,000</div>
                <div className="text-red-100 text-sm">Closing Cost Assistance</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">50%</div>
                <div className="text-red-100 text-sm">Off Platform Fees</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-red-100 text-sm">Flexible Showings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{responderProperties?.length || 52}</div>
                <div className="text-red-100 text-sm">Hero Properties</div>
              </div>
            </div>

            {/* Eligible Professions Badge */}
            <div className="mt-8 inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm text-red-100 mb-2">✓ Eligible Professions:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">Police Officers</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">Firefighters</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">EMTs</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">Paramedics</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">Dispatchers</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">Correctional Officers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Hero Benefits Package</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Because those who serve deserve more. Here's everything you get as a first responder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">$5,000 Closing Assistance</h3>
              <p className="text-gray-600 mb-4">
                Up to $5,000 towards closing costs through hero home programs and partner lenders.
              </p>
              <div className="text-sm text-red-600 font-semibold">
                Grant, Not Loan
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Shift-Friendly Showings</h3>
              <p className="text-gray-600 mb-4">
                24/7 property showings that work around your demanding schedule. Night shifts? We got you.
              </p>
              <div className="text-sm text-orange-600 font-semibold">
                Anytime Access
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lower Down Payments</h3>
              <p className="text-gray-600 mb-4">
                Qualify for 3% down payment programs and special FHA terms for first responders.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                As Low As 3% Down
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Priority Access</h3>
              <p className="text-gray-600 mb-4">
                Get first look at new listings and priority scheduling for showings and inspections.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                See It First
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">First Responder Realtors</h3>
              <p className="text-gray-600 mb-4">
                Work with realtors who are former or current first responders. They get your lifestyle.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                One of Your Own
              </div>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">50% Off Fees</h3>
              <p className="text-gray-600 mb-4">
                Half price on all platform fees and services. Our way of saying thank you for your service.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">
                Save: $2,500+
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Station Proximity Search */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Find Homes Near Your Station</h2>
              <p className="text-xl text-gray-600">
                Search by commute time to your fire station, police department, or hospital
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Your Station */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Station/Department
                  </label>
                  <input
                    type="text"
                    placeholder="Fort Myers Fire Station 1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Max Commute */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Commute Time
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none">
                    <option>15 minutes</option>
                    <option>20 minutes</option>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Budget
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none">
                    <option>Under $300K</option>
                    <option>$300K - $400K</option>
                    <option>$400K - $500K</option>
                    <option>$500K+</option>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none">
                    <option>Any Type</option>
                    <option>Single Family</option>
                    <option>Condo</option>
                    <option>Townhouse</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Find Homes Near Your Station
              </button>

              <div className="mt-6 p-4 bg-white rounded-lg">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <strong>Smart scheduling:</strong> All showings can be scheduled around your shifts. 
                    Night worker? We'll show properties during the day. Working weekends? We're available weekdays.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Properties */}
      {responderProperties && responderProperties.length > 0 && (
        <section id="properties" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Hero Properties</h2>
              <p className="text-xl text-gray-600">
                Homes with special programs for first responders
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {responderProperties.map((property: any) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 bg-gradient-to-br from-red-100 to-orange-100">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Hero</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-2xl font-bold text-red-600 mb-2">
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
                href="/search?social_impact=first_responders"
                className="px-8 py-4 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition inline-block"
              >
                View All Hero Properties
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Partner Programs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Hero Partners</h2>
            <p className="text-xl text-gray-600">
              We've partnered with organizations that support first responders
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="font-bold text-gray-700">Homes for Heroes</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="font-bold text-gray-700">Blue Line Foundation</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="font-bold text-gray-700">IAFF Local 1826</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="font-bold text-gray-700">National EMS</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Hero Home?</h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of first responders who've found their perfect homes with exclusive hero benefits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-red-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/search?social_impact=first_responders"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Search Hero Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Shield className="w-6 h-6 text-red-400" />
              <span className="text-white font-bold text-lg">First Responders Program</span>
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
