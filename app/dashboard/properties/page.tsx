'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Home, Plus, Search, Filter, Grid, List, MapPin, Bed, Bath,
  Square, DollarSign, Eye, Edit2, Trash2, MoreVertical, Heart,
  TrendingUp, Calendar, Clock, Share2, Image as ImageIcon, Loader2
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
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  status: 'active' | 'pending' | 'sold' | 'off-market'
  property_type: string
  year_built: number | null
  listed_date: string | null
  created_at: string
  description?: string
  features: string[] | null
  photos: string[] | null
  primary_image_url: string | null
  mls_id?: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to view your properties')
        setLoading(false)
        return
      }

      // Fetch properties for this agent
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching properties:', fetchError)
        setError('Failed to load properties')
      } else {
        setProperties(data || [])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Calculate days on market
  const getDaysOnMarket = (listedDate: string | null, createdAt: string) => {
    const startDate = listedDate ? new Date(listedDate) : new Date(createdAt)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const filteredProperties = properties
    .filter(p => {
      const matchesSearch = 
        p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mls_id?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-high': return (b.price || 0) - (a.price || 0)
        case 'price-low': return (a.price || 0) - (b.price || 0)
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default: return 0
      }
    })

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending').length,
    sold: properties.filter(p => p.status === 'sold').length,
    totalValue: properties.reduce((sum, p) => sum + (p.price || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchProperties()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Home className="w-4 h-4" />
            <span className="text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Sold</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Value</span>
          </div>
          <p className="text-xl font-bold text-purple-600">${(stats.totalValue / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by address, city, or MLS..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="off-market">Off Market</option>
            </select>
            <select
              className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border text-center">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {properties.length === 0 ? 'No Properties Yet' : 'No Matching Properties'}
          </h3>
          <p className="text-gray-600 mb-6">
            {properties.length === 0 
              ? 'Start by adding your first property listing.'
              : 'Try adjusting your search or filters.'}
          </p>
          {properties.length === 0 && (
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Your First Property
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <div key={property.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                {property.primary_image_url ? (
                  <img 
                    src={property.primary_image_url} 
                    alt={property.title || property.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Home className="w-16 h-16 text-blue-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.status === 'active' ? 'bg-green-500 text-white' :
                    property.status === 'pending' ? 'bg-yellow-500 text-white' :
                    property.status === 'sold' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                  </span>
                </div>
                {property.mls_id && (
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                    {property.mls_id}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xl font-bold text-green-600">
                    ${property.price?.toLocaleString()}
                  </p>
                  <span className="text-sm text-gray-500">
                    {getDaysOnMarket(property.listed_date, property.created_at)} days
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {property.title || property.address}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-4 h-4" />
                  {property.city}, {property.state} {property.zip_code}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" /> {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" /> {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Square className="w-4 h-4" /> {property.sqft?.toLocaleString()} sqft
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Link>
                  <Link
                    href={`/dashboard/properties/${property.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {filteredProperties.map(property => (
            <Link
              key={property.id}
              href={`/dashboard/properties/${property.id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex-shrink-0 overflow-hidden">
                {property.primary_image_url ? (
                  <img 
                    src={property.primary_image_url} 
                    alt={property.title || property.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Home className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {property.title || property.address}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    property.status === 'active' ? 'bg-green-100 text-green-700' :
                    property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    property.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {property.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4" />
                  {property.address}, {property.city}, {property.state} {property.zip_code}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" /> {property.bedrooms} beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" /> {property.bathrooms} baths
                  </span>
                  <span className="flex items-center gap-1">
                    <Square className="w-4 h-4" /> {property.sqft?.toLocaleString()} sqft
                  </span>
                  {property.mls_id && (
                    <span className="text-gray-400">MLS: {property.mls_id}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  ${property.price?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {getDaysOnMarket(property.listed_date, property.created_at)} days on market
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
