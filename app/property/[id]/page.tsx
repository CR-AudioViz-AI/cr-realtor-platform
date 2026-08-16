'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, 
  Calendar, Home, Phone, Mail, ChevronLeft, ChevronRight,
  Building, Ruler, Car, Waves, Trees, DollarSign, TrendingUp,
  GraduationCap, Loader2, ExternalLink
} from 'lucide-react'

interface PropertyInsight {
  valuation: {
    value: number
    rangeLow: number | null
    rangeHigh: number | null
    confidence: string
    spreadPercent: number | null
    vsAsking: number | null
    comparables: Array<{
      address: string; price: number | null; beds: number | null; baths: number | null
      sqft: number | null; milesAway: number | null; daysAgo: number | null; similarity: number | null
    }>
  } | null
  rental: { rent: number; rangeLow: number | null; rangeHigh: number | null; grossYieldPercent: number | null } | null
  flood: { zone: string; risk: string; insuranceRequired: boolean; plain: string } | null
  walkability: { index: number; outOf: number; label: string } | null
  schools: Array<{ name: string; type: string; district: string; rating: number | null; distance: string | null }>
}

interface PropertyDetail {
  id: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  beds: number
  baths: number
  sqft: number
  yearBuilt?: number
  propertyType: string
  status: string
  photos: string[]
  description?: string
  mlsNumber?: string
  daysOnMarket?: number
  lotSize?: string
  garage?: number
  pool?: boolean
  waterfront?: boolean
  source: string
  features?: string[]
  listingAgent?: {
    name: string
    phone?: string
    email?: string
    brokerage?: string
    photo?: string
  }
  priceHistory?: Array<{ date: string; price: number; event: string }>
  taxHistory?: Array<{ year: number; taxes: number; assessment: number }>
  schools?: Array<{ name: string; type: string; rating: number; distance: string }>
  coordinates?: { lat: number; lng: number }
}

// Convert thumbnail URL to FULL HD original resolution
function getHighResPhoto(url: string): string {
  if (!url) return ''
  
  // Realtor.com photos: change 's' suffix to 'o' for ORIGINAL full resolution
  // Thumbnail: https://ap.rdcpix.com/xxx-m745489497s.jpg (3.9 KB - blurry)
  // Original:  https://ap.rdcpix.com/xxx-m745489497o.jpg (204 KB - FULL HD!)
  if (url.includes('rdcpix.com')) {
    return url
      .replace(/(-[mbfe]\d+)s\.jpg$/i, '$1o.jpg')
      .replace(/(-[mbfe]\d+)s\.webp$/i, '$1o.webp')
      .replace(/(-[mbfe]\d+)s\.png$/i, '$1o.png')
  }
  
  return url
}

// 2026-08-15: this file shipped four Unsplash stock photographs of houses and
// showed them whenever a listing had no photo. A stranger's home presented as
// the one a buyer is considering is the same dishonesty as the demo listings
// this platform served for months. Removed — a property shows a real Street View
// photograph of its own address or it shows no photograph.

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  // Everything the route knows about the address beyond the listing itself.
  const [insight, setInsight] = useState<PropertyInsight | null>(null)

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  const fetchProperty = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/mls/property/${propertyId}`)
      const data = await response.json()
      
      if (data.success && data.property) {
        setProperty(data.property)
        setInsight({
          valuation: data.valuation ?? null,
          rental: data.rental ?? null,
          flood: data.flood ?? null,
          walkability: data.walkability ?? null,
          schools: data.schools ?? [],
        })
      } else {
        setError(data.error || 'Property not found')
      }
    } catch (err) {
      console.error('Error fetching property:', err)
      setError('Failed to load property details')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const nextPhoto = () => {
    if (property) {
      const photos = property.photos
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    }
  }

  const prevPhoto = () => {
    if (property) {
      const photos = property.photos
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for could not be found.'}</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/search"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Search
            </Link>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const photos = property.photos
  const currentPhoto = getHighResPhoto(photos[currentPhotoIndex])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="relative bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Main Photo */}
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={currentPhoto}
              alt={`${property.address} - Photo ${currentPhotoIndex + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${
                property.status === 'for_sale' ? 'bg-green-500 text-white' :
                property.status === 'pending' ? 'bg-yellow-500 text-white' :
                property.status === 'sold' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {property.status === 'for_sale' ? 'For Sale' : 
                 property.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
              <button className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white">
                <Share2 className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Photo Counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white rounded-lg text-sm">
              {currentPhotoIndex + 1} / {photos.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="bg-gray-800 px-4 py-3 overflow-x-auto">
            <div className="flex gap-2 justify-center">
              {photos.slice(0, 10).map((photo, index) => (
                <button
                  key={index}
                  onClick={() => goToPhoto(index)}
                  className={`relative w-20 h-14 flex-shrink-0 rounded overflow-hidden ${
                    index === currentPhotoIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={getHighResPhoto(photo)}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
              {photos.length > 10 && (
                <div className="w-20 h-14 flex-shrink-0 rounded bg-gray-700 flex items-center justify-center text-white text-sm">
                  +{photos.length - 10} more
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price & Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {formatPrice(property.price)}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-lg mb-4">
                <MapPin className="w-5 h-5" />
                {property.address}, {property.city}, {property.state} {property.zip}
              </div>
              
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Bed className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-800">{property.beds}</div>
                  <div className="text-gray-500 text-sm">Bedrooms</div>
                </div>
                <div className="text-center">
                  <Bath className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-800">{property.baths}</div>
                  <div className="text-gray-500 text-sm">Bathrooms</div>
                </div>
                <div className="text-center">
                  <Square className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-800">{property.sqft?.toLocaleString() || 'N/A'}</div>
                  <div className="text-gray-500 text-sm">Sq Ft</div>
                </div>
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-gray-800">{property.yearBuilt || 'N/A'}</div>
                  <div className="text-gray-500 text-sm">Year Built</div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Property Type</div>
                    <div className="font-medium text-gray-800">{property.propertyType}</div>
                  </div>
                </div>
                {property.lotSize && (
                  <div className="flex items-center gap-3">
                    <Ruler className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Lot Size</div>
                      <div className="font-medium text-gray-800">{property.lotSize}</div>
                    </div>
                  </div>
                )}
                {property.garage !== undefined && property.garage > 0 && (
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Garage</div>
                      <div className="font-medium text-gray-800">{property.garage} car</div>
                    </div>
                  </div>
                )}
                {property.daysOnMarket !== undefined && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Days on Market</div>
                      <div className="font-medium text-gray-800">{property.daysOnMarket} days</div>
                    </div>
                  </div>
                )}
                {property.pool && (
                  <div className="flex items-center gap-3">
                    <Waves className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-gray-500">Pool</div>
                      <div className="font-medium text-gray-800">Yes</div>
                    </div>
                  </div>
                )}
                {property.waterfront && (
                  <div className="flex items-center gap-3">
                    <Trees className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-sm text-gray-500">Waterfront</div>
                      <div className="font-medium text-gray-800">Yes</div>
                    </div>
                  </div>
                )}
                {property.sqft > 0 && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Price per Sq Ft</div>
                      <div className="font-medium text-gray-800">
                        {formatPrice(Math.round(property.price / property.sqft))}
                      </div>
                    </div>
                  </div>
                )}
                {property.mlsNumber && (
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">MLS #</div>
                      <div className="font-medium text-gray-800">{property.mlsNumber}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schools */}
            {property.schools && property.schools.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Nearby Schools</h2>
                <div className="space-y-3">
                  {property.schools.map((school, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-800">{school.name}</div>
                          <div className="text-sm text-gray-500">{school.type} • {school.distance}</div>
                        </div>
                      </div>
                      {school.rating > 0 && (
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {school.rating}/10
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price History */}
            {property.priceHistory && property.priceHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Price History</h2>
                <div className="space-y-3">
                  {property.priceHistory.map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div>
                        <div className="font-medium text-gray-800">{history.event}</div>
                        <div className="text-sm text-gray-500">{history.date}</div>
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        {formatPrice(history.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Listing Agent */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Listing Agent</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                  {property.listingAgent?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {property.listingAgent?.name || 'Contact Agent'}
                  </div>
                  {property.listingAgent?.brokerage && (
                    <div className="text-sm text-gray-500">{property.listingAgent.brokerage}</div>
                  )}
                </div>
              </div>
              
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium mb-3">
                <Phone className="w-5 h-5" />
                Call Agent
              </button>
              <button className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 font-medium">
                <Mail className="w-5 h-5" />
                Send Message
              </button>
            </div>

            {/* Request Tour */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Schedule a Tour</h3>
              <p className="text-blue-100 text-sm mb-4">
                See this property in person. Schedule a tour with the listing agent.
              </p>
              <button className="w-full py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
                Request Tour
              </button>
            </div>

            {/* Mortgage Calculator Quick View */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Estimated Payment</h3>
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {formatPrice(Math.round(property.price * 0.006))}
                <span className="text-lg font-normal text-gray-500">/mo</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Based on 20% down, 6.5% APR
              </p>
              <Link
                href={`/mortgage-calculator?price=${property.price}`}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Calculate Your Payment →
              </Link>
            </div>

            {/* Valuation — the Zestimate equivalent, with the comps behind it */}
            {insight?.valuation && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold mb-1">Estimated value</h3>
                <div className="text-3xl font-bold text-blue-700">
                  {formatPrice(insight.valuation.value)}
                </div>
                {insight.valuation.rangeLow != null && insight.valuation.rangeHigh != null && (
                  <p className="text-sm text-gray-600 mt-1">
                    Range {formatPrice(insight.valuation.rangeLow)} – {formatPrice(insight.valuation.rangeHigh)}
                    {' · '}
                    <span className={
                      insight.valuation.confidence === 'high' ? 'text-green-700'
                      : insight.valuation.confidence === 'moderate' ? 'text-amber-700' : 'text-red-700'
                    }>
                      {insight.valuation.confidence} confidence
                    </span>
                  </p>
                )}
                {insight.valuation.vsAsking != null && (
                  <p className="text-sm text-gray-700 mt-2">
                    Asking price is {Math.abs(insight.valuation.vsAsking)}%{' '}
                    {insight.valuation.vsAsking >= 0 ? 'above' : 'below'} the estimate.
                  </p>
                )}
                {insight.valuation.comparables.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2">Comparable sales</h4>
                    <div className="space-y-2">
                      {insight.valuation.comparables.map((c) => (
                        <div key={c.address} className="text-sm flex justify-between border-b pb-1">
                          <span className="truncate mr-2">{c.address}</span>
                          <span className="whitespace-nowrap text-gray-700">
                            {c.price != null ? formatPrice(c.price) : '—'}
                            {c.milesAway != null ? ` · ${c.milesAway} mi` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rental yield — the investor view */}
            {insight?.rental && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold mb-1">Rental estimate</h3>
                <div className="text-2xl font-bold text-green-700">
                  {formatPrice(insight.rental.rent)}<span className="text-base font-normal">/month</span>
                </div>
                {insight.rental.grossYieldPercent != null && (
                  <p className="text-sm text-gray-700 mt-1">
                    {insight.rental.grossYieldPercent}% gross yield at the asking price
                  </p>
                )}
              </div>
            )}

            {/* Flood risk — the fact a Florida lender decides on */}
            {insight?.flood && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold mb-1">Flood risk</h3>
                <div className="flex items-center gap-2">
                  <span className={
                    'px-2 py-0.5 rounded text-sm font-semibold ' +
                    (insight.flood.risk === 'high' ? 'bg-red-100 text-red-800'
                     : insight.flood.risk === 'moderate' ? 'bg-amber-100 text-amber-800'
                     : 'bg-green-100 text-green-800')
                  }>
                    Zone {insight.flood.zone} · {insight.flood.risk}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{insight.flood.plain}</p>
                <p className="text-xs text-gray-400 mt-1">FEMA National Flood Hazard Layer</p>
              </div>
            )}

            {/* Walkability */}
            {insight?.walkability && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold mb-1">Walkability</h3>
                <div className="text-2xl font-bold text-blue-700">
                  {insight.walkability.index}
                  <span className="text-base font-normal text-gray-500">/{insight.walkability.outOf}</span>
                </div>
                <p className="text-sm text-gray-700">{insight.walkability.label}</p>
                <p className="text-xs text-gray-400 mt-1">US EPA National Walkability Index</p>
              </div>
            )}

            {/* Schools */}
            {insight && insight.schools.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold mb-3">Nearby schools</h3>
                <div className="space-y-2">
                  {insight.schools.slice(0, 6).map((sc) => (
                    <div key={sc.name} className="text-sm flex justify-between border-b pb-1">
                      <span className="truncate mr-2">{sc.name}</span>
                      <span className="text-gray-600 whitespace-nowrap">{sc.type}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">US Dept of Education, NCES</p>
              </div>
            )}

            {/* Data Source */}
            <div className="text-center text-sm text-gray-400">
              <p>Data provided by {property.source}</p>
              <p>Last updated: Today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
