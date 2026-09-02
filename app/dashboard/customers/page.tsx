'use client'

// =====================================================
// CR REALTOR PLATFORM - AGENT CUSTOMER MANAGEMENT
// Path: app/dashboard/customers/page.tsx
// Timestamp: 2025-12-01 4:25 PM EST
// Purpose: an agent can create, view, and message customers
// Uses: Pure Tailwind CSS (no shadcn/ui)
// =====================================================

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  UserPlus, 
  Mail, 
  Phone, 
  MessageSquare, 
  Eye, 
  Copy, 
  Check,
  RefreshCw,
  DollarSign,
  Calendar,
  Home,
  Search,
  FileText,
  X
} from 'lucide-react';

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface Customer {
  id: string
  user_id: string | null
  full_name: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  budget_min: number | null
  budget_max: number | null
  timeline: string | null
  property_type_preference: string | null
  bedroom_preference: number | null
  notes: string | null
  status: string
  source: string
  created_at: string
  last_login: string | null
}

interface InviteCredentials {
  email: string
  temporary_password: string
  login_url: string
  message: string
}

export default function AgentCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [credentials, setCredentials] = useState<InviteCredentials | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
    budget_min: '',
    budget_max: '',
    timeline: '',
    property_type_preference: '',
    bedroom_preference: ''
  })

  const supabase = createClient()

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('realtor_customers')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleInviteCustomer(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setError(null)

    try {
      const response = await fetch('/api/customers/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone || null,
          notes: formData.notes || null,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          timeline: formData.timeline || null,
          property_type_preference: formData.property_type_preference || null,
          bedroom_preference: formData.bedroom_preference ? parseInt(formData.bedroom_preference) : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer')
      }

      // Success - show credentials
      setCredentials(data.credentials)
      setShowInviteModal(false)
      setShowCredentialsModal(true)

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        notes: '',
        budget_min: '',
        budget_max: '',
        timeline: '',
        property_type_preference: '',
        bedroom_preference: ''
      })

      // Reload customers
      loadCustomers()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setInviting(false)
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  )

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const activeCount = customers.filter(c => c.status === 'active').length
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentLoginCount = customers.filter(c => c.last_login && new Date(c.last_login) > weekAgo).length
  const neverLoggedInCount = customers.filter(c => !c.last_login && c.user_id).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Customers</h1>
            <p className="text-gray-500 mt-1">
              Manage your customer accounts and communications
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Logged In This Week</p>
            <p className="text-3xl font-bold text-blue-600">{recentLoginCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Never Logged In</p>
            <p className="text-3xl font-bold text-amber-600">{neverLoggedInCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={loadCustomers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferences</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Loading customers...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No customers match your search' : 'No customers yet. Click "Add Customer" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{customer.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {customer.source === 'agent_invite' ? 'Invited' : customer.source}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <a 
                          href={`mailto:${customer.email}`}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {customer.email}
                        </a>
                        {customer.phone && (
                          <a 
                            href={`tel:${customer.phone}`}
                            className="flex items-center gap-1 text-sm text-gray-500"
                          >
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.budget_min || customer.budget_max ? (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {formatCurrency(customer.budget_min)} - {formatCurrency(customer.budget_max)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        {customer.property_type_preference && (
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4 text-gray-400" />
                            {customer.property_type_preference}
                          </div>
                        )}
                        {customer.timeline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {customer.timeline}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                      {customer.user_id && !customer.last_login && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Never logged in
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={`/dashboard/customers/${customer.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </a>
                        <a 
                          href={`/dashboard/customers/${customer.id}/messages`}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="Messages"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </a>
                        <a 
                          href={`/dashboard/customers/${customer.id}/documents`}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="Documents"
                        >
                          <FileText className="h-5 w-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Create Customer Account</h2>
                  <p className="text-sm text-gray-500 mt-1">Enter customer details. They'll receive login credentials.</p>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleInviteCustomer} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      placeholder="John & Sarah Smith"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="(239) 555-0123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                    <select
                      value={formData.timeline}
                      onChange={e => setFormData({...formData, timeline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select timeline</option>
                      <option value="Immediately">Immediately</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6+ months">6+ months</option>
                      <option value="Just browsing">Just browsing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min</label>
                    <input
                      type="number"
                      value={formData.budget_min}
                      onChange={e => setFormData({...formData, budget_min: e.target.value})}
                      placeholder="300000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max</label>
                    <input
                      type="number"
                      value={formData.budget_max}
                      onChange={e => setFormData({...formData, budget_max: e.target.value})}
                      placeholder="500000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                      value={formData.property_type_preference}
                      onChange={e => setFormData({...formData, property_type_preference: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="Single Family">Single Family</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Multi-Family">Multi-Family</option>
                      <option value="Land">Land</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <select
                      value={formData.bedroom_preference}
                      onChange={e => setFormData({...formData, bedroom_preference: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select bedrooms</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Looking for waterfront, prefers newer construction..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {inviting ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Credentials Modal */}
        {showCredentialsModal && credentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <Check className="h-6 w-6" />
                  <h2 className="text-xl font-semibold">Customer Account Created!</h2>
                </div>
                <p className="text-gray-500 mb-6">Share these login credentials with your customer</p>

                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{credentials.email}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(credentials.email, 'email')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copiedField === 'email' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Temporary Password</p>
                      <p className="font-mono font-medium">{credentials.temporary_password}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(credentials.temporary_password, 'password')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copiedField === 'password' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Login URL</p>
                      <p className="text-sm text-blue-600 truncate max-w-[200px]">{credentials.login_url}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(credentials.login_url, 'url')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copiedField === 'url' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm text-blue-700">Copy full message to send</span>
                  <button
                    onClick={() => copyToClipboard(credentials.message, 'message')}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    {copiedField === 'message' ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Message
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowCredentialsModal(false)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

