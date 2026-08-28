import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Home,
  Phone,
  Mail,
  Share2,
  Heart,
  Edit,
  Building,
  Warehouse,
  Car,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get property
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Get agent info if available
  let agent = null
  if (property.listing_agent_id || property.agent_id) {
    const agentId = property.listing_agent_id || property.agent_id
    
    // Try agents table first
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', agentId)
      .single()
    
    if (agentData) {
      agent = agentData
    } else {
      // Fallback to profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', agentId)
        .single()
      
      if (profileData) {
        agent = profileData
      }
    }
  }

  const formatPrice = (price: number, transactionType?: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price)
    
    if (transactionType === 'rent') {
      return `${formatted}/mo`
    }
    return formatted
  }

  const pricePerSqFt = property.square_feet 
    ? Math.round(property.price / property.square_feet)
    : null

  // Get images from either images array or photos jsonb
  const images = property.images || property.photos || []
  const firstImage = images[0] || null

  // Get features - handle both array and jsonb
  const features = Array.isArray(property.features) 
    ? property.features 
    : (typeof property.features === 'object' && property.features !== null)
      ? Object.values(property.features)
      : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/realtor"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                <Share2 className="w-5 h-5" />
              </button>
              <Link
                href={`/dashboard/properties/${params.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <div className="bg-white rounded-2xl overflow-hidden border">
              {firstImage ? (
                <div className="aspect-video relative">
                  <img
                    src={firstImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-lg">
                      +{images.length - 1} more photos
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.status === 'active' ? 'bg-green-500 text-white' :
                      property.status === 'pending' ? 'bg-yellow-500 text-white' :
                      property.status === 'sold' ? 'bg-red-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                    </span>
                    {property.featured && (
                      <span className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Home className="w-20 h-20 text-gray-300" />
                </div>
              )}
              
              {/* Photo Gallery */}
              {images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((img: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden relative">
                      <img
                        src={img}
                        alt={`${property.title} - Photo ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-2xl p-6 border">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {property.category?.charAt(0).toUpperCase() + property.category?.slice(1)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      For {property.transaction_type === 'rent' ? 'Rent' : 'Sale'}
                    </span>
                    {property.mls_number && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        MLS# {property.mls_number}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{property.address}, {property.city}, {property.state} {property.zip_code}</span>
                  </div>
                  {property.county && (
                    <p className="text-sm text-gray-400 mt-1">{property.county} County</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl md:text-4xl font-bold text-emerald-600">
                    {formatPrice(property.price, property.transaction_type)}
                  </p>
                  {pricePerSqFt && property.transaction_type !== 'rent' && (
                    <p className="text-sm text-gray-500">${pricePerSqFt}/sqft</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                {property.bedrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Bed className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{property.bedrooms}</p>
                    <p className="text-xs text-gray-500">Bedrooms</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Bath className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{property.bathrooms}</p>
                    <p className="text-xs text-gray-500">Bathrooms</p>
                  </div>
                )}
                {property.square_feet && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Square className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{property.square_feet?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Sq Ft</p>
                  </div>
                )}
                {property.year_built && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{property.year_built}</p>
                    <p className="text-xs text-gray-500">Year Built</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border">
              <h2 className="text-xl font-bold mb-4">About This Property</h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {property.description || 'No description available.'}
              </p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border">
                <h2 className="text-xl font-bold mb-4">Features & Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-2xl p-6 border">
              <h2 className="text-xl font-bold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium">{property.property_type}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium capitalize">{property.category}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-500">Transaction</span>
                  <span className="font-medium capitalize">{property.transaction_type}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium capitalize ${
                    property.status === 'active' ? 'text-green-600' :
                    property.status === 'pending' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>{property.status}</span>
                </div>
                {property.lot_size && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Lot Size</span>
                    <span className="font-medium">{property.lot_size} acres</span>
                  </div>
                )}
                {property.parking_spaces && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Parking</span>
                    <span className="font-medium">{property.parking_spaces} spaces</span>
                  </div>
                )}
                {property.garage_spaces && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Garage</span>
                    <span className="font-medium">{property.garage_spaces} car</span>
                  </div>
                )}
                {property.listed_date && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Listed Date</span>
                    <span className="font-medium">
                      {new Date(property.listed_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Commercial/Industrial Specific */}
                {property.office_space && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Office Space</span>
                    <span className="font-medium">{property.office_space?.toLocaleString()} sqft</span>
                  </div>
                )}
                {property.warehouse_space && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Warehouse Space</span>
                    <span className="font-medium">{property.warehouse_space?.toLocaleString()} sqft</span>
                  </div>
                )}
                {property.loading_docks && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Loading Docks</span>
                    <span className="font-medium">{property.loading_docks}</span>
                  </div>
                )}
                {property.ceiling_height && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-500">Ceiling Height</span>
                    <span className="font-medium">{property.ceiling_height} ft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {property.neighborhood && (
              <div className="bg-white rounded-2xl p-6 border">
                <h2 className="text-xl font-bold mb-4">Location</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{property.neighborhood}</span>
                  {property.county && <span>• {property.county} County</span>}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-2xl p-6 border sticky top-24">
              <h3 className="font-bold text-lg mb-4">Listed By</h3>
              <div className="flex items-center gap-4 mb-4">
                {agent?.photo_url ? (
                  <img
                    src={agent.photo_url}
                    alt={agent.name || agent.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                    {agent?.first_name?.[0] || agent?.name?.[0] || 'A'}
                    {agent?.last_name?.[0] || ''}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {agent?.full_name || agent?.name || `${agent?.first_name || ''} ${agent?.last_name || ''}`.trim() || 'Listing Agent'}
                  </p>
                  <p className="text-sm text-gray-500">{agent?.title || 'Real Estate Professional'}</p>
                </div>
              </div>

              {agent?.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {agent.bio}
                </p>
              )}

              <div className="space-y-2">
                {agent?.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">{agent.phone}</span>
                  </a>
                )}
                {agent?.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 truncate">{agent.email}</span>
                  </a>
                )}
              </div>

              <button className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
                Request Showing
              </button>
              <button className="w-full mt-2 px-4 py-3 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition">
                Ask a Question
              </button>
            </div>

            {/* Share Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-3">Share This Property</h3>
              <p className="text-sm text-slate-300 mb-4">
                Know someone who might be interested? Share this listing!
              </p>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition border border-white/20">
                  Copy Link
                </button>
                <button className="flex-1 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition border border-white/20">
                  Email
                </button>
              </div>
            </div>

            {/* Mortgage Calculator Teaser */}
            <div className="bg-white rounded-2xl p-6 border">
              <h3 className="font-bold mb-2">Estimate Your Payment</h3>
              <p className="text-sm text-gray-500 mb-4">
                Get a quick estimate of your monthly mortgage payment.
              </p>
              <div className="text-center py-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">
                  ~${Math.round((property.price * 0.065) / 12).toLocaleString()}/mo
                </p>
                <p className="text-xs text-gray-500 mt-1">Est. with 20% down, 6.5% rate</p>
              </div>
              <button className="w-full mt-4 px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
                Calculate Full Payment →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
