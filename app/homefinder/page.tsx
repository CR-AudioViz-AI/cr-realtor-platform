// app/homefinder/page.tsx
// HomeFinder AI - Public Property Search (Separate Brand)
// This is the "Zillow Competitor" that routes leads to our agents

import Link from 'next/link'
import { Search, MapPin, Home, Building, TrendingUp, Heart, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

// Property type for TypeScript
interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zip_code?: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  primary_photo?: string
  description?: string
  status: string
  created_at: string
  property_type?: string
  year_built?: number
  features?: string[]
  realtor_id?: string
  social_impact_type?: string
}

export const metadata = {
  title: 'HomeFinder AI - Find Your Perfect Home',
  description: 'Search millions of homes for sale. Find your dream home with advanced AI-powered search and instant property alerts.'
}

export default async function HomeFinderPage() {
  const supabase = await createClient()
  
  // Get featured properties
  const { data: featuredData } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .limit(6)
    .order('created_at', { ascending: false })
  
  const featured = featuredData as any[]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Looks like independent brand */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/homefinder" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">HomeFinder<span className="text-emerald-600">AI</span></span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/homefinder/buy" className="text-gray-700 hover:text-emerald-600 font-medium">Buy</Link>
              <Link href="/homefinder/sell" className="text-gray-700 hover:text-emerald-600 font-medium">Sell</Link>
              <Link href="/homefinder/agents" className="text-gray-700 hover:text-emerald-600 font-medium">Find Agent</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Zillow Style */}
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Dream Home with AI
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Search millions of homes, get instant alerts, and connect with top local agents
            </p>

            {/* Main Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold">Buy</button>
                <button className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold">Rent</button>
                <button className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold">Sold</button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-4">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Enter city, neighborhood, or ZIP code"
                    className="flex-1 bg-transparent outline-none text-lg"
                  />
                </div>
                <Link href="/homefinder/search" className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-700 flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Link>
              </div>

              {/* Quick Filters */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <Link href="/homefinder/search?minPrice=0&maxPrice=300000" className="p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-600 text-center transition-colors">
                  <div className="font-semibold text-gray-900">Under $300K</div>
                  <div className="text-sm text-gray-600">Affordable homes</div>
                </Link>
                <Link href="/homefinder/search?minPrice=300000&maxPrice=500000" className="p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-600 text-center transition-colors">
                  <div className="font-semibold text-gray-900">$300K - $500K</div>
                  <div className="text-sm text-gray-600">Mid-range homes</div>
                </Link>
                <Link href="/homefinder/search?minPrice=500000&maxPrice=1000000" className="p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-600 text-center transition-colors">
                  <div className="font-semibold text-gray-900">$500K - $1M</div>
                  <div className="text-sm text-gray-600">Luxury homes</div>
                </Link>
                <Link href="/homefinder/search?minPrice=1000000" className="p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-600 text-center transition-colors">
                  <div className="font-semibold text-gray-900">$1M+</div>
                  <div className="text-sm text-gray-600">Premium estates</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Homes</h2>
            <Link href="/homefinder/search" className="text-emerald-600 font-semibold hover:text-emerald-700">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured?.map((property) => (
              <Link 
                key={property.id} 
                href={`/homefinder/property/${property.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-64 bg-gray-200">
                  {property.primary_photo ? (
                    <img src={property.primary_photo} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-emerald-50">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    NEW
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ${property.price?.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <span>{property.bedrooms} bd</span>
                    <span>•</span>
                    <span>{property.bathrooms} ba</span>
                    <span>•</span>
                    <span>{property.square_feet?.toLocaleString()} sqft</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{property.city}, {property.state}</span>
                  </div>
                  <button className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">
                    Contact Agent
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why HomeFinder AI */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose HomeFinder AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Search</h3>
              <p className="text-gray-600">Find homes that match your exact needs with advanced AI filtering</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">Get instant alerts when new homes match your criteria</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Agents</h3>
              <p className="text-gray-600">Connect with top-rated local agents who know your market</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Looks Independent */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Home className="w-6 h-6 text-emerald-400" />
                <span className="text-white font-bold text-lg">HomeFinderAI</span>
              </div>
              <p className="text-sm">Your trusted partner in finding the perfect home.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/homefinder/search" className="hover:text-white">Search Homes</Link></li>
                <li><Link href="/homefinder/agents" className="hover:text-white">Find an Agent</Link></li>
                <li><Link href="/homefinder/mortgage" className="hover:text-white">Mortgage Calculator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/homefinder/sell" className="hover:text-white">Sell Your Home</Link></li>
                <li><Link href="/homefinder/value" className="hover:text-white">Home Value Estimate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><a href="https://craudiovizai.com/contact" className="hover:text-white">Contact</a></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 HomeFinder AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
