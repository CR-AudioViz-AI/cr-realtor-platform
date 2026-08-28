// =====================================================
// CR REALTOR PLATFORM - CUSTOMER FAVORITES PAGE
// Path: app/customer/dashboard/favorites/page.tsx
// Timestamp: 2025-12-01 11:32 AM EST
// Purpose: Customer's saved/favorite properties (multi-tenant)
// =====================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Home,
  Trash2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface SavedProperty {
  id: string
  property_id: string
  created_at: string
  notes?: string
  properties: {
    id: string
    address: string
    city: string
    state: string
    zip_code: string
    price: number
    bedrooms: number
    bathrooms: number
    square_feet: number
    property_type: string
    status: string
    images: string[]
  }
}

export default function CustomerFavoritesPage() {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const supabase = createClient()

  // Load saved properties
  const loadSavedProperties = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get customer record
      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!customer) return
      setCustomerId(customer.id)

      // Get saved properties with property details
      const { data, error } = await supabase
        .from('saved_properties')
        .select(`
          id,
          property_id,
          created_at,
          notes,
          properties (
            id,
            address,
            city,
            state,
            zip_code,
            price,
            bedrooms,
            bathrooms,
            square_feet,
            property_type,
            status,
            images
          )
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedProperties((data as unknown as SavedProperty[]) || [])
    } catch (error) {
      console.error('Error loading saved properties:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadSavedProperties()
  }, [loadSavedProperties])

  // Remove from saved
  const removeSaved = async (savedId: string) => {
    if (!confirm('Remove this property from your saved list?')) return

    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('id', savedId)

      if (error) throw error
      
      setSavedProperties(prev => prev.filter(p => p.id !== savedId))
    } catch (error) {
      console.error('Error removing saved property:', error)
      alert('Failed to remove property')
    }
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-pink-500" />
        <h1 className="text-2xl font-bold text-gray-900">Saved Homes</h1>
        <span className="bg-pink-100 text-pink-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {savedProperties.length}
        </span>
      </div>

      {/* Saved Properties */}
      {savedProperties.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-10 w-10 text-pink-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved homes yet</h3>
          <p className="text-gray-500 mb-6">
            Start browsing properties and click the heart icon to save your favorites.
          </p>
          <Link
            href="/customer/dashboard/properties"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {savedProperties.map((saved) => {
            const property = saved.properties
            if (!property) return null

            return (
              <div
                key={saved.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0 bg-gray-200">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.address}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      property.status === 'active'
                        ? 'bg-green-500 text-white'
                        : property.status === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {property.status === 'active' ? 'Active' : 
                       property.status === 'pending' ? 'Pending' : 'Sold'}
                    </div>

                    {/* Saved Heart */}
                    <div className="absolute top-3 right-3 bg-pink-500 p-2 rounded-full">
                      <Heart className="h-4 w-4 text-white fill-current" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link 
                          href={`/customer/dashboard/properties/${property.id}`}
                          className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors"
                        >
                          {property.address}
                        </Link>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {property.city}, {property.state} {property.zip_code}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(property.price)}
                      </span>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 my-4">
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {property.bedrooms} beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {property.bathrooms} baths
                      </span>
                      {property.square_feet && (
                        <span className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          {property.square_feet.toLocaleString()} sqft
                        </span>
                      )}
                    </div>

                    {/* Saved Date */}
                    <p className="text-xs text-gray-400 mb-4">
                      Saved on {formatDate(saved.created_at)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <Link
                        href={`/customer/dashboard/properties/${property.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Details
                      </Link>
                      <Link
                        href={`/customer/dashboard/messages?property=${property.id}`}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Ask About This
                      </Link>
                      <button
                        onClick={() => removeSaved(saved.id)}
                        className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Tip */}
      {savedProperties.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Ready to take the next step?</p>
            <p className="text-sm text-blue-600 mt-1">
              Click "Ask About This" on any property to message your agent directly about scheduling a showing or getting more information.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
