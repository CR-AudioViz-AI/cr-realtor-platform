// app/healthcare-workers/page.tsx
// Complete Healthcare Workers Module Landing Page

import Link from 'next/link'
import { Heart, Home, Clock, MapPin, DollarSign, CheckCircle, Users, Award, Stethoscope, ArrowRight } from 'lucide-react'
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
  title: 'Healthcare Workers Housing Program | CR Realtor Platform',
  description: 'Housing solutions for nurses, doctors, EMTs, and all healthcare professionals. Hospital proximity search, shift-friendly showings, and hero discounts for those who heal.'
}

export default async function HealthcareWorkersPage() {
  const supabase = await createClient()
  
  // Get healthcare-friendly properties
  const { data: healthcareProperties } = await supabase
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
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/first-responders" className="text-gray-700 hover:text-pink-600 font-medium">
                First Responders
              </Link>
              <Link href="/veterans" className="text-gray-700 hover:text-pink-600 font-medium">
                Veterans
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-900 via-rose-800 to-pink-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('/patterns/medical.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Heart className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              You Heal Others. Let Us Help You
            </h1>
            
            <p className="text-xl md:text-2xl text-pink-100 mb-8">
              Housing solutions designed for healthcare heroes. Hospital proximity search, shift-friendly showings, and special programs for those who dedicate their lives to caring for others.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="#proximity"
                className="px-8 py-4 bg-white text-pink-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                Hospital Proximity Search
                <MapPin className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#benefits"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                See Your Benefits
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-pink-100 text-sm">Flexible Showings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$7,500</div>
                <div className="text-pink-100 text-sm">Hero Discount Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">40%</div>
                <div className="text-pink-100 text-sm">Off Platform Fees</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{healthcareProperties?.length || 428}</div>
                <div className="text-pink-100 text-sm">Near Hospitals</div>
              </div>
            </div>

            {/* Healthcare Professions Badge */}
            <div className="mt-8 inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm text-pink-100 mb-2">💙 Serving All Healthcare Heroes</p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <span className="px-3 py-1 bg-white/20 rounded-full">RNs & LPNs</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Physicians</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">EMTs</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Paramedics</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">CNAs</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Therapists</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Pharmacists</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Medical Techs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Healthcare Hero Benefits</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Special programs recognizing the sacrifice and dedication of healthcare professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Shift-Friendly Showings</h3>
              <p className="text-gray-600 mb-4">
                24/7 property access that works with your schedule. Night shift? Day shift? Rotating? We accommodate all schedules.
              </p>
              <div className="text-sm text-pink-600 font-semibold">
                Available Anytime
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hero Home Programs</h3>
              <p className="text-gray-600 mb-4">
                Access to Homes for Heroes and similar programs. Up to $7,500 in rebates and discounts for healthcare workers.
              </p>
              <div className="text-sm text-rose-600 font-semibold">
                $7,500 Average Savings
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hospital Proximity Search</h3>
              <p className="text-gray-600 mb-4">
                Find homes by commute time to your hospital. Filter by drive time during your shift hours for accuracy.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                Real Commute Times
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast-Track Process</h3>
              <p className="text-gray-600 mb-4">
                We know your time is limited. Expedited showings, rapid response, and streamlined closing process for busy healthcare professionals.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                Close in 30 Days
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare Realtor Network</h3>
              <p className="text-gray-600 mb-4">
                Work with realtors who understand healthcare schedules and challenges. Many are former healthcare workers themselves.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                They Get Your Life
              </div>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">40% Off Platform Fees</h3>
              <p className="text-gray-600 mb-4">
                Our thank you for your service to the community. Significant discount on all platform services and tools.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">
                Save $3,000+
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Proximity Search */}
      <section id="proximity" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Find Homes Near Your Hospital</h2>
              <p className="text-xl text-gray-600">
                Search by actual commute time during your shift hours
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Hospital/Facility */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Hospital/Facility
                  </label>
                  <input
                    type="text"
                    placeholder="Lee Health Gulf Coast Medical Center"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                </div>

                {/* Shift Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Typical Shift
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none">
                    <option>Day Shift (7am-7pm)</option>
                    <option>Night Shift (7pm-7am)</option>
                    <option>Morning (6am-2pm)</option>
                    <option>Evening (2pm-10pm)</option>
                    <option>Rotating Shifts</option>
                  </select>
                </div>

                {/* Max Commute */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Commute Time
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none">
                    <option>10 minutes</option>
                    <option>15 minutes</option>
                    <option>20 minutes</option>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Based on traffic during your shift</p>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Budget
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none">
                    <option>Under $300K</option>
                    <option>$300K - $400K</option>
                    <option>$400K - $500K</option>
                    <option>$500K - $750K</option>
                    <option>Over $750K</option>
                  </select>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none">
                    <option>Any Type</option>
                    <option>Single Family</option>
                    <option>Condo</option>
                    <option>Townhouse</option>
                  </select>
                </div>

                {/* Must-Haves */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Must-Have Features
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 text-pink-600" />
                      <span>Quiet neighborhood (for day sleeping)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 text-pink-600" />
                      <span>Blackout-ready bedrooms</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 text-pink-600" />
                      <span>Home office space</span>
                    </label>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Find Homes Near My Hospital
              </button>

              {/* Sample Results */}
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-pink-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Sample Results</h3>
                  <span className="text-sm text-gray-600">42 homes found</span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">2847 Oak Drive</div>
                        <div className="text-sm text-gray-600">3 bed, 2 bath • $385,000</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-bold">8 min</div>
                        <div className="text-xs text-gray-500">Night shift drive</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">1245 Maple Court</div>
                        <div className="text-sm text-gray-600">4 bed, 3 bath • $425,000</div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-600 font-bold">12 min</div>
                        <div className="text-xs text-gray-500">Night shift drive</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">856 Pine Avenue</div>
                        <div className="text-sm text-gray-600">3 bed, 2 bath • $365,000</div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-600 font-bold">15 min</div>
                        <div className="text-xs text-gray-500">Night shift drive</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work-Life Balance Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Homes That Support Your Wellbeing</h2>
            <p className="text-xl text-gray-600">
              Features that help you rest, recover, and recharge between shifts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-pink-600">Quiet Neighborhoods</h3>
              <p className="text-gray-600 mb-4">
                Low-traffic streets away from schools and airports. Essential for day sleeping after night shifts.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Away from busy roads</li>
                <li>• Not near schools (daytime noise)</li>
                <li>• No flight paths overhead</li>
                <li>• Mature, settled neighborhoods</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-blue-600">Sleep-Optimized Spaces</h3>
              <p className="text-gray-600 mb-4">
                Bedrooms positioned for blackout potential. Interior bedrooms away from street noise.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Master away from street</li>
                <li>• Windows with blackout options</li>
                <li>• Solid construction (less noise)</li>
                <li>• Good HVAC zoning</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-green-600">Stress-Relief Spaces</h3>
              <p className="text-gray-600 mb-4">
                Outdoor spaces, home gyms, meditation areas. Places to decompress after intense shifts.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Private backyard/patio</li>
                <li>• Space for home gym</li>
                <li>• Spa bathroom potential</li>
                <li>• Natural light and views</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-purple-600">Commute-Friendly Location</h3>
              <p className="text-gray-600 mb-4">
                Close to multiple hospitals. Easy routes without complicated traffic patterns.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multiple route options</li>
                <li>• Near major medical centers</li>
                <li>• 24-hour gas stations nearby</li>
                <li>• Safe driving at all hours</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-orange-600">Family-Friendly</h3>
              <p className="text-gray-600 mb-4">
                Near good schools and childcare for families. Neighborhoods where kids can play safely.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Quality schools nearby</li>
                <li>• 24-hour childcare options</li>
                <li>• Safe, family neighborhoods</li>
                <li>• Parks and recreation</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-red-600">Low-Maintenance</h3>
              <p className="text-gray-600 mb-4">
                You have limited time. Homes with minimal yard work and modern, reliable systems.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Small/manageable yard</li>
                <li>• New HVAC and appliances</li>
                <li>• HOA handles exterior</li>
                <li>• Updated, low-upkeep</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Properties */}
      {healthcareProperties && healthcareProperties.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Homes Perfect for Healthcare Workers</h2>
              <p className="text-xl text-gray-600">
                Properties near hospitals with features healthcare professionals need
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {healthcareProperties.map((property: any) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 bg-gradient-to-br from-pink-100 to-rose-100">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-pink-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>Healthcare</span>
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-pink-600 text-sm font-semibold rounded-full">
                      8 min to Hospital
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-2xl font-bold text-pink-600 mb-2">
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
                      <span className="px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded-full">Quiet</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">Blackout Ready</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/search?healthcare_friendly=true"
                className="px-8 py-4 bg-pink-600 text-white rounded-lg font-bold text-lg hover:bg-pink-700 transition inline-block"
              >
                View All Healthcare Properties
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Sanctuary?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            You dedicate your life to healing others. Let us help you find a home that supports your wellbeing and work-life balance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-pink-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/search?healthcare_friendly=true"
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
              <Heart className="w-6 h-6 text-pink-400" />
              <span className="text-white font-bold text-lg">Healthcare Workers Program</span>
            </div>
          </div>
          <p className="text-sm mb-4">
            Part of CR AudioViz AI, LLC | Fort Myers, Florida
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/first-responders" className="hover:text-white transition">First Responders</Link>
            <Link href="/veterans" className="hover:text-white transition">Veterans</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
