'use client'
// 2026-08-20: was a SERVER component gating on a cookie-based getUser(). Sessions
// live in localStorage, so it returned null on every request and redirect()
// renders a BLANK PAGE, not a 307. An agent has never seen this dashboard.
//
// Data comes from /api/me/realtor, behind requireUser(), where every query filters
// on the VERIFIED caller's agent_id. Markup unchanged.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Plus,
  Eye,
  MapPin,
  ArrowUpRight,
  Home,
  Star,
  Clock,
} from 'lucide-react';



interface Stats {
  totalListings: number; activeListings: number; pendingListings: number; soldListings: number
  newLeads: number; activeLeads: number; totalCustomers: number
}
const EMPTY: Stats = { totalListings:0, activeListings:0, pendingListings:0, soldListings:0, newLeads:0, activeLeads:0, totalCustomers:0 }

export default function RealtorDashboard() {
  const [properties, setProperties] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>(EMPTY)
  const [displayName, setDisplayName] = useState('Realtor')
  const [firstName, setFirstName] = useState('there')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setReady(true); return }
        const res = await fetch('/api/me/realtor', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setReady(true); return }
        const d = await res.json()
        if (!live) return
        setProperties((d.properties ?? []) as any[])
        setLeads((d.leads ?? []) as any[])
        setStats((d.stats ?? EMPTY) as Stats)
        const name = d.profile?.full_name || 'Realtor'
        setDisplayName(name)
        setFirstName(String(name).split(' ')[0] || 'there')
        setReady(true)
      } catch {
        if (live) setReady(true)   // fail closed: zeros, never another agent's book
      }
    })()
    return () => { live = false }
  }, [])

  if (!ready) {
    return <div className="p-6"><div className="animate-pulse text-gray-500">Loading your dashboard…</div></div>
  }

  const { activeListings, pendingListings, soldListings, totalListings, newLeads, activeLeads, totalCustomers } = stats

  // Calculate total volume
  const totalVolume = properties?.reduce((sum, p) => sum + (p.price || 0), 0) || 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-blue-100">
          Here&apos;s what&apos;s happening with your real estate business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {activeListings} active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalListings}</h3>
          <p className="text-gray-600">Total Listings</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {soldListings} sold
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${(totalVolume / 1000000).toFixed(1)}M
          </h3>
          <p className="text-gray-600">Total Volume</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {newLeads} new
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{activeLeads}</h3>
          <p className="text-gray-600">Active Leads</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalCustomers}</h3>
          <p className="text-gray-600">Total Customers</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
            <Link
              href="/dashboard/properties"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y">
            {properties && properties.length > 0 ? (
              properties.slice(0, 5).map((property) => (
                <Link key={property.id} href={`/dashboard/properties/${property.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Home className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {property.title || property.address}
                      </h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.city}, {property.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${property.price?.toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        property.status === 'active' ? 'bg-green-100 text-green-700' :
                        property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No properties yet</p>
                <Link
                  href="/dashboard/properties/new"
                  className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add your first listing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <Link
              href="/dashboard/leads"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y">
            {leads && leads.length > 0 ? (
              leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {lead.full_name?.split(' ').map((n: string) => n[0]).join('') || 'L'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{lead.full_name}</h4>
                      <p className="text-sm text-gray-500 truncate">{lead.email || lead.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                        lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lead.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No leads yet</p>
                <Link
                  href="/dashboard/leads/new"
                  className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add your first lead
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/properties/new"
            className="flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition"
          >
            <Building2 className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-700">New Listing</span>
          </Link>
          <Link
            href="/dashboard/leads/new"
            className="flex flex-col items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition"
          >
            <Plus className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-700">Add Lead</span>
          </Link>
          <Link
            href="/dashboard/customers"
            className="flex flex-col items-center p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition"
          >
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-700">Customers</span>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex flex-col items-center p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition"
          >
            <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-700">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

