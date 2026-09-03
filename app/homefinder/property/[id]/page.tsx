// 2026-09-04: the /homefinder/* links pointed at routes that were never built.
// Every one of them exists WITHOUT the prefix, so this was a path error rather
// than missing pages: search, agents, mortgage, properties, market-report, team.
//
// Found by Javari Verify on javarimanage.com, javarimortgage.com, javariproperty.com
// and zoyzy.com - four domains this app serves that had never been scanned until
// today, because the sweep list covered 63 of 110 live domains.
//
// Sell and Home Value both point at /market-report: there is no dedicated seller
// funnel, and a seller asking either question wants the same page. Every target was
// confirmed to exist first - a link repointed at another 404 is the same defect
// wearing a different path.
// app/homefinder/property/[id]/page.tsx
// HomeFinder Property Detail with Lead Capture

import Link from 'next/link'
import { Home, MapPin, Bed, Bath, Square, Heart, Share2, Calendar, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  primary_photo?: string
  description?: string
  status: string
  property_type?: string
  year_built?: number
  features?: string[]
  listing_date?: string
  realtor_id?: string
  social_impact_type?: string
}
import LeadCaptureForm from '@/components/LeadCaptureForm'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export default async function HomeFinderPropertyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: propertyData } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()
  
  const property = propertyData as any

  if (!property) {
    return <div>Property not found</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/homefinder" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">HomeFinder<span className="text-emerald-600">AI</span></span>
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-emerald-600 font-medium">← Back to Search</Link>
          </div>
        </div>
      </nav>

      {/* Property Images */}
      <section className="bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="relative h-96 bg-gray-800 rounded-xl overflow-hidden">
            {property.primary_photo ? (
              <img src={property.primary_photo} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-32 h-32 text-gray-600" />
              </div>
            )}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                <Heart className="w-6 h-6 text-gray-700" />
              </button>
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                <Share2 className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Price & Address */}
            <div className="mb-8">
              <div className="text-4xl font-bold text-gray-900 mb-4">
                ${property.price?.toLocaleString()}
              </div>
              <div className="flex items-center text-xl text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{property.address}, {property.city}, {property.state} {property.zip_code}</span>
              </div>
              <div className="flex items-center space-x-6 text-lg text-gray-700">
                <div className="flex items-center">
                  <Bed className="w-5 h-5 mr-2" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-5 h-5 mr-2" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <Square className="w-5 h-5 mr-2" />
                  <span>{property.square_feet?.toLocaleString()} sqft</span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-gray-50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Property Type</div>
                  <div className="font-semibold capitalize">{property.property_type?.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Year Built</div>
                  <div className="font-semibold">{property.year_built || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Lot Size</div>
                  <div className="font-semibold">{property.lot_size || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="font-semibold capitalize">{property.status}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">About This Home</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {property.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Lead Capture */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-2xl p-6 sticky top-24">
              <h3 className="text-2xl font-bold mb-2">Interested in this home?</h3>
              <p className="text-gray-600 mb-6">Connect with a local expert agent</p>
              
              <LeadCaptureForm propertyId={property.id} propertyAddress={`${property.address}, ${property.city}`} />

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <button className="flex-1 mr-2 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Tour
                  </button>
                  <button className="flex-1 ml-2 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Ask Question
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">Response time: Under 2 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 HomeFinder AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
