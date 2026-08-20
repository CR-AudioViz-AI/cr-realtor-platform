'use client'
// 2026-08-20: was a SERVER component gating on a cookie-based getUser(), always
// null, then a redirect() that renders blank. No agent has ever opened a property
// detail page.
//
// It also selected the property BY ID ALONE with no ownership check, so repairing
// the auth would have let any signed-in agent read any property on the platform by
// changing the id in the URL. /api/me/properties/[id] filters on agent_id as part
// of the query, and returns 404 rather than 403 so the id cannot be used to probe
// which listings exist.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Edit, MapPin, Bed, Bath, Square, Calendar, DollarSign,
  Home, Building2, Thermometer, Droplets, Car, Trees, CheckCircle, Share2
} from 'lucide-react'
import dynamic from 'next/dynamic'


// Dynamic imports for client components
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), { ssr: false })
const WeatherWidget = dynamic(() => import('@/components/WeatherWidget'), { ssr: false })
const NeighborhoodData = dynamic(() => import('@/components/NeighborhoodData'), { ssr: false })
const NearbySchools = dynamic(() => import('@/components/NearbySchools'), { ssr: false })
const SocialShare = dynamic(() => import('@/components/SocialShare'), { ssr: false })
const QRCodeGenerator = dynamic(() => import('@/components/QRCodeGenerator'), { ssr: false })

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setState('missing'); return }
        const res = await fetch(`/api/me/properties/${params.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setState('missing'); return }
        const d = await res.json()
        if (!live) return
        setProperty(d.property)
        setProfile(d.profile)
        setState('ready')
      } catch {
        if (live) setState('missing')   // fail closed
      }
    })()
    return () => { live = false }
  }, [params.id])

  if (state === 'loading') {
    return <div className="p-6"><div className="animate-pulse text-gray-500">Loading property…</div></div>
  }
  if (state === 'missing' || !property) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Property not found</h1>
        <p className="text-gray-500 text-sm">
          It may have been removed, or it belongs to another agent.
        </p>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const propertyUrl = `https://javarikeys.com/listing/${params.id}`
  const shareTitle = property.title || property.address
  const shareDescription = `${property.bedrooms} bed, ${property.bathrooms} bath • ${property.sqft?.toLocaleString()} sqft in ${property.city}, ${property.state}`

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link href="/dashboard/properties" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft size={20} /> Back to Properties
          </Link>
          <h1 className="text-2xl font-bold">{property.title || property.address}</h1>
          <p className="text-gray-600 flex items-center gap-1 mt-1">
            <MapPin size={16} /> {property.address}, {property.city}, {property.state} {property.zip_code}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/properties/${params.id}/edit`}>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Edit size={18} /> Edit
            </button>
          </Link>
        </div>
      </div>

      {/* Price & Status Bar */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-green-600">
              {property.listing_type === 'for_rent' || property.listing_type === 'for_lease'
                ? `${formatPrice(property.rent_amount || 0)}/mo`
                : formatPrice(property.price || 0)}
            </p>
            {property.sqft && (
              <p className="text-gray-500 text-sm">{formatPrice(Math.round(property.price / property.sqft))}/sqft</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              property.status === 'active' ? 'bg-green-100 text-green-800' :
              property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {property.listing_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
            {property.mls_id && (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                MLS# {property.mls_id}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Stats */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-4">Property Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.bedrooms && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Bed className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="text-sm text-gray-500">Bedrooms</p><p className="font-semibold">{property.bedrooms}</p></div>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg"><Bath className="w-5 h-5 text-purple-600" /></div>
                  <div><p className="text-sm text-gray-500">Bathrooms</p><p className="font-semibold">{property.bathrooms}</p></div>
                </div>
              )}
              {property.sqft && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg"><Square className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-sm text-gray-500">Sq Ft</p><p className="font-semibold">{property.sqft.toLocaleString()}</p></div>
                </div>
              )}
              {property.year_built && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg"><Calendar className="w-5 h-5 text-amber-600" /></div>
                  <div><p className="text-sm text-gray-500">Year Built</p><p className="font-semibold">{property.year_built}</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          {property.latitude && property.longitude && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Location</h2>
              </div>
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                address={property.address}
                price={property.price}
                height="350px"
              />
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Property Details */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.property_type && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium">{property.property_type?.replace('_', ' ')}</span>
                </div>
              )}
              {property.lot_size && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Lot Size</span>
                  <span className="font-medium">{property.lot_size} acres</span>
                </div>
              )}
              {property.garage_spaces && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Garage</span>
                  <span className="font-medium">{property.garage_spaces} spaces</span>
                </div>
              )}
              {property.stories && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Stories</span>
                  <span className="font-medium">{property.stories}</span>
                </div>
              )}
              {property.construction && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Construction</span>
                  <span className="font-medium">{property.construction}</span>
                </div>
              )}
              {property.cooling && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Cooling</span>
                  <span className="font-medium">{property.cooling}</span>
                </div>
              )}
              {property.heating && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Heating</span>
                  <span className="font-medium">{property.heating}</span>
                </div>
              )}
              {property.hoa_fee && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">HOA Fee</span>
                  <span className="font-medium">{formatPrice(property.hoa_fee)}/{property.hoa_frequency || 'month'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          {(property.exterior_features?.length > 0 || property.interior_features?.length > 0 || property.appliances?.length > 0) && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-4">Features & Amenities</h2>
              {property.exterior_features?.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Exterior</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.exterior_features.map((f: string) => (
                      <span key={f} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <CheckCircle size={14} /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {property.interior_features?.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Interior</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.interior_features.map((f: string) => (
                      <span key={f} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                        <CheckCircle size={14} /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {property.appliances?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Appliances</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.appliances.map((f: string) => (
                      <span key={f} className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                        <CheckCircle size={14} /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Neighborhood Data */}
          {property.latitude && property.longitude && (
            <NeighborhoodData latitude={property.latitude} longitude={property.longitude} />
          )}

          {/* Nearby Schools */}
          {property.latitude && property.longitude && (
            <NearbySchools latitude={property.latitude} longitude={property.longitude} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather for Open House Planning */}
          {property.latitude && property.longitude && (
            <WeatherWidget latitude={property.latitude} longitude={property.longitude} />
          )}

          {/* Share Listing */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Share2 size={18} /> Share Listing
            </h3>
            <SocialShare
              url={propertyUrl}
              title={shareTitle}
              description={shareDescription}
              price={property.price}
            />
          </div>

          {/* QR Code */}
          <QRCodeGenerator
            url={propertyUrl}
            title="Scan to View Listing"
          />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href={`/dashboard/properties/${params.id}/edit`} className="block">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Edit size={18} /> Edit Property
                </button>
              </Link>
              <Link href={`/dashboard/calendar?property=${params.id}`} className="block">
                <button className="w-full flex items-center justify-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50">
                  Schedule Showing
                </button>
              </Link>
              <Link href={`/dashboard/transactions?property=${params.id}`} className="block">
                <button className="w-full flex items-center justify-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50">
                  Start Transaction
                </button>
              </Link>
            </div>
          </div>

          {/* Listing Info */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p>Listed: {formatDate(property.created_at)}</p>
            {property.updated_at && property.updated_at !== property.created_at && (
              <p>Updated: {formatDate(property.updated_at)}</p>
            )}
            <p className="mt-2">Agent: {profile?.full_name || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
