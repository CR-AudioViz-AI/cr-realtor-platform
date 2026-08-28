'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export default function NewLeasePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    lease_type: 'standard',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    security_deposit: '',
    pet_deposit: '',
    rent_due_day: '1',
    late_fee_amount: '',
    late_fee_grace_days: '5',
    utilities_included: [] as string[],
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load rental properties
    const { data: propsData } = await supabase
      .from('properties')
      .select('id, address, city')
      .eq('agent_id', user.id)
      .in('listing_type', ['for_rent', 'for_lease'])

    setProperties(propsData || [])

    // Load tenants
    const { data: tenantsData } = await supabase
      .from('tenants')
      .select('id, full_name')
      .eq('agent_id', user.id)
      .eq('status', 'active')

    setTenants(tenantsData || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('leases').insert({
        agent_id: user.id,
        property_id: formData.property_id,
        tenant_id: formData.tenant_id,
        lease_type: formData.lease_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        monthly_rent: parseFloat(formData.monthly_rent) || 0,
        security_deposit: parseFloat(formData.security_deposit) || 0,
        pet_deposit: parseFloat(formData.pet_deposit) || null,
        rent_due_day: parseInt(formData.rent_due_day) || 1,
        late_fee_amount: parseFloat(formData.late_fee_amount) || null,
        late_fee_grace_days: parseInt(formData.late_fee_grace_days) || 5,
        utilities_included: formData.utilities_included,
        notes: formData.notes || null,
        status: 'active'
      })

      if (error) throw error

      // Update tenant's property assignment
      await supabase
        .from('tenants')
        .update({ property_id: formData.property_id })
        .eq('id', formData.tenant_id)

      router.push('/dashboard/property-management/leases')
    } catch (error: any) {
      alert('Error creating lease: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUtilitiesChange = (utility: string) => {
    setFormData(prev => ({
      ...prev,
      utilities_included: prev.utilities_included.includes(utility)
        ? prev.utilities_included.filter(u => u !== utility)
        : [...prev.utilities_included, utility]
    }))
  }

  const utilities = ['Water', 'Electric', 'Gas', 'Trash', 'Internet', 'Cable']

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/property-management/leases" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={20} />
          Back to Leases
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" />
          Create New Lease
        </h1>
        <p className="text-gray-600">Set up a new lease agreement</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Property & Tenant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
              <select
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a property</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.address}, {p.city}</option>
                ))}
              </select>
              {properties.length === 0 && (
                <p className="text-sm text-yellow-600 mt-1">No rental properties found. Add a property first.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant *</label>
              <select
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a tenant</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
              {tenants.length === 0 && (
                <p className="text-sm text-yellow-600 mt-1">No active tenants found. <Link href="/dashboard/property-management/tenants/new" className="text-blue-600">Add a tenant first.</Link></p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Lease Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Type</label>
              <select
                name="lease_type"
                value={formData.lease_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="month-to-month">Month-to-Month</option>
                <option value="short-term">Short Term</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Financial Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Deposit</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="pet_deposit"
                  value={formData.pet_deposit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent Due Day</label>
              <select
                name="rent_due_day"
                value={formData.rent_due_day}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(28)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="late_fee_amount"
                  value={formData.late_fee_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (Days)</label>
              <input
                type="number"
                name="late_fee_grace_days"
                value={formData.late_fee_grace_days}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Utilities Included</h2>
          <div className="flex flex-wrap gap-3">
            {utilities.map(utility => (
              <label key={utility} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.utilities_included.includes(utility)}
                  onChange={() => handleUtilitiesChange(utility)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">{utility}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Additional lease terms, special conditions, etc."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !formData.property_id || !formData.tenant_id}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Creating...' : 'Create Lease'}
          </button>
          <Link href="/dashboard/property-management/leases">
            <button type="button" className="px-6 py-3 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  )
}
