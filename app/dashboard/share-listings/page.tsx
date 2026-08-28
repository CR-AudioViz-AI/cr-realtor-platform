// =====================================================
// CR REALTOR PLATFORM - AGENT SHARE LISTINGS PAGE
// Path: app/dashboard/share-listings/page.tsx
// Timestamp: 2025-12-01 12:30 PM EST
// Purpose: Agents share properties with their customers
// =====================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Send,
  Search,
  Home,
  Users,
  Check,
  X,
  Bed,
  Bath,
  Square,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
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
  photos?: { url: string }[]
  created_at: string
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
  status: string
}

interface SharedListing {
  id: string
  customer_id: string
  property_id: string
  agent_message: string
  is_viewed: boolean
  created_at: string
}

export default function ShareListingsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sharedListings, setSharedListings] = useState<SharedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [agentId, setAgentId] = useState<string | null>(null)
  
  // Selection state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [agentMessage, setAgentMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Filter state
  const [propertySearch, setPropertySearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showSharedHistory, setShowSharedHistory] = useState(false)
  
  const supabase = createClient()

  // Load data
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setAgentId(user.id)

      // Load agent's properties
      const { data: propsData } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (propsData) setProperties(propsData)

      // Load agent's customers
      const { data: custData } = await supabase
        .from('realtor_customers')
        .select('*')
        .eq('assigned_agent_id', user.id)
        .eq('status', 'active')
        .order('full_name', { ascending: true })

      if (custData) setCustomers(custData)

      // Load shared listings history
      const { data: sharedData } = await supabase
        .from('agent_shared_listings')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (sharedData) setSharedListings(sharedData)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter properties
  const filteredProperties = properties.filter(p => {
    if (!propertySearch) return true
    const search = propertySearch.toLowerCase()
    return (
      p.address?.toLowerCase().includes(search) ||
      p.city?.toLowerCase().includes(search) ||
      p.zip_code?.includes(search)
    )
  })

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true
    const search = customerSearch.toLowerCase()
    return (
      c.full_name?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search)
    )
  })

  // Check if property already shared with customer
  const isAlreadyShared = (customerId: string, propertyId: string) => {
    return sharedListings.some(
      s => s.customer_id === customerId && s.property_id === propertyId
    )
  }

  // Toggle customer selection
  const toggleCustomer = (customerId: string) => {
    if (!selectedProperty) return
    
    // Don't allow selecting if already shared
    if (isAlreadyShared(customerId, selectedProperty.id)) return
    
    setSelectedCustomers(prev => {
      const next = new Set(prev)
      if (next.has(customerId)) {
        next.delete(customerId)
      } else {
        next.add(customerId)
      }
      return next
    })
  }

  // Select all eligible customers
  const selectAllCustomers = () => {
    if (!selectedProperty) return
    const eligible = filteredCustomers.filter(
      c => !isAlreadyShared(c.id, selectedProperty.id)
    )
    setSelectedCustomers(new Set(eligible.map(c => c.id)))
  }

  // Share property with selected customers
  const shareProperty = async () => {
    if (!selectedProperty || selectedCustomers.size === 0 || !agentId) return
    
    setSending(true)
    setSuccess(false)
    
    try {
      // Create shared listing records
      const records = Array.from(selectedCustomers).map(customerId => ({
        agent_id: agentId,
        customer_id: customerId,
        property_id: selectedProperty.id,
        agent_message: agentMessage.trim() || null,
        is_viewed: false,
      }))

      const { data, error } = await supabase
        .from('agent_shared_listings')
        .insert(records)
        .select()

      if (error) throw error

      // Update local state
      if (data) {
        setSharedListings(prev => [...data, ...prev])
      }

      // Reset form
      setSuccess(true)
      setSelectedCustomers(new Set())
      setAgentMessage('')
      
      // Clear success after 3s
      setTimeout(() => setSuccess(false), 3000)

    } catch (error) {
      console.error('Error sharing property:', error)
      alert('Failed to share property. Please try again.')
    } finally {
      setSending(false)
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

  // Get property image
  const getPropertyImage = (property: Property) => {
    if (property.images?.[0]) return property.images[0]
    if (property.photos?.[0]?.url) return property.photos[0].url
    return null
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Share Listings</h1>
        </div>
        <button
          onClick={() => setShowSharedHistory(!showSharedHistory)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <Clock className="h-4 w-4" />
          {showSharedHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Property shared successfully! Your customers will see it in their portal.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Select Property */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            1. Select Property
          </h2>

          {/* Property Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by address, city, or zip..."
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Property List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Home className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>No active properties found</p>
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isSelected = selectedProperty?.id === property.id
                const image = getPropertyImage(property)
                
                return (
                  <button
                    key={property.id}
                    onClick={() => {
                      setSelectedProperty(property)
                      setSelectedCustomers(new Set())
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Property Image */}
                    <div className="w-20 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      {image ? (
                        <img src={image} alt={property.address} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{property.address}</p>
                      <p className="text-xs text-gray-500">{property.city}, {property.state}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="font-semibold text-blue-600">{formatPrice(property.price)}</span>
                        <span><Bed className="h-3 w-3 inline" /> {property.bedrooms}</span>
                        <span><Bath className="h-3 w-3 inline" /> {property.bathrooms}</span>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Select Customers & Send */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            2. Select Customers
          </h2>

          {!selectedProperty ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>Select a property first</p>
            </div>
          ) : (
            <>
              {/* Customer Search */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button
                  onClick={selectAllCustomers}
                  className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Select All
                </button>
              </div>

              {/* Customer List */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No customers found</p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => {
                    const isSelected = selectedCustomers.has(customer.id)
                    const alreadyShared = isAlreadyShared(customer.id, selectedProperty.id)
                    
                    return (
                      <button
                        key={customer.id}
                        onClick={() => toggleCustomer(customer.id)}
                        disabled={alreadyShared}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          alreadyShared
                            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          alreadyShared
                            ? 'bg-gray-200 border-gray-300'
                            : isSelected
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}>
                          {(isSelected || alreadyShared) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>

                        {/* Customer Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{customer.full_name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>

                        {/* Already Shared Badge */}
                        {alreadyShared && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Already sent
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (optional)
                </label>
                <textarea
                  value={agentMessage}
                  onChange={(e) => setAgentMessage(e.target.value)}
                  placeholder="Add a personal note for your customers..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={shareProperty}
                disabled={selectedCustomers.size === 0 || sending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Share with {selectedCustomers.size} Customer{selectedCustomers.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Shared History */}
      {showSharedHistory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recently Shared
          </h2>

          {sharedListings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No shared listings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Property</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Sent</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Viewed</th>
                  </tr>
                </thead>
                <tbody>
                  {sharedListings.slice(0, 10).map((shared) => {
                    const property = properties.find(p => p.id === shared.property_id)
                    const customer = customers.find(c => c.id === shared.customer_id)
                    
                    return (
                      <tr key={shared.id} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          {property?.address || 'Unknown property'}
                        </td>
                        <td className="py-2 px-3">
                          {customer?.full_name || 'Unknown customer'}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {new Date(shared.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3">
                          {shared.is_viewed ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> Yes
                            </span>
                          ) : (
                            <span className="text-gray-400">Not yet</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
