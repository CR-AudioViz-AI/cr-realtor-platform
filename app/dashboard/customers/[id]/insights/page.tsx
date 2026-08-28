// =====================================================
// CR REALTOR PLATFORM - CUSTOMER INSIGHTS PAGE
// Path: app/dashboard/customers/[id]/insights/page.tsx
// Timestamp: 2025-12-01 12:36 PM EST
// Purpose: Agent views customer's saved searches, favorites, notes, activity
// =====================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  User,
  Heart,
  Search,
  FileText,
  MessageSquare,
  Eye,
  EyeOff,
  Home,
  Bed,
  Bath,
  Square,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Bookmark,
  Bell,
  BellOff,
  Send,
  CheckCircle,
  Calendar,
  TrendingUp,
  Activity,
  Sparkles,
  StickyNote,
  Filter,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface Customer {
  id: string
  full_name: string
  email: string
  phone: string
  budget_min: number
  budget_max: number
  bedroom_preference: number
  bathroom_preference: number
  property_type_preference: string
  city: string
  state: string
  notes: string
  status: string
  created_at: string
  last_login: string
  login_count: number
}

interface SavedProperty {
  id: string
  property_id: string
  notes: string
  rating: number
  created_at: string
  properties: {
    id: string
    address: string
    city: string
    state: string
    price: number
    bedrooms: number
    bathrooms: number
    square_feet: number
    images: string[]
    status: string
  }
}

interface SavedSearch {
  id: string
  name: string
  description: string
  criteria: {
    cities?: string[]
    zip_codes?: string[]
    property_types?: string[]
    min_price?: number
    max_price?: number
    min_bedrooms?: number
    min_bathrooms?: number
    min_sqft?: number
    max_sqft?: number
    features?: string[]
  }
  email_alerts: boolean
  alert_frequency: string
  new_listings_count: number
  results_count: number
  created_at: string
  last_viewed_at: string
}

interface SharedListing {
  id: string
  property_id: string
  agent_message: string
  is_viewed: boolean
  viewed_at: string
  is_favorited: boolean
  customer_notes: string
  customer_rating: number
  created_at: string
  properties: {
    id: string
    address: string
    city: string
    price: number
    bedrooms: number
    bathrooms: number
    images: string[]
  }
}

export default function CustomerInsightsPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [sharedListings, setSharedListings] = useState<SharedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'searches' | 'shared'>('overview')
  
  const supabase = createClient()

  // Load all customer data
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load customer details
      const { data: custData, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('assigned_agent_id', user.id)
        .single()

      if (custError || !custData) {
        router.push('/dashboard/customers')
        return
      }
      setCustomer(custData)

      // Load saved properties with property details
      const { data: savedPropsData } = await supabase
        .from('saved_properties')
        .select(`
          *,
          properties (
            id, address, city, state, price, bedrooms, bathrooms, square_feet, images, status
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (savedPropsData) setSavedProperties(savedPropsData as unknown as SavedProperty[])

      // Load saved searches
      const { data: searchesData } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (searchesData) setSavedSearches(searchesData)

      // Load agent's shared listings for this customer
      const { data: sharedData } = await supabase
        .from('agent_shared_listings')
        .select(`
          *,
          properties (
            id, address, city, price, bedrooms, bathrooms, images
          )
        `)
        .eq('customer_id', customerId)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })

      if (sharedData) setSharedListings(sharedData as unknown as SharedListing[])

    } catch (error) {
      console.error('Error loading customer data:', error)
    } finally {
      setLoading(false)
    }
  }, [customerId, router, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Format price
  const formatPrice = (price: number) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Format date
  const formatDate = (date: string) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format relative time
  const formatRelativeTime = (date: string) => {
    if (!date) return 'Never'
    const now = new Date()
    const then = new Date(date)
    const diffDays = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return formatDate(date)
  }

  // Stats
  const viewedSharedCount = sharedListings.filter(s => s.is_viewed).length
  const favoritedSharedCount = sharedListings.filter(s => s.is_favorited).length
  const propertiesWithNotes = savedProperties.filter(p => p.notes).length
  const propertiesWithRating = savedProperties.filter(p => p.rating).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/customers"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{customer.full_name}</h1>
          <p className="text-gray-500">{customer.email} • {customer.phone}</p>
        </div>
        <Link
          href={`/dashboard/customers/${customerId}`}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          View Profile
        </Link>
        <Link
          href="/dashboard/messages"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Message
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{savedProperties.length}</p>
              <p className="text-xs text-gray-500">Saved Properties</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bookmark className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{savedSearches.length}</p>
              <p className="text-xs text-gray-500">Saved Searches</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sharedListings.length}</p>
              <p className="text-xs text-gray-500">You Shared</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{viewedSharedCount}/{sharedListings.length}</p>
              <p className="text-xs text-gray-500">Viewed Shares</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StickyNote className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{propertiesWithNotes}</p>
              <p className="text-xs text-gray-500">With Notes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Preferences Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          Customer Preferences
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Budget</p>
            <p className="font-medium text-gray-900">
              {formatPrice(customer.budget_min)} - {formatPrice(customer.budget_max)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Bedrooms</p>
            <p className="font-medium text-gray-900">{customer.bedroom_preference || 'Any'}+</p>
          </div>
          <div>
            <p className="text-gray-500">Bathrooms</p>
            <p className="font-medium text-gray-900">{customer.bathroom_preference || 'Any'}+</p>
          </div>
          <div>
            <p className="text-gray-500">Property Type</p>
            <p className="font-medium text-gray-900 capitalize">
              {customer.property_type_preference?.replace('_', ' ') || 'Any'}
            </p>
          </div>
        </div>
        {customer.notes && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-gray-500 text-sm">Your Notes</p>
            <p className="text-gray-700 text-sm mt-1">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'favorites', label: `Favorites (${savedProperties.length})`, icon: Heart },
            { id: 'searches', label: `Saved Searches (${savedSearches.length})`, icon: Search },
            { id: 'shared', label: `Shared by You (${sharedListings.length})`, icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Favorites */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-600" />
              Recent Favorites
            </h3>
            {savedProperties.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No saved properties yet</p>
            ) : (
              <div className="space-y-3">
                {savedProperties.slice(0, 5).map((saved) => (
                  <div key={saved.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                      {saved.properties?.images?.[0] ? (
                        <img src={saved.properties.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {saved.properties?.address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(saved.properties?.price)} • {saved.properties?.bedrooms}bd/{saved.properties?.bathrooms}ba
                      </p>
                      {saved.notes && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <StickyNote className="h-3 w-3" />
                          Has notes
                        </p>
                      )}
                    </div>
                    {saved.rating && (
                      <div className="flex items-center gap-0.5">
                        {[...Array(saved.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Saved Searches */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-blue-600" />
              Active Saved Searches
            </h3>
            {savedSearches.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No saved searches yet</p>
            ) : (
              <div className="space-y-3">
                {savedSearches.slice(0, 5).map((search) => (
                  <div key={search.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">{search.name}</p>
                      {search.email_alerts ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Bell className="h-3 w-3" /> {search.alert_frequency}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <BellOff className="h-3 w-3" /> Off
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {search.criteria?.cities?.map(city => (
                        <span key={city} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {city}
                        </span>
                      ))}
                      {search.criteria?.min_price && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          ${(search.criteria?.min_price / 1000).toFixed(0)}k+
                        </span>
                      )}
                      {search.criteria?.min_bedrooms && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {search.criteria?.min_bedrooms}+ beds
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {savedProperties.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Customer hasn't saved any properties yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {savedProperties.map((saved) => (
                <div key={saved.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-24 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      {saved.properties?.images?.[0] ? (
                        <img src={saved.properties.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{saved.properties?.address}</h4>
                          <p className="text-sm text-gray-500">
                            {saved.properties?.city}, {saved.properties?.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{formatPrice(saved.properties?.price)}</p>
                          <p className="text-xs text-gray-500">Saved {formatRelativeTime(saved.created_at)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span><Bed className="h-4 w-4 inline mr-1" />{saved.properties?.bedrooms}</span>
                        <span><Bath className="h-4 w-4 inline mr-1" />{saved.properties?.bathrooms}</span>
                        {saved.properties?.square_feet && (
                          <span><Square className="h-4 w-4 inline mr-1" />{saved.properties.square_feet.toLocaleString()}</span>
                        )}
                        {saved.rating && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-4 w-4 fill-current" />
                            {saved.rating}/5
                          </span>
                        )}
                      </div>

                      {/* Customer Notes */}
                      {saved.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                          <p className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
                            <StickyNote className="h-3 w-3" />
                            Customer's Notes:
                          </p>
                          <p className="text-sm text-yellow-900">{saved.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'searches' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {savedSearches.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Customer hasn't saved any searches yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {savedSearches.map((search) => (
                <div key={search.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{search.name}</h4>
                      {search.description && (
                        <p className="text-sm text-gray-500 mt-1">{search.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {search.email_alerts ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <Bell className="h-3 w-3" />
                          {search.alert_frequency} alerts
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          <BellOff className="h-3 w-3" />
                          Alerts off
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Search Criteria */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">SEARCH CRITERIA</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {(search.criteria?.cities?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-gray-500 text-xs">Cities</p>
                          <p className="font-medium">{search.criteria?.cities?.join(', ')}</p>
                        </div>
                      )}
                      {(search.criteria?.min_price || search.criteria?.max_price) && (
                        <div>
                          <p className="text-gray-500 text-xs">Price Range</p>
                          <p className="font-medium">
                            {search.criteria?.min_price ? formatPrice(search.criteria?.min_price) : '$0'}
                            {' - '}
                            {search.criteria?.max_price ? formatPrice(search.criteria?.max_price) : 'Any'}
                          </p>
                        </div>
                      )}
                      {search.criteria?.min_bedrooms && (
                        <div>
                          <p className="text-gray-500 text-xs">Bedrooms</p>
                          <p className="font-medium">{search.criteria?.min_bedrooms}+</p>
                        </div>
                      )}
                      {search.criteria?.min_bathrooms && (
                        <div>
                          <p className="text-gray-500 text-xs">Bathrooms</p>
                          <p className="font-medium">{search.criteria?.min_bathrooms}+</p>
                        </div>
                      )}
                      {search.criteria?.min_sqft && (
                        <div>
                          <p className="text-gray-500 text-xs">Min Sq Ft</p>
                          <p className="font-medium">{search.criteria?.min_sqft?.toLocaleString()}</p>
                        </div>
                      )}
                      {(search.criteria?.property_types?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-gray-500 text-xs">Property Types</p>
                          <p className="font-medium capitalize">
                            {search.criteria?.property_types?.map(t => t.replace('_', ' ')).join(', ')}
                          </p>
                        </div>
                      )}
                      {(search.criteria?.features?.length ?? 0) > 0 && (
                        <div className="col-span-2">
                          <p className="text-gray-500 text-xs">Features</p>
                          <p className="font-medium">{search.criteria?.features?.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Created {formatDate(search.created_at)}</span>
                    <span>Last viewed {formatRelativeTime(search.last_viewed_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'shared' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {sharedListings.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven't shared any properties with this customer yet</p>
              <Link
                href="/dashboard/share-listings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
                Share a Property
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sharedListings.map((shared) => (
                <div key={shared.id} className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-20 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      {shared.properties?.images?.[0] ? (
                        <img src={shared.properties.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{shared.properties?.address}</h4>
                          <p className="text-sm text-gray-500">
                            {formatPrice(shared.properties?.price)} • {shared.properties?.bedrooms}bd/{shared.properties?.bathrooms}ba
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {shared.is_viewed ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              <Eye className="h-3 w-3" /> Viewed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              <EyeOff className="h-3 w-3" /> Not viewed
                            </span>
                          )}
                          {shared.is_favorited && (
                            <span className="inline-flex items-center gap-1 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                              <Heart className="h-3 w-3" /> Favorited
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Your message */}
                      {shared.agent_message && (
                        <div className="mt-2 p-2 bg-purple-50 rounded text-sm text-purple-800">
                          <span className="font-medium">Your message:</span> {shared.agent_message}
                        </div>
                      )}

                      {/* Customer feedback */}
                      {(shared.customer_notes || shared.customer_rating) && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          {shared.customer_rating && (
                            <div className="flex items-center gap-1 text-yellow-600 mb-1">
                              {[...Array(shared.customer_rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">Customer rating</span>
                            </div>
                          )}
                          {shared.customer_notes && (
                            <p className="text-blue-800">
                              <span className="font-medium">Customer notes:</span> {shared.customer_notes}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Shared {formatRelativeTime(shared.created_at)}
                        {shared.viewed_at && ` • Viewed ${formatRelativeTime(shared.viewed_at)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

