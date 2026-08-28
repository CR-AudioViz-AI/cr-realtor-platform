import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Search, Bed, Bath, Square, MapPin, Home, Building2, Factory, TreePine } from 'lucide-react'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  // Build query based on filters
  let query = supabase
    .from('properties')
    .select(`
      *,
      agent:profiles!listing_agent_id(id, first_name, last_name, email, phone)
    `)
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  // Apply filters from search params
  const category = searchParams.category as string
  const transaction = searchParams.transaction as string
  const city = searchParams.city as string
  const minPrice = searchParams.minPrice as string
  const maxPrice = searchParams.maxPrice as string
  const beds = searchParams.beds as string

  if (category) {
    query = query.eq('category', category)
  }
  if (transaction) {
    query = query.eq('transaction_type', transaction)
  }
  if (city) {
    query = query.ilike('city', `%${city}%`)
  }
  if (minPrice) {
    query = query.gte('price', parseInt(minPrice))
  }
  if (maxPrice) {
    query = query.lte('price', parseInt(maxPrice))
  }
  if (beds) {
    query = query.gte('bedrooms', parseInt(beds))
  }

  const { data: properties, error } = await query.limit(50)

  if (error) {
    console.error('Error fetching properties:', error)
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'residential': return Home
      case 'commercial': return Building2
      case 'industrial': return Factory
      case 'land': return TreePine
      default: return Home
    }
  }

  const formatPrice = (price: number, transactionType: string) => {
    if (transactionType === 'rent') {
      return `$${price.toLocaleString()}/mo`
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`
    }
    return `$${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CR Realtor Platform</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
              Sign In
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Search Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Find Your Dream Property</h1>
          <p className="text-blue-100 mb-6">Browse {properties?.length || 0} active listings in Southwest Florida</p>
          
          <form className="bg-white rounded-xl p-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                name="city"
                defaultValue={city || ''}
                placeholder="City or ZIP code"
                className="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select 
                name="category"
                defaultValue={category || ''}
                className="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="land">Land</option>
              </select>
              <select 
                name="transaction"
                defaultValue={transaction || ''}
                className="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Buy or Rent</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
              <select 
                name="maxPrice"
                defaultValue={maxPrice || ''}
                className="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Price</option>
                <option value="250000">Up to $250K</option>
                <option value="500000">Up to $500K</option>
                <option value="1000000">Up to $1M</option>
                <option value="2500000">Up to $2.5M</option>
                <option value="5000000">Up to $5M</option>
              </select>
              <button 
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Property Grid */}
      <div className="container mx-auto px-4 py-12">
        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const CategoryIcon = getCategoryIcon(property.category)
              const photos = property.photos as string[] | null
              const features = property.features as string[] | null
              const agent = property.agent as { first_name: string; last_name: string } | null
              
              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group"
                >
                  {/* Image */}
                  <div className="relative h-56 bg-gray-200">
                    {photos && photos[0] ? (
                      <img
                        src={photos[0]}
                        alt={property.title || property.address}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <CategoryIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {property.featured && (
                        <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                          Featured
                        </span>
                      )}
                      <span className={`px-3 py-1 text-white text-xs font-bold rounded-full ${
                        property.transaction_type === 'rent' ? 'bg-purple-600' : 'bg-green-600'
                      }`}>
                        {property.transaction_type === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-4 py-2 bg-black/70 text-white text-lg font-bold rounded-lg">
                        {formatPrice(property.price, property.transaction_type)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                      {property.title || property.address}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{property.city}, {property.state} {property.zip_code}</span>
                    </div>

                    {/* Stats */}
                    {property.category === 'residential' && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} beds</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} baths</span>
                          </div>
                        )}
                        {property.square_feet && (
                          <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            <span>{property.square_feet.toLocaleString()} sqft</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Features */}
                    {features && features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Agent */}
                    {agent && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          Listed by <span className="font-medium text-gray-700">{agent.first_name} {agent.last_name}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your search filters or check back later for new listings.</p>
            <Link
              href="/properties"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CR AudioViz AI, LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
