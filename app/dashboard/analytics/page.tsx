'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Home,
  UserPlus,
  CheckCircle,
  Loader2,
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
  status: string
  price: number
  property_type: string
  city: string
  created_at: string
  views?: number
}

interface Lead {
  id: string
  status: string
  priority: string
  source: string
  created_at: string
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [timeRange, setTimeRange] = useState('30')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role, is_admin')
      .eq('id', user.id)
      .single()

    let teamIds = [user.id]
    if (profile?.organization_id) {
      const { data: team } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', profile.organization_id)
      if (team) teamIds = team.map(m => m.id)
    }

    const isAdmin = profile?.role === 'admin' || profile?.is_admin

    // Fetch properties
    let propQuery = supabase.from('properties').select('*')
    if (!isAdmin) {
      propQuery = propQuery.in('listing_agent_id', teamIds)
    }
    const { data: props } = await propQuery
    setProperties(props || [])

    // Fetch leads
    let leadQuery = supabase.from('realtor_leads').select('*')
    if (!isAdmin) {
      leadQuery = leadQuery.in('agent_id', teamIds)
    }
    const { data: lds } = await leadQuery
    setLeads(lds || [])

    setLoading(false)
  }

  // Calculate metrics
  const totalListings = properties.length
  const activeListings = properties.filter(p => p.status === 'active').length
  const pendingListings = properties.filter(p => p.status === 'pending').length
  const soldListings = properties.filter(p => p.status === 'sold').length

  const totalVolume = properties.reduce((sum, p) => sum + (p.price || 0), 0)
  const activeVolume = properties.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.price || 0), 0)
  const pendingVolume = properties.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.price || 0), 0)
  const soldVolume = properties.filter(p => p.status === 'sold').reduce((sum, p) => sum + (p.price || 0), 0)
  const avgPrice = totalListings > 0 ? totalVolume / totalListings : 0

  const totalLeads = leads.length
  const hotLeads = leads.filter(l => l.priority === 'high' || l.status === 'hot').length
  const newLeads = leads.filter(l => l.status === 'new').length
  const convertedLeads = leads.filter(l => l.status === 'closed' || l.status === 'converted').length
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0

  // Time-based metrics
  const now = new Date()
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  
  const recentLeads = leads.filter(l => new Date(l.created_at) >= daysAgo(parseInt(timeRange))).length
  const previousLeads = leads.filter(l => {
    const d = new Date(l.created_at)
    return d >= daysAgo(parseInt(timeRange) * 2) && d < daysAgo(parseInt(timeRange))
  }).length
  const leadsTrend = previousLeads > 0 ? ((recentLeads - previousLeads) / previousLeads * 100) : 0

  // Lead sources
  const leadSources = leads.reduce((acc, l) => {
    const source = l.source || 'Direct'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Property types
  const propertyTypes = properties.reduce((acc, p) => {
    const type = p.property_type || 'Other'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Cities
  const cities = properties.reduce((acc, p) => {
    const city = p.city || 'Unknown'
    acc[city] = (acc[city] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Pipeline stages
  const pipeline = [
    { stage: 'New', count: leads.filter(l => l.status === 'new').length, color: 'bg-blue-500' },
    { stage: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, color: 'bg-indigo-500' },
    { stage: 'Qualified', count: leads.filter(l => l.status === 'qualified').length, color: 'bg-purple-500' },
    { stage: 'Showing', count: leads.filter(l => l.status === 'showing').length, color: 'bg-amber-500' },
    { stage: 'Offer', count: leads.filter(l => l.status === 'offer').length, color: 'bg-orange-500' },
    { stage: 'Closed', count: leads.filter(l => l.status === 'closed').length, color: 'bg-emerald-500' },
  ]

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`
    return `$${price.toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500">Track your performance and pipeline metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalListings}</p>
          <p className="text-sm text-gray-500">Listings</p>
        </div>

        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">Volume</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(totalVolume)}</p>
          <p className="text-sm text-gray-500">Total Value</p>
        </div>

        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              leadsTrend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {leadsTrend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(leadsTrend).toFixed(0)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
          <p className="text-sm text-gray-500">Total Leads</p>
        </div>

        <div className="bg-white rounded-xl border p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full">Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Conversion</p>
        </div>
      </div>

      {/* Volume Summary Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-blue-200 text-sm mb-1">Active Volume</p>
            <p className="text-2xl font-bold">{formatPrice(activeVolume)}</p>
            <p className="text-blue-200 text-xs">{activeListings} listings</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Pending Volume</p>
            <p className="text-2xl font-bold">{formatPrice(pendingVolume)}</p>
            <p className="text-blue-200 text-xs">{pendingListings} deals</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Sold Volume</p>
            <p className="text-2xl font-bold">{formatPrice(soldVolume)}</p>
            <p className="text-blue-200 text-xs">{soldListings} closed</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Avg. Price</p>
            <p className="text-2xl font-bold">{formatPrice(avgPrice)}</p>
            <p className="text-blue-200 text-xs">per listing</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Listing Status */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Listing Status</h2>
          <div className="space-y-4">
            {[
              { label: 'Active', count: activeListings, color: 'bg-emerald-500' },
              { label: 'Pending', count: pendingListings, color: 'bg-amber-500' },
              { label: 'Sold', count: soldListings, color: 'bg-blue-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${totalListings > 0 ? (item.count / totalListings) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{activeListings}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{pendingListings}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{soldListings}</p>
              <p className="text-xs text-gray-500">Sold</p>
            </div>
          </div>
        </div>

        {/* Lead Pipeline */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Lead Pipeline</h2>
          <div className="space-y-3">
            {pipeline.map((stage) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{stage.stage}</span>
                  <span className="font-medium text-gray-900">{stage.count}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{hotLeads}</p>
              <p className="text-xs text-gray-500">🔥 Hot Leads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{convertedLeads}</p>
              <p className="text-xs text-gray-500">✅ Converted</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Property Types */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Property Types</h2>
          <div className="space-y-3">
            {Object.entries(propertyTypes).slice(0, 5).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                </div>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(propertyTypes).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
            )}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Lead Sources</h2>
          <div className="space-y-3">
            {Object.entries(leadSources).slice(0, 5).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 capitalize">{source}</span>
                </div>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(leadSources).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
            )}
          </div>
        </div>

        {/* Top Markets */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Markets</h2>
          <div className="space-y-3">
            {Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([city, count]) => (
              <div key={city} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{city}</span>
                </div>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(cities).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Leads</h2>
        <div className="space-y-3">
          {leads.slice(0, 5).map((lead: any) => (
            <div key={lead.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                lead.status === 'closed' ? 'bg-emerald-100' :
                lead.priority === 'high' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {lead.status === 'closed' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : lead.priority === 'high' ? (
                  <Activity className="w-5 h-5 text-red-600" />
                ) : (
                  <UserPlus className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{lead.full_name || 'Unknown'}</p>
                <p className="text-sm text-gray-500 capitalize">{lead.status || 'New'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</p>
                {lead.priority === 'high' && <span className="text-xs text-red-500">🔥 Hot</span>}
              </div>
            </div>
          ))}
          {leads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No leads yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
