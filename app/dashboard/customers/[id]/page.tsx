// =====================================================
// CR REALTOR PLATFORM - CUSTOMER DETAIL PAGE
// Path: app/dashboard/customers/[id]/page.tsx
// Timestamp: 2025-12-01 12:50 PM EST
// Purpose: View individual customer details
// =====================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Home,
  Calendar,
  MessageSquare,
  Activity,
  Edit,
  Clock,
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
  address: string
  city: string
  state: string
  zip: string
  budget_min: number
  budget_max: number
  bedroom_preference: number
  bathroom_preference: number
  property_type_preference: string
  timeline: string
  notes: string
  status: string
  source: string
  created_at: string
  last_login: string
  login_count: number
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  const loadCustomer = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('assigned_agent_id', user.id)
        .single()

      if (error || !data) {
        router.push('/dashboard/customers')
        return
      }
      
      setCustomer(data)
    } catch (error) {
      console.error('Error loading customer:', error)
    } finally {
      setLoading(false)
    }
  }, [customerId, router, supabase])

  useEffect(() => {
    loadCustomer()
  }, [loadCustomer])

  const formatPrice = (price: number) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date: string) => {
    if (!date) return 'Never'
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
          <p className="text-gray-500 capitalize">{customer.status} Customer</p>
        </div>
        <Link
          href={`/dashboard/customers/${customerId}/insights`}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          View Activity
        </Link>
        <Link
          href="/dashboard/messages"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Message
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Contact Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                {customer.email}
              </a>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                  {customer.phone}
                </a>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-700">{customer.address}</p>
                  <p className="text-gray-500 text-sm">
                    {customer.city}, {customer.state} {customer.zip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="h-5 w-5 text-green-600" />
            Property Preferences
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget
              </span>
              <span className="font-medium">
                {formatPrice(customer.budget_min)} - {formatPrice(customer.budget_max)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Bedrooms
              </span>
              <span className="font-medium">{customer.bedroom_preference || 'Any'}+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Bath className="h-4 w-4" />
                Bathrooms
              </span>
              <span className="font-medium">{customer.bathroom_preference || 'Any'}+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Type
              </span>
              <span className="font-medium capitalize">
                {customer.property_type_preference?.replace('_', ' ') || 'Any'}
              </span>
            </div>
            {customer.timeline && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </span>
                <span className="font-medium">{customer.timeline}</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Added</span>
              <span className="font-medium">{formatDate(customer.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Last Login</span>
              <span className="font-medium">{formatDate(customer.last_login)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Total Logins</span>
              <span className="font-medium">{customer.login_count || 0}</span>
            </div>
            {customer.source && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Source</span>
                <span className="font-medium capitalize">{customer.source}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Your Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/customers/${customerId}/insights`}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            View Saved Searches & Favorites
          </Link>
          <Link
            href="/dashboard/share-listings"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Share a Property
          </Link>
          <Link
            href="/dashboard/messages"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Send Message
          </Link>
        </div>
      </div>
    </div>
  )
}
