'use client'
// 2026-08-20: was a SERVER component gating on a cookie-based getUser(), always
// null, then a redirect() that renders blank. Nobody has ever seen this page.
//
// It reads EVERY profile, property and lead on the platform with no agent filter -
// correct for an admin view, catastrophic for anyone else. The role check is
// therefore the point of /api/admin/metrics rather than an afterthought, and it
// is enforced server-side where the caller cannot change it. A non-admin now gets
// a plain "restricted" message instead of another blank page.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Users,
  Building2,
  TrendingUp,
  Settings,
  ChevronRight,
  Home,
  UserPlus,
} from 'lucide-react';



interface Metrics {
  totalUsers: number; activeAgents: number; totalProperties: number
  activeListings: number; totalLeads: number; newLeads: number
}
const EMPTY: Metrics = { totalUsers:0, activeAgents:0, totalProperties:0, activeListings:0, totalLeads:0, newLeads:0 }

export default function AdminDashboard() {
  const [displayName, setDisplayName] = useState('Admin')
  const [m, setM] = useState<Metrics>(EMPTY)
  const [state, setState] = useState<'loading' | 'ready' | 'forbidden'>('loading')

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setState('forbidden'); return }
        const res = await fetch('/api/admin/metrics', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setState('forbidden'); return }
        const d = await res.json()
        if (!live) return
        setDisplayName(d.displayName ?? 'Admin')
        setM((d.metrics ?? EMPTY) as Metrics)
        setState('ready')
      } catch {
        if (live) setState('forbidden')   // fail closed
      }
    })()
    return () => { live = false }
  }, [])

  if (state === 'loading') {
    return <div className="p-6"><div className="animate-pulse text-gray-500">Loading platform metrics…</div></div>
  }
  if (state === 'forbidden') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Admin</h1>
        <p className="text-gray-500 text-sm">This page is restricted to administrators.</p>
      </div>
    )
  }

  const totalUsers = m.totalUsers
  const activeAgents = m.activeAgents
  const totalProperties = m.totalProperties
  const activeListings = m.activeListings
  const totalLeads = m.totalLeads
  const newLeads = m.newLeads

  const metrics = [
    {
      name: 'Total Users',
      value: totalUsers,
      breakdown: `${activeAgents} Active Agents`,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Properties',
      value: totalProperties,
      breakdown: `${activeListings} Active Listings`,
      icon: Building2,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Total Leads',
      value: totalLeads,
      breakdown: `${newLeads} New Leads`,
      icon: UserPlus,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Platform Health',
      value: '100%',
      breakdown: 'All systems operational',
      icon: TrendingUp,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ]

  const quickLinks = [
    {
      name: 'All Properties',
      description: 'View and manage all listings',
      href: '/dashboard/properties',
      icon: Building2,
    },
    {
      name: 'All Leads',
      description: 'View platform-wide leads',
      href: '/dashboard/leads',
      icon: UserPlus,
    },
    {
      name: 'Feature Toggles',
      description: 'Enable/disable platform features',
      href: '/dashboard/admin/features',
      icon: Settings,
    },
    {
      name: 'Analytics',
      description: 'View platform analytics',
      href: '/dashboard/admin/analytics',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center mb-2">
          <Shield className="w-8 h-8 mr-3" />
          <div>
            <h2 className="text-2xl font-bold">Platform Admin</h2>
            <p className="text-red-100">Welcome back, {displayName}</p>
          </div>
        </div>
        <p className="text-red-100 mt-2">
          Complete control over the CR Realtor Platform
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {metric.value}
            </p>
            <p className="text-xs text-gray-500">{metric.breakdown}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <link.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600">
                    {link.name}
                  </p>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Platform Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">New Agent Registered</p>
              <p className="text-sm text-gray-600">New agent joined</p>
            </div>
            <p className="text-sm text-gray-500">Today</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">New Property Listed</p>
              <p className="text-sm text-gray-600">Port Royal Waterfront Estate</p>
            </div>
            <p className="text-sm text-gray-500">Today</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Platform Updated</p>
              <p className="text-sm text-gray-600">v1.0 Production Ready</p>
            </div>
            <p className="text-sm text-gray-500">Today</p>
          </div>
        </div>
      </div>
    </div>
  )
}
