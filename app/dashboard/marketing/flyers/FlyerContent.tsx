'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ChevronRight,
  FileText,
  Download,
  Eye,
  Loader2,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Check,
  Sparkles,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  description: string
  photos: string[]
  features: string[]
}

export default function FlyerContent() {
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('property')
  const supabase = createClient()

  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [template, setTemplate] = useState('modern')
  const [generating, setGenerating] = useState(false)
  const [flyerUrl, setFlyerUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperties() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      setProperties(data || [])

      if (propertyId && data) {
        const prop = data.find(p => p.id === propertyId)
        if (prop) setSelectedProperty(prop)
      }

      setLoading(false)
    }
    loadProperties()
  }, [propertyId, supabase])

  const templates = [
    { id: 'modern', name: 'Modern', desc: 'Clean, minimal design' },
    { id: 'luxury', name: 'Luxury', desc: 'Elegant gold accents' },
    { id: 'classic', name: 'Classic', desc: 'Traditional layout' },
    { id: 'bold', name: 'Bold', desc: 'High contrast colors' },
  ]

  const generateFlyer = async () => {
    if (!selectedProperty) return
    setGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setFlyerUrl(`/api/flyers/generate?property=${selectedProperty.id}&template=${template}`)
    setGenerating(false)
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`
    return `$${(price / 1000).toFixed(0)}K`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/dashboard/marketing" className="hover:text-blue-600">Marketing</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Flyer Generator</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Listing Flyer</h1>
        <p className="text-gray-500">Generate professional PDF flyers for your listings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Select Property</h2>
            
            {selectedProperty ? (
              <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {selectedProperty.photos?.[0] ? (
                    <img src={selectedProperty.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{selectedProperty.title}</h3>
                  <p className="text-sm text-gray-500">{selectedProperty.city}, {selectedProperty.state}</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">{formatPrice(selectedProperty.price)}</p>
                </div>
                <button onClick={() => setSelectedProperty(null)} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {properties.map(property => (
                  <button
                    key={property.id}
                    onClick={() => setSelectedProperty(property)}
                    className="w-full flex gap-3 p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition text-left"
                  >
                    <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                      {property.photos?.[0] ? (
                        <img src={property.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{property.title}</p>
                      <p className="text-xs text-gray-500">{property.city}</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600">{formatPrice(property.price)}</p>
                  </button>
                ))}
                {properties.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No active listings</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Choose Template</h2>
            <div className="grid grid-cols-2 gap-3">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    template === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{t.name}</span>
                    {template === t.id && <Check className="w-5 h-5 text-blue-600" />}
                  </div>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateFlyer}
            disabled={!selectedProperty || generating}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="w-5 h-5" />Generate Flyer</>
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
          
          {selectedProperty ? (
            <div className={`aspect-[8.5/11] rounded-lg overflow-hidden border ${
              template === 'luxury' ? 'bg-gray-900' : template === 'bold' ? 'bg-blue-900' : 'bg-white'
            }`}>
              <div className="h-full flex flex-col">
                <div className="h-1/2 relative">
                  {selectedProperty.photos?.[0] ? (
                    <img src={selectedProperty.photos[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 left-0 right-0 p-4 ${
                    template === 'luxury' ? 'bg-gradient-to-t from-black/80' :
                    template === 'bold' ? 'bg-blue-600' : 'bg-gradient-to-t from-black/60'
                  }`}>
                    <p className={`text-2xl font-bold ${template === 'luxury' ? 'text-amber-400' : 'text-white'}`}>
                      {formatPrice(selectedProperty.price)}
                    </p>
                  </div>
                </div>
                <div className={`flex-1 p-4 ${
                  template === 'luxury' ? 'text-white' : template === 'bold' ? 'text-white' : 'text-gray-900'
                }`}>
                  <h3 className={`font-bold text-lg mb-2 ${template === 'luxury' ? 'text-amber-400' : ''}`}>
                    {selectedProperty.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm opacity-80 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedProperty.address || `${selectedProperty.city}, ${selectedProperty.state}`}</span>
                  </div>
                  <div className="flex gap-4 text-sm mb-3">
                    {selectedProperty.bedrooms && <div className="flex items-center gap-1"><Bed className="w-4 h-4" /><span>{selectedProperty.bedrooms} Beds</span></div>}
                    {selectedProperty.bathrooms && <div className="flex items-center gap-1"><Bath className="w-4 h-4" /><span>{selectedProperty.bathrooms} Baths</span></div>}
                    {selectedProperty.square_feet && <div className="flex items-center gap-1"><Square className="w-4 h-4" /><span>{selectedProperty.square_feet.toLocaleString()} sqft</span></div>}
                  </div>
                  <p className="text-xs opacity-70 line-clamp-3">{selectedProperty.description || 'Beautiful property in a prime location.'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[8.5/11] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <p>Select a property to preview</p>
              </div>
            </div>
          )}

          {flyerUrl && (
            <div className="mt-4 flex gap-2">
              <a href={flyerUrl} target="_blank" className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />Preview PDF
              </a>
              <a href={flyerUrl} download className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
