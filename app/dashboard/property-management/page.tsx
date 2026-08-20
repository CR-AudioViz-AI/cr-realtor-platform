'use client'
// 2026-08-20: was a SERVER component gating on a cookie-based getUser(). Sessions
// live in localStorage, so it returned null on EVERY request - for a signed-in
// agent too - and redirect() renders a BLANK PAGE rather than a 307. This
// dashboard has never shown an agent a single number.
//
// app/dashboard/layout.tsx already verifies access. The figures come from
// /api/me/property-management, behind requireUser(), where every query filters on
// the VERIFIED caller's agent_id. Markup unchanged.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, Users, FileText, Wrench, DollarSign, 
  AlertTriangle, Plus
} from 'lucide-react';



interface Stats {
  totalProperties: number; rentalProperties: number; activeTenants: number
  activeLeases: number; openMaintenance: number; urgentMaintenance: number
  monthlyIncome: number; expiringLeases: number
}

const EMPTY: Stats = {
  totalProperties: 0, rentalProperties: 0, activeTenants: 0, activeLeases: 0,
  openMaintenance: 0, urgentMaintenance: 0, monthlyIncome: 0, expiringLeases: 0,
}

export default function PropertyManagementDashboard() {
  const [stats, setStats] = useState<Stats>(EMPTY)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setReady(true); return }
        const res = await fetch('/api/me/property-management', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setReady(true); return }
        const d = await res.json()
        if (!live) return
        setStats((d.stats ?? EMPTY) as Stats)
        setReady(true)
      } catch {
        // Fail closed: zeros, never another agent's portfolio.
        if (live) setReady(true)
      }
    })()
    return () => { live = false }
  }, [])

  if (!ready) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-gray-500">Loading your portfolio…</div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Property Management</h1>
        <p className="text-gray-600">Manage your rental properties, tenants, and maintenance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rental Properties</p>
              <p className="text-2xl font-bold">{stats.rentalProperties}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Tenants</p>
              <p className="text-2xl font-bold">{stats.activeTenants}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Income</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.monthlyIncome)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Wrench className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Maintenance</p>
              <p className="text-2xl font-bold">{stats.openMaintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tenants Section */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Tenants</h3>
                <p className="text-sm text-gray-500">Manage tenant profiles</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Tenants</span>
                <span className="font-semibold">{stats.activeTenants}</span>
              </div>
            </div>
          </div>
          <div className="border-t bg-gray-50 px-6 py-3 flex justify-between">
            <Link href="/dashboard/property-management/tenants">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All →</button>
            </Link>
            <Link href="/dashboard/property-management/tenants/new">
              <button className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium">
                <Plus size={16} /> Add New
              </button>
            </Link>
          </div>
        </div>

        {/* Leases Section */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Leases</h3>
                <p className="text-sm text-gray-500">Track lease agreements</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Leases</span>
                <span className="font-semibold">{stats.activeLeases}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expiring Soon</span>
                <span className={`font-semibold ${stats.expiringLeases > 0 ? 'text-red-600' : ''}`}>
                  {stats.expiringLeases}
                  {stats.expiringLeases > 0 && <AlertTriangle className="inline ml-1" size={14} />}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t bg-gray-50 px-6 py-3 flex justify-between">
            <Link href="/dashboard/property-management/leases">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All →</button>
            </Link>
            <Link href="/dashboard/property-management/leases/new">
              <button className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium">
                <Plus size={16} /> Add New
              </button>
            </Link>
          </div>
        </div>

        {/* Maintenance Section */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wrench className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Maintenance</h3>
                <p className="text-sm text-gray-500">Handle repair requests</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Open Requests</span>
                <span className="font-semibold">{stats.openMaintenance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Urgent</span>
                <span className={`font-semibold ${stats.urgentMaintenance > 0 ? 'text-red-600' : ''}`}>
                  {stats.urgentMaintenance}
                  {stats.urgentMaintenance > 0 && <AlertTriangle className="inline ml-1" size={14} />}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t bg-gray-50 px-6 py-3 flex justify-between">
            <Link href="/dashboard/property-management/maintenance">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All →</button>
            </Link>
            <Link href="/dashboard/property-management/maintenance/new">
              <button className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium">
                <Plus size={16} /> Add New
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/property-management/tenants/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Users size={18} /> Add Tenant
            </button>
          </Link>
          <Link href="/dashboard/property-management/leases/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <FileText size={18} /> Create Lease
            </button>
          </Link>
          <Link href="/dashboard/property-management/maintenance/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <Wrench size={18} /> New Maintenance Request
            </button>
          </Link>
          <Link href="/dashboard/properties/new">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Building2 size={18} /> Add Property
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
