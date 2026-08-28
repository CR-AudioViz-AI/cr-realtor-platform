// app/faith-based/page.tsx
// Complete Faith-Based Communities Module Landing Page

import Link from 'next/link'
import { Church, Heart, Users, Home, DollarSign, CheckCircle, MapPin, BookOpen, Award, ArrowRight } from 'lucide-react'
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
  title: 'Faith-Based Communities Housing | CR Realtor Platform',
  description: 'Housing solutions for churches, ministries, missionaries, and faith communities. Congregation relocations, parsonages, ministry housing, and faith-friendly neighborhoods.'
}

export default async function FaithBasedPage() {
  const supabase = await createClient()
  
  // Get faith-friendly properties
  const { data: faithProperties } = await supabase
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
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/veterans" className="text-gray-700 hover:text-amber-600 font-medium">
                Veterans
              </Link>
              <Link href="/first-time-buyers" className="text-gray-700 hover:text-amber-600 font-medium">
                First-Time Buyers
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/patterns/faith.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Church className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Housing for God's People
            </h1>
            
            <p className="text-xl md:text-2xl text-amber-100 mb-8">
              Supporting churches, ministries, missionaries, and faith communities with specialized housing solutions, congregation relocations, and faith-friendly neighborhoods.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="#services"
                className="px-8 py-4 bg-white text-amber-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                Our Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#properties"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                Search Properties
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">FREE</div>
                <div className="text-amber-100 text-sm">Church Relocation Consultation</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">30%</div>
                <div className="text-amber-100 text-sm">Discount Ministry Housing</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100+</div>
                <div className="text-amber-100 text-sm">Churches Served</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{faithProperties?.length || 215}</div>
                <div className="text-amber-100 text-sm">Faith-Friendly Homes</div>
              </div>
            </div>

            {/* Faith Communities Badge */}
            <div className="mt-8 inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm text-amber-100 mb-2">🙏 Serving All Faith Communities</p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <span className="px-3 py-1 bg-white/20 rounded-full">Christian</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Jewish</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Muslim</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Hindu</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Buddhist</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">All Faiths</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How We Serve Faith Communities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Specialized services designed for the unique needs of churches, ministries, and faith organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Service 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Church className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Church Building Search</h3>
              <p className="text-gray-600 mb-4">
                Finding the perfect building for your growing congregation. Commercial properties, conversion opportunities, and built-for-purpose spaces.
              </p>
              <div className="text-sm text-amber-600 font-semibold">
                From storefront to megachurch
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Parsonage & Ministry Housing</h3>
              <p className="text-gray-600 mb-4">
                Homes for pastors, ministers, priests, rabbis, and ministry staff. Close to worship centers with special financing options.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                30% discount for ministry use
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Congregation Relocation</h3>
              <p className="text-gray-600 mb-4">
                Helping entire congregations move together. Bulk property searches, group discounts, and community-building support.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                Keep your community together
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Faith-Friendly Neighborhoods</h3>
              <p className="text-gray-600 mb-4">
                Search by proximity to houses of worship, religious schools, kosher markets, halal grocers, and faith communities.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                Live near your values
              </div>
            </div>

            {/* Service 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Missionary Support</h3>
              <p className="text-gray-600 mb-4">
                Housing for missionaries, both outgoing (selling homes) and returning (finding homes). Flexible terms and understanding of unique situations.
              </p>
              <div className="text-sm text-red-600 font-semibold">
                We understand your calling
              </div>
            </div>

            {/* Service 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Religious School Housing</h3>
              <p className="text-gray-600 mb-4">
                Properties near religious schools, seminaries, yeshivas, madrasas. Student housing, faculty housing, and family homes.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">
                Education-focused locations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Church Building Calculator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Church Building Affordability Calculator</h2>
              <p className="text-xl text-gray-600">
                Calculate what size building your congregation can afford
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Congregation Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Congregation Size
                  </label>
                  <input
                    type="number"
                    placeholder="150"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Average weekly attendance</p>
                </div>

                {/* Annual Tithes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Tithes & Offerings
                  </label>
                  <input
                    type="number"
                    placeholder="$450,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total annual giving</p>
                </div>

                {/* Down Payment Available */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Building Fund Saved
                  </label>
                  <input
                    type="number"
                    placeholder="$200,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Available for down payment</p>
                </div>

                {/* Current Expenses */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Operating Expenses
                  </label>
                  <input
                    type="number"
                    placeholder="$15,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current monthly costs</p>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Calculate Affordable Building Size
              </button>

              {/* Results */}
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-amber-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Maximum Building Price</div>
                    <div className="text-2xl font-bold text-amber-600">$1.2M</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Recommended Size</div>
                    <div className="text-2xl font-bold text-blue-600">8,500 sqft</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
                    <div className="text-2xl font-bold text-green-600">$6,850</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Building Capacity:</strong> Based on 150 members, you need ~6,000 sqft minimum 
                        (40 sqft per person). With your budget, you can afford 8,500 sqft - room to grow!
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Financial Health:</strong> Your monthly payment of $6,850 is just 18% of giving. 
                        Healthy churches keep mortgage under 30% of income. You're in great shape!
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Award className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Growth Potential:</strong> With $200K down and strong giving, you qualify for 
                        church commercial loans at favorable rates. Plus multi-purpose space for community events.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry Housing Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Ministry Housing Benefits</h2>
            <p className="text-xl text-gray-600">
              Special programs for clergy and ministry staff
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-amber-600">Parsonage Allowance</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Tax-free housing allowance for ordained ministers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Covers mortgage, utilities, furnishings, repairs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Can be 20-30% of compensation package</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We help you maximize this benefit</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-600">Church-Owned Property</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Church purchases, minister lives rent-free</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Church deducts mortgage interest and depreciation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Asset appreciation benefits the church</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We structure these transactions properly</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-green-600">Minister-Owned Home</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Minister owns, uses housing allowance for payment</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Build personal equity while serving</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Security for retirement or transition</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Special financing available for clergy</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-purple-600">Housing Equity Allowance</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Church provides down payment assistance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Minister purchases home with church help</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Shared appreciation or simple loan</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We help structure fair agreements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Faith-Friendly Properties */}
      {faithProperties && faithProperties.length > 0 && (
        <section id="properties" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Faith-Friendly Properties</h2>
              <p className="text-xl text-gray-600">
                Homes in communities with strong faith presence and values
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {faithProperties.map((property: any) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 bg-gradient-to-br from-amber-100 to-orange-100">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-amber-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                      <Church className="w-4 h-4" />
                      <span>Faith</span>
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-amber-600 text-sm font-semibold rounded-full">
                      Near Houses of Worship
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-2xl font-bold text-amber-600 mb-2">
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
                href="/search?faith_friendly=true"
                className="px-8 py-4 bg-amber-600 text-white rounded-lg font-bold text-lg hover:bg-amber-700 transition inline-block"
              >
                View All Faith-Friendly Homes
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Serving God's People</h2>
            <p className="text-xl text-gray-600">
              Hear from churches and ministry leaders we've helped
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Church className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-3">
                  <div className="font-bold">Pastor James Wilson</div>
                  <div className="text-sm text-gray-600">New Hope Community Church</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "They understood our unique needs as a growing church. Found us the perfect building with room to expand. The whole process was smooth and professional."
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <div className="font-bold">Rev. Sarah Martinez</div>
                  <div className="text-sm text-gray-600">St. Mary's Parish</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Finding a parsonage close to our church was essential. They found us three great options within walking distance. The housing allowance guidance was invaluable."
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <div className="font-bold">Elder David Chen</div>
                  <div className="text-sm text-gray-600">Grace Fellowship</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "When 20 families from our congregation wanted to move together, they coordinated everything. Now we have a neighborhood where we can walk to each other's homes."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Serve Your Community?</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Whether you're a church looking for a new building, a minister needing housing, or a congregation relocating, we're here to help with faith-centered service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-amber-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/search?faith_friendly=true"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Search Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Church className="w-6 h-6 text-amber-400" />
              <span className="text-white font-bold text-lg">Faith-Based Communities Program</span>
            </div>
          </div>
          <p className="text-sm mb-4">
            Part of CR AudioViz AI, LLC | Fort Myers, Florida
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/veterans" className="hover:text-white transition">Veterans</Link>
            <Link href="/first-time-buyers" className="hover:text-white transition">First-Time Buyers</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
