// =====================================================
// CR REALTOR PLATFORM - CUSTOMER PROPERTY SEARCH
// Path: app/customer/dashboard/properties/page.tsx
// Timestamp: 2025-12-01 11:42 AM EST
// Purpose: Full MLS search with saved searches (multi-tenant)
// =====================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Building2,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Grid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  Home,
  DollarSign,
  Save,
  Bell,
  BellOff,
  Star,
  Bookmark,
  BookmarkPlus,
  Filter,
  Map,
  Clock,
  Sparkles,
  ChevronRight,
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
  description: string
  images: string[]
  features: string[]
  year_built?: number
  lot_size?: number
  days_on_market?: number
  created_at: string
  mls_number?: string
}

interface SavedSearch {
  id: string
  name: string
  description?: string
  criteria: SearchCriteria
  email_alerts: boolean
  alert_frequency: string
  new_listings_count: number
  results_count: number
  created_at: string
}

interface SharedListing {
  id: string
  property_id?: string
  mls_listing_id?: string
  agent_message?: string
  is_viewed: boolean
  created_at: string
  properties?: Property
}

interface SearchCriteria {
  cities?: string[]
  zip_codes?: string[]
  property_types?: string[]
  min_price?: number
  max_price?: number
  min_bedrooms?: number
  max_bedrooms?: number
  min_bathrooms?: number
  min_sqft?: number
  max_sqft?: number
  year_built_min?: number
  features?: string[]
  keywords?: string
  days_on_market_max?: number
}

export default function CustomerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [sharedListings, setSharedListings] = useState<SharedListing[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)
  
  // View state
  const [activeTab, setActiveTab] = useState<'search' | 'saved-searches' | 'agent-picks'>('search')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchCriteria>({})
  const [activeSavedSearch, setActiveSavedSearch] = useState<SavedSearch | null>(null)
  
  // Save search form
  const [newSearchName, setNewSearchName] = useState('')
  const [newSearchAlerts, setNewSearchAlerts] = useState(true)
  const [newSearchFrequency, setNewSearchFrequency] = useState('daily')
  
  const supabase = createClient()

  // Florida cities for dropdown (expandable)
  const floridaCities = [
    'Fort Myers', 'Cape Coral', 'Naples', 'Bonita Springs', 'Estero',
    'Lehigh Acres', 'Fort Myers Beach', 'Sanibel', 'Marco Island', 'Miami',
    'Tampa', 'Orlando', 'Jacksonville', 'Sarasota', 'St. Petersburg'
  ]

  const propertyTypes = [
    { value: 'single_family', label: 'Single Family' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'multi_family', label: 'Multi-Family' },
    { value: 'land', label: 'Land' },
    { value: 'mobile', label: 'Mobile Home' },
  ]

  const features = [
    'Pool', 'Waterfront', 'Garage', 'Gated', 'Golf Course', 
    'New Construction', 'Updated Kitchen', 'Hardwood Floors'
  ]

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get customer record
      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('id, assigned_agent_id')
        .eq('user_id', user.id)
        .single()

      if (!customer) return
      setCustomerId(customer.id)

      // Load saved searches
      const { data: searches } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (searches) setSavedSearches(searches)

      // Load agent shared listings (unviewed first)
      const { data: shared } = await supabase
        .from('agent_shared_listings')
        .select(`
          *,
          properties (*)
        `)
        .eq('customer_id', customer.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (shared) setSharedListings(shared)

      // Get saved property IDs
      const { data: savedData } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('customer_id', customer.id)

      if (savedData) {
        setSavedIds(new Set(savedData.map(s => s.property_id)))
      }

      // Load properties (for now from agent, later from MLS)
      await searchProperties({})

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Search properties with filters
  const searchProperties = async (criteria: SearchCriteria) => {
    try {
      // For now, search from properties table
      // Later this will query the mls_listings table
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')

      // Apply filters
      if (criteria.cities?.length) {
        query = query.in('city', criteria.cities)
      }
      if (criteria.zip_codes?.length) {
        query = query.in('zip_code', criteria.zip_codes)
      }
      if (criteria.property_types?.length) {
        query = query.in('property_type', criteria.property_types)
      }
      if (criteria.min_price) {
        query = query.gte('price', criteria.min_price)
      }
      if (criteria.max_price) {
        query = query.lte('price', criteria.max_price)
      }
      if (criteria.min_bedrooms) {
        query = query.gte('bedrooms', criteria.min_bedrooms)
      }
      if (criteria.min_bathrooms) {
        query = query.gte('bathrooms', criteria.min_bathrooms)
      }
      if (criteria.min_sqft) {
        query = query.gte('square_feet', criteria.min_sqft)
      }
      if (criteria.max_sqft) {
        query = query.lte('square_feet', criteria.max_sqft)
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50)

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error searching properties:', error)
    }
  }

  // Apply saved search
  const applySavedSearch = (search: SavedSearch) => {
    setActiveSavedSearch(search)
    setFilters(search.criteria)
    searchProperties(search.criteria)
    setActiveTab('search')
  }

  // Save current search
  const saveCurrentSearch = async () => {
    if (!customerId || !newSearchName.trim()) return

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          customer_id: customerId,
          name: newSearchName.trim(),
          criteria: filters,
          email_alerts: newSearchAlerts,
          alert_frequency: newSearchFrequency
        })
        .select()
        .single()

      if (error) throw error

      setSavedSearches(prev => [data, ...prev])
      setShowSaveSearchModal(false)
      setNewSearchName('')
      alert('Search saved successfully!')
    } catch (error) {
      console.error('Error saving search:', error)
      alert('Failed to save search')
    }
  }

  // Delete saved search
  const deleteSavedSearch = async (searchId: string) => {
    if (!confirm('Delete this saved search?')) return

    try {
      await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)

      setSavedSearches(prev => prev.filter(s => s.id !== searchId))
    } catch (error) {
      console.error('Error deleting search:', error)
    }
  }

  // Toggle save property
  const toggleSave = async (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!customerId) return

    const isSaved = savedIds.has(propertyId)

    try {
      if (isSaved) {
        await supabase
          .from('saved_properties')
          .delete()
          .eq('customer_id', customerId)
          .eq('property_id', propertyId)

        setSavedIds(prev => {
          const next = new Set(prev)
          next.delete(propertyId)
          return next
        })
      } else {
        await supabase
          .from('saved_properties')
          .insert({ customer_id: customerId, property_id: propertyId })

        setSavedIds(prev => new Set([...prev, propertyId]))
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setActiveSavedSearch(null)
    searchProperties({})
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  // Apply filters when they change
  useEffect(() => {
    if (!loading) {
      searchProperties(filters)
    }
  }, [filters])

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const val = filters[key as keyof SearchCriteria]
    return Array.isArray(val) ? val.length > 0 : val !== undefined
  })

  const unviewedSharedCount = sharedListings.filter(s => !s.is_viewed).length

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Property Search</h1>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-3 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'search'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="h-4 w-4 inline mr-2" />
          Search All
        </button>
        <button
          onClick={() => setActiveTab('saved-searches')}
          className={`px-4 py-3 font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === 'saved-searches'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Saved Searches
          {savedSearches.length > 0 && (
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {savedSearches.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('agent-picks')}
          className={`px-4 py-3 font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === 'agent-picks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Agent Picks
          {unviewedSharedCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {unviewedSharedCount} new
            </span>
          )}
        </button>
      </div>

      {/* Search Tab Content */}
      {activeTab === 'search' && (
        <>
          {/* Active Saved Search Banner */}
          {activeSavedSearch && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Viewing results for: <strong>{activeSavedSearch.name}</strong>
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear
              </button>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by address, city, zip, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filters</span>
              </button>

              {/* Save Search Button */}
              {hasActiveFilters && (
                <button
                  onClick={() => setShowSaveSearchModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <BookmarkPlus className="h-5 w-5" />
                  <span>Save Search</span>
                </button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                {/* Row 1: Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cities</label>
                    <select
                      multiple
                      value={filters.cities || []}
                      onChange={(e) => setFilters({
                        ...filters,
                        cities: Array.from(e.target.selectedOptions, o => o.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    >
                      {floridaCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>

                  {/* Property Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                      multiple
                      value={filters.property_types || []}
                      onChange={(e) => setFilters({
                        ...filters,
                        property_types: Array.from(e.target.selectedOptions, o => o.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Zip Codes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Codes</label>
                    <input
                      type="text"
                      placeholder="33901, 33902, 33903..."
                      value={filters.zip_codes?.join(', ') || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        zip_codes: e.target.value.split(',').map(z => z.trim()).filter(Boolean)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Row 2: Price & Specs */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="$0"
                      value={filters.min_price || ''}
                      onChange={(e) => setFilters({...filters, min_price: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={filters.max_price || ''}
                      onChange={(e) => setFilters({...filters, max_price: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beds (min)</label>
                    <select
                      value={filters.min_bedrooms || ''}
                      onChange={(e) => setFilters({...filters, min_bedrooms: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Baths (min)</label>
                    <select
                      value={filters.min_bathrooms || ''}
                      onChange={(e) => setFilters({...filters, min_bathrooms: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min SqFt</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.min_sqft || ''}
                      onChange={(e) => setFilters({...filters, min_sqft: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max SqFt</label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={filters.max_sqft || ''}
                      onChange={(e) => setFilters({...filters, max_sqft: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Row 3: Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="flex flex-wrap gap-2">
                    {features.map(feature => (
                      <button
                        key={feature}
                        onClick={() => {
                          const current = filters.features || []
                          const updated = current.includes(feature)
                            ? current.filter(f => f !== feature)
                            : [...current, feature]
                          setFilters({...filters, features: updated})
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          (filters.features || []).includes(feature)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <strong>{properties.length}</strong> properties
            </p>
          </div>

          {/* Properties Grid */}
          {properties.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or search criteria.
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700 font-medium">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSaved={savedIds.has(property.id)}
                  onToggleSave={toggleSave}
                  viewMode={viewMode}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Saved Searches Tab */}
      {activeTab === 'saved-searches' && (
        <div className="space-y-4">
          {savedSearches.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved searches yet</h3>
              <p className="text-gray-500 mb-4">
                Search for properties and click "Save Search" to get notified of new listings.
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700"
              >
                Start Searching
              </button>
            </div>
          ) : (
            savedSearches.map((search) => (
              <div
                key={search.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{search.name}</h3>
                      {search.new_listings_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {search.new_listings_count} new
                        </span>
                      )}
                    </div>
                    
                    {/* Criteria Summary */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {search.criteria.cities?.map(city => (
                        <span key={city} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {city}
                        </span>
                      ))}
                      {search.criteria.min_price && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          ${(search.criteria.min_price / 1000).toFixed(0)}k+
                        </span>
                      )}
                      {search.criteria.max_price && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          Max ${(search.criteria.max_price / 1000).toFixed(0)}k
                        </span>
                      )}
                      {search.criteria.min_bedrooms && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {search.criteria.min_bedrooms}+ beds
                        </span>
                      )}
                    </div>

                    {/* Alert Status */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {search.email_alerts ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Bell className="h-4 w-4" />
                          {search.alert_frequency} alerts
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <BellOff className="h-4 w-4" />
                          Alerts off
                        </span>
                      )}
                      <span>{search.results_count} matching</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => applySavedSearch(search)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      View Results
                    </button>
                    <button
                      onClick={() => deleteSavedSearch(search.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Agent Picks Tab */}
      {activeTab === 'agent-picks' && (
        <div className="space-y-4">
          {sharedListings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No agent picks yet</h3>
              <p className="text-gray-500">
                Your agent will share recommended properties here.
              </p>
            </div>
          ) : (
            sharedListings.map((shared) => {
              const property = shared.properties
              if (!property) return null

              return (
                <div
                  key={shared.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-sm border transition-shadow ${
                    !shared.is_viewed ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
                  }`}
                >
                  {/* Agent Message */}
                  {shared.agent_message && (
                    <div className="bg-green-50 border-b border-green-100 px-5 py-3">
                      <p className="text-sm text-green-800">
                        <strong>Your agent says:</strong> "{shared.agent_message}"
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-gray-200">
                      {property.images?.[0] ? (
                        <img src={property.images[0]} alt={property.address} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      {!shared.is_viewed && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{property.address}</h3>
                          <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                        </div>
                        <span className="text-xl font-bold text-blue-600">{formatPrice(property.price)}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 my-3">
                        <span><Bed className="h-4 w-4 inline mr-1" />{property.bedrooms} beds</span>
                        <span><Bath className="h-4 w-4 inline mr-1" />{property.bathrooms} baths</span>
                        {property.square_feet && (
                          <span><Square className="h-4 w-4 inline mr-1" />{property.square_feet.toLocaleString()} sqft</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <Link
                          href={`/customer/dashboard/properties/${property.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={(e) => toggleSave(property.id, e)}
                          className={`p-2 rounded-lg transition-colors ${
                            savedIds.has(property.id)
                              ? 'bg-pink-100 text-pink-600'
                              : 'bg-gray-100 text-gray-600 hover:text-pink-600'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${savedIds.has(property.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveSearchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save This Search</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                <input
                  type="text"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="e.g., Beach Condos, Family Homes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="email-alerts"
                  checked={newSearchAlerts}
                  onChange={(e) => setNewSearchAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="email-alerts" className="text-sm text-gray-700">
                  Email me when new listings match
                </label>
              </div>

              {newSearchAlerts && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Frequency</label>
                  <select
                    value={newSearchFrequency}
                    onChange={(e) => setNewSearchFrequency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowSaveSearchModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentSearch}
                disabled={!newSearchName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Property Card Component
function PropertyCard({
  property,
  isSaved,
  onToggleSave,
  viewMode,
  formatPrice
}: {
  property: Property
  isSaved: boolean
  onToggleSave: (id: string, e: React.MouseEvent) => void
  viewMode: 'grid' | 'list'
  formatPrice: (price: number) => string
}) {
  if (viewMode === 'list') {
    return (
      <Link
        href={`/customer/dashboard/properties/${property.id}`}
        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex"
      >
        <div className="relative w-48 flex-shrink-0 bg-gray-200">
          {property.images?.[0] ? (
            <img src={property.images[0]} alt={property.address} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <button
            onClick={(e) => onToggleSave(property.id, e)}
            className={`absolute top-2 right-2 p-1.5 rounded-full ${
              isSaved ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{property.address}</h3>
              <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
            </div>
            <span className="text-lg font-bold text-blue-600">{formatPrice(property.price)}</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span><Bed className="h-4 w-4 inline mr-1" />{property.bedrooms}</span>
            <span><Bath className="h-4 w-4 inline mr-1" />{property.bathrooms}</span>
            {property.square_feet && <span><Square className="h-4 w-4 inline mr-1" />{property.square_feet.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/customer/dashboard/properties/${property.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow group"
    >
      <div className="relative h-48 bg-gray-200">
        {property.images?.[0] ? (
          <img src={property.images[0]} alt={property.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <button
          onClick={(e) => onToggleSave(property.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isSaved ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-600 hover:text-pink-500'
          }`}
        >
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-lg font-bold text-gray-900 shadow-sm">
          {formatPrice(property.price)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{property.address}</h3>
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {property.city}, {property.state}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.bathrooms}</span>
          {property.square_feet && <span className="flex items-center gap-1"><Square className="h-4 w-4" />{property.square_feet.toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  )
}
