// app/customer/dashboard/vendors/page.tsx
// Customer Vendor Directory - Browse trusted service providers
// Created: December 1, 2025 - 1:40 PM EST

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, Search, Phone, Mail, Globe, MapPin, Star, 
  ChevronDown, ChevronUp, ExternalLink, Filter, X
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


const VENDOR_CATEGORIES = [
  { value: 'home_inspector', label: 'Home Inspector', icon: '🔍' },
  { value: 'mortgage_lender', label: 'Mortgage Lender', icon: '🏦' },
  { value: 'title_company', label: 'Title Company', icon: '📋' },
  { value: 'insurance', label: 'Home Insurance', icon: '🛡️' },
  { value: 'appraiser', label: 'Appraiser', icon: '📊' },
  { value: 'attorney', label: 'Real Estate Attorney', icon: '⚖️' },
  { value: 'contractor', label: 'General Contractor', icon: '🔨' },
  { value: 'electrician', label: 'Electrician', icon: '⚡' },
  { value: 'plumber', label: 'Plumber', icon: '🔧' },
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'roofer', label: 'Roofing', icon: '🏠' },
  { value: 'pest_control', label: 'Pest Control', icon: '🐜' },
  { value: 'landscaper', label: 'Landscaper', icon: '🌳' },
  { value: 'pool_service', label: 'Pool Service', icon: '🏊' },
  { value: 'moving_company', label: 'Moving Company', icon: '🚚' },
  { value: 'cleaning_service', label: 'Cleaning Service', icon: '🧹' },
  { value: 'photographer', label: 'Photographer', icon: '📷' },
  { value: 'stager', label: 'Home Stager', icon: '🛋️' },
  { value: 'surveyor', label: 'Land Surveyor', icon: '📐' },
  { value: 'other', label: 'Other', icon: '📦' },
]

interface Vendor {
  id: string
  business_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  address_line1: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  category: string
  description: string | null
  license_number: string | null
  years_in_business: number | null
  is_preferred: boolean
  vendor_services?: VendorService[]
}

interface VendorService {
  id: string
  service_name: string
  description: string | null
  price_range: string | null
  turnaround_time: string | null
  tags: string[] | null
}

export default function CustomerVendorsPage() {
  const supabase = createClient()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null)
  const [agentName, setAgentName] = useState<string>('')

  useEffect(() => {
    loadVendors()
  }, [])

  async function loadVendors() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // First get the customer's assigned agent
    const { data: customer } = await supabase
      .from('realtor_customers')
      .select('assigned_agent_id, profiles:assigned_agent_id(full_name)')
      .eq('auth_user_id', user.id)
      .single()

    if (!customer?.assigned_agent_id) {
      setLoading(false)
      return
    }

    // Get agent name
    if (customer.profiles) {
      setAgentName((customer.profiles as any).full_name || 'Your Agent')
    }

    // Load vendors for that agent (RLS handles security)
    const { data, error } = await supabase
      .from('vendors')
      .select(`
        id, business_name, contact_name, email, phone, website,
        address_line1, city, state, zip_code, category, description,
        license_number, years_in_business, is_preferred,
        vendor_services(id, service_name, description, price_range, turnaround_time, tags)
      `)
      .eq('agent_id', customer.assigned_agent_id)
      .eq('is_active', true)
      .order('is_preferred', { ascending: false })
      .order('business_name')

    if (!error && data) {
      setVendors(data)
    }
    setLoading(false)
  }

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = !searchQuery || 
      v.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendor_services?.some(s => 
        s.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    const matchesCategory = !categoryFilter || v.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getCategoryInfo = (cat: string) => VENDOR_CATEGORIES.find(c => c.value === cat) || { label: cat, icon: '📦' }

  // Group vendors by category for easier browsing
  const vendorsByCategory = VENDOR_CATEGORIES.reduce((acc, cat) => {
    const categoryVendors = filteredVendors.filter(v => v.category === cat.value)
    if (categoryVendors.length > 0) {
      acc.push({ ...cat, vendors: categoryVendors })
    }
    return acc
  }, [] as (typeof VENDOR_CATEGORIES[0] & { vendors: Vendor[] })[])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trusted Service Providers</h1>
        <p className="text-gray-600">
          Vetted professionals recommended by {agentName || 'your agent'}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, service, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {VENDOR_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
            ))}
          </select>
        </div>

        {/* Quick Category Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['home_inspector', 'mortgage_lender', 'title_company', 'insurance', 'contractor'].map(catValue => {
            const cat = getCategoryInfo(catValue)
            const count = vendors.filter(v => v.category === catValue).length
            if (count === 0) return null
            return (
              <button
                key={catValue}
                onClick={() => setCategoryFilter(categoryFilter === catValue ? '' : catValue)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                  categoryFilter === catValue
                    ? 'bg-blue-100 text-blue-800 border-blue-300 border'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-xs opacity-70">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading service providers...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && vendors.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors available yet</h3>
          <p className="text-gray-500">Your agent hasn't added any service providers yet.</p>
        </div>
      )}

      {/* No Results */}
      {!loading && vendors.length > 0 && filteredVendors.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
            className="text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Vendor List - Grouped by Category */}
      {!loading && filteredVendors.length > 0 && (
        <div className="space-y-8">
          {categoryFilter ? (
            // Single category view
            <div className="space-y-4">
              {filteredVendors.map(vendor => (
                <VendorCard 
                  key={vendor.id} 
                  vendor={vendor} 
                  expanded={expandedVendor === vendor.id}
                  onToggle={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                />
              ))}
            </div>
          ) : (
            // Grouped by category
            vendorsByCategory.map(category => (
              <div key={category.value}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.label}
                  <span className="text-sm font-normal text-gray-500">({category.vendors.length})</span>
                </h2>
                <div className="space-y-4">
                  {category.vendors.map(vendor => (
                    <VendorCard 
                      key={vendor.id} 
                      vendor={vendor}
                      expanded={expandedVendor === vendor.id}
                      onToggle={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Vendor Card Component
function VendorCard({ vendor, expanded, onToggle }: { vendor: Vendor; expanded: boolean; onToggle: () => void }) {
  const catInfo = VENDOR_CATEGORIES.find(c => c.value === vendor.category) || { label: vendor.category, icon: '📦' }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {catInfo.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{vendor.business_name}</h3>
                {vendor.is_preferred && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Recommended
                  </span>
                )}
              </div>
              {vendor.contact_name && (
                <p className="text-sm text-gray-600">{vendor.contact_name}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                    <Phone className="w-4 h-4" /> {vendor.phone}
                  </a>
                )}
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} className="flex items-center gap-1 hover:text-blue-600">
                    <Mail className="w-4 h-4" /> {vendor.email}
                  </a>
                )}
                {vendor.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {vendor.city}, {vendor.state}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t bg-gray-50 p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left - About */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">About</h4>
              {vendor.description ? (
                <p className="text-sm text-gray-600 mb-4">{vendor.description}</p>
              ) : (
                <p className="text-sm text-gray-400 italic mb-4">No description provided</p>
              )}

              <div className="space-y-2 text-sm">
                {vendor.website && (
                  <a 
                    href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {vendor.license_number && (
                  <p className="text-gray-600">
                    <span className="text-gray-500">License:</span> {vendor.license_number}
                  </p>
                )}
                {vendor.years_in_business && (
                  <p className="text-gray-600">
                    <span className="text-gray-500">Experience:</span> {vendor.years_in_business} years
                  </p>
                )}
                {vendor.address_line1 && (
                  <p className="text-gray-600">
                    <span className="text-gray-500">Address:</span>{' '}
                    {vendor.address_line1}, {vendor.city}, {vendor.state} {vendor.zip_code}
                  </p>
                )}
              </div>
            </div>

            {/* Right - Services */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Services Offered</h4>
              {vendor.vendor_services && vendor.vendor_services.length > 0 ? (
                <div className="space-y-3">
                  {vendor.vendor_services.map(service => (
                    <div key={service.id} className="p-3 bg-white rounded-lg border">
                      <p className="font-medium text-gray-900">{service.service_name}</p>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {service.price_range && (
                          <span className="flex items-center gap-1">💰 {service.price_range}</span>
                        )}
                        {service.turnaround_time && (
                          <span className="flex items-center gap-1">⏱️ {service.turnaround_time}</span>
                        )}
                      </div>
                      {service.tags && service.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {service.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No specific services listed</p>
              )}
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
            {vendor.phone && (
              <a
                href={`tel:${vendor.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            )}
            {vendor.email && (
              <a
                href={`mailto:${vendor.email}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </a>
            )}
            {vendor.website && (
              <a
                href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Globe className="w-4 h-4" />
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
