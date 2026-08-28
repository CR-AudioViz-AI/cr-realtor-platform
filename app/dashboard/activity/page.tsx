'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Activity,
  Heart,
  Calendar,
  MessageSquare,
  Eye,
  Star,
  ChevronRight,
  Search,
  RefreshCw,
  Loader2,
  Home,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
  phone?: string
  budget_min?: number
  budget_max?: number
  timeline?: string
  created_at: string
}

interface ActivityMetadata {
  customer_name?: string
  rating?: number
  interest_level?: string
  [key: string]: unknown
}

interface ActivityItem {
  id: string
  type: string
  description: string
  property_address?: string
  metadata?: ActivityMetadata
  created_at: string
}

export default function AgentCustomerActivityPage() {
  const supabase = createClient()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [, setAgentId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activityFilter, setActivityFilter] = useState('all')

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setAgentId(user.id)

      // Load assigned customers
      const { data: customerData } = await supabase
        .from('realtor_customers')
        .select('*')
        .eq('assigned_agent_id', user.id)
        .order('created_at', { ascending: false })

      setCustomers((customerData || []) as Customer[])

      // Load all recent activity
      const response = await fetch(`/api/customer-activity?agent_id=${user.id}&limit=50`)
      const data = await response.json()
      setAllActivities(data.activities || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCustomerActivity(customer: Customer) {
    setSelectedCustomer(customer)
    setLoadingActivities(true)

    try {
      const response = await fetch(`/api/customer-activity?customer_id=${customer.id}&limit=50`)
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const filteredCustomers = customers.filter(c =>
    !searchTerm ||
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredActivities = (selectedCustomer ? activities : allActivities).filter(a =>
    activityFilter === 'all' || a.type === activityFilter
  )

  const activityIcon = (type: string) => {
    switch (type) {
      case 'saved_property': return <Heart className="w-4 h-4 text-rose-500" />
      case 'showing_request': return <Calendar className="w-4 h-4 text-blue-500" />
      case 'message_sent': return <MessageSquare className="w-4 h-4 text-green-500" />
      case 'property_view': return <Eye className="w-4 h-4 text-purple-500" />
      case 'walkthrough_feedback': return <Star className="w-4 h-4 text-yellow-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  const formatPrice = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  // Helper functions for safe metadata access
  const getCustomerName = (metadata?: ActivityMetadata): string | null => {
    if (metadata?.customer_name && typeof metadata.customer_name === 'string') {
      return metadata.customer_name
    }
    return null
  }

  const getRating = (metadata?: ActivityMetadata): number | null => {
    if (metadata?.rating && typeof metadata.rating === 'number') {
      return metadata.rating
    }
    return null
  }

  const getInterestLevel = (metadata?: ActivityMetadata): string | null => {
    if (metadata?.interest_level && typeof metadata.interest_level === 'string') {
      return metadata.interest_level
    }
    return null
  }

  // Stats
  const stats = {
    totalCustomers: customers.length,
    recentActivity: allActivities.filter(a => new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
    savedProperties: allActivities.filter(a => a.type === 'saved_property').length,
    showingRequests: allActivities.filter(a => a.type === 'showing_request').length,
  }

  // Hot leads count
  const hotLeadsCount = allActivities.filter(a => {
    if (a.type !== 'walkthrough_feedback') return false
    const interestLevel = getInterestLevel(a.metadata)
    return interestLevel === 'very_interested' || interestLevel === 'ready_to_offer'
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Activity</h1>
          <p className="text-gray-500">Monitor your customers&apos; property searches and interests</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="text-sm text-gray-500">Active Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
              <p className="text-sm text-gray-500">Last 24h Activity</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.savedProperties}</p>
              <p className="text-sm text-gray-500">Properties Saved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.showingRequests}</p>
              <p className="text-sm text-gray-500">Showing Requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900 mb-3">My Customers</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {/* All Activity Option */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className={`w-full p-4 text-left border-b hover:bg-gray-50 flex items-center gap-3 ${!selectedCustomer ? 'bg-blue-50' : ''}`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">All Customer Activity</p>
                <p className="text-sm text-gray-500">{allActivities.length} recent events</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {filteredCustomers.map(customer => (
              <button
                key={customer.id}
                onClick={() => loadCustomerActivity(customer)}
                className={`w-full p-4 text-left border-b hover:bg-gray-50 flex items-center gap-3 ${selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                  {customer.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{customer.full_name}</p>
                  <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                  {customer.budget_max && (
                    <p className="text-xs text-blue-600">Budget: up to {formatPrice(customer.budget_max)}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No customers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                {selectedCustomer ? `${selectedCustomer.full_name}'s Activity` : 'All Recent Activity'}
              </h2>
              <p className="text-sm text-gray-500">{filteredActivities.length} events</p>
            </div>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">All Activity</option>
              <option value="saved_property">Saved Properties</option>
              <option value="showing_request">Showing Requests</option>
              <option value="message_sent">Messages</option>
              <option value="property_view">Property Views</option>
              <option value="walkthrough_feedback">Feedback</option>
            </select>
          </div>

          {/* Customer Quick Info */}
          {selectedCustomer && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {selectedCustomer.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedCustomer.full_name}</p>
                    <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedCustomer.phone && (
                    <a href={`tel:${selectedCustomer.phone}`} className="p-2 bg-white border rounded-lg hover:bg-gray-50">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  <a href={`mailto:${selectedCustomer.email}`} className="p-2 bg-white border rounded-lg hover:bg-gray-50">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </a>
                  <Link href={`/dashboard/inbox`} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <MessageSquare className="w-5 h-5" />
                  </Link>
                </div>
              </div>
              {(selectedCustomer.budget_min || selectedCustomer.budget_max || selectedCustomer.timeline) && (
                <div className="flex gap-4 mt-3 text-sm">
                  {selectedCustomer.budget_max && (
                    <span className="text-gray-600">
                      <strong>Budget:</strong> {selectedCustomer.budget_min ? `${formatPrice(selectedCustomer.budget_min)} - ` : 'Up to '}{formatPrice(selectedCustomer.budget_max)}
                    </span>
                  )}
                  {selectedCustomer.timeline && (
                    <span className="text-gray-600">
                      <strong>Timeline:</strong> {selectedCustomer.timeline}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto">
            {loadingActivities ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="divide-y">
                {filteredActivities.map(activity => {
                  const customerName = getCustomerName(activity.metadata)
                  const rating = getRating(activity.metadata)
                  
                  return (
                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {activityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          {activity.property_address && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Home className="w-3 h-3" />
                              {activity.property_address}
                            </p>
                          )}
                          {customerName && !selectedCustomer && (
                            <p className="text-xs text-blue-600 mt-1">
                              by {customerName}
                            </p>
                          )}
                          {rating !== null && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-gray-600">{rating}/5</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(activity.created_at)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No activity to display</p>
                <p className="text-sm mt-1">Customer activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hot Leads Alert */}
      {hotLeadsCount > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">🔥 Hot Leads Detected!</p>
              <p className="text-sm text-orange-100">
                {hotLeadsCount} customer(s) showed high interest in properties. Follow up ASAP!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
