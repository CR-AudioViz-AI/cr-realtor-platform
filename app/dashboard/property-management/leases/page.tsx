'use client'
// 2026-08-20: was a SERVER component gating on a cookie-based getUser(). Sessions
// live in localStorage, so it returned null on every request and redirect()
// renders a BLANK PAGE rather than a 307. This page has never shown an agent a
// single row.
//
// Data comes from /api/me/pm/leases, behind requireUser(), where every query
// filters on the VERIFIED caller's agent_id. Markup unchanged.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Calendar, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react'


export default function LeasesPage() {
  const [leases, setLeases] = useState<any[]>([])
  const [propertiesMap, setPropertiesMap] = useState<Record<string, any>>({})
  const [tenantsMap, setTenantsMap] = useState<Record<string, any>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data: { session } } = await createClient().auth.getSession()
        if (!session) { if (live) setReady(true); return }
        const res = await fetch('/api/me/pm/leases', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        if (!res.ok) { if (live) setReady(true); return }
        const d = await res.json()
        if (!live) return
        setLeases((d.items ?? []) as any[])
        setPropertiesMap((d.properties ?? {}) as Record<string, any>)
        setTenantsMap((d.tenants ?? {}) as Record<string, any>)
        setReady(true)
      } catch {
        // Fail closed: an empty list, never another agent's records.
        if (live) setReady(true)
      }
    })()
    return () => { live = false }
  }, [])

  if (!ready) {
    return <div className="p-6"><div className="animate-pulse text-gray-500">Loading…</div></div>
  }

  const activeLeases = leases.filter(l => l.status === 'active').length
  const expiringLeases = leases.filter(l => {
    if (!l.end_date) return false
    const endDate = new Date(l.end_date)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return endDate <= thirtyDaysFromNow && l.status === 'active'
  }).length
  const totalMonthlyRent = leases.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.monthly_rent || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leases</h1>
          <p className="text-gray-600">Manage your rental lease agreements</p>
        </div>
        <Link href="/dashboard/property-management/leases/new">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={18} />
            New Lease
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Leases</p>
              <p className="text-2xl font-bold">{leases.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold">{activeLeases}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold">{expiringLeases}</p>
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
              <p className="text-2xl font-bold">{formatCurrency(totalMonthlyRent)}</p>
            </div>
          </div>
        </div>
      </div>

      {leases.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leases yet</h3>
          <p className="text-gray-500 mb-4">Create your first lease agreement to get started</p>
          <Link href="/dashboard/property-management/leases/new">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Create Lease
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leases.map((lease) => (
                <tr key={lease.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {propertiesMap[lease.property_id]?.address || 'Unknown Property'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">
                      {tenantsMap[lease.tenant_id]?.full_name || 'Unknown Tenant'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar size={14} />
                      {formatDate(lease.start_date)} - {formatDate(lease.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(lease.monthly_rent)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lease.status === 'active' ? 'bg-green-100 text-green-800' : 
                      lease.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      lease.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lease.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/property-management/leases/${lease.id}`}>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View Details
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
