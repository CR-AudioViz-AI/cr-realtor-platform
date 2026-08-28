'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Wrench } from 'lucide-react'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export default function NewMaintenanceRequestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    title: '',
    description: '',
    category: 'general',
    priority: 'normal',
    location_in_property: '',
    estimated_cost: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: propsData } = await supabase
      .from('properties')
      .select('id, address, city')
      .eq('agent_id', user.id)

    setProperties(propsData || [])

    const { data: tenantsData } = await supabase
      .from('tenants')
      .select('id, full_name, property_id')
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

      const { error } = await supabase.from('maintenance_requests').insert({
        agent_id: user.id,
        property_id: formData.property_id,
        tenant_id: formData.tenant_id || null,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location_in_property: formData.location_in_property || null,
        estimated_cost: parseFloat(formData.estimated_cost) || null,
        notes: formData.notes || null,
        status: 'submitted'
      })

      if (error) throw error

      router.push('/dashboard/property-management/maintenance')
    } catch (error: any) {
      alert('Error creating request: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const categories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC / Heating & Cooling' },
    { value: 'appliances', label: 'Appliances' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'painting', label: 'Painting' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'security', label: 'Security / Locks' },
    { value: 'general', label: 'General Maintenance' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/property-management/maintenance" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={20} />
          Back to Maintenance
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="text-blue-600" />
          New Maintenance Request
        </h1>
        <p className="text-gray-600">Submit a new maintenance or repair request</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Request Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the maintenance issue..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low - Can wait</option>
                  <option value="normal">Normal - Standard timeframe</option>
                  <option value="high">High - Needs attention soon</option>
                  <option value="urgent">Urgent - Emergency / Safety issue</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Location</h2>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reported By (Tenant)</label>
              <select
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select tenant (optional)</option>
                {tenants.filter(t => !formData.property_id || t.property_id === formData.property_id).map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location in Property</label>
              <input
                type="text"
                name="location_in_property"
                value={formData.location_in_property}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Master bathroom, Kitchen, Unit 2B"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Access instructions, vendor preferences, etc."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !formData.property_id || !formData.title}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <Link href="/dashboard/property-management/maintenance">
            <button type="button" className="px-6 py-3 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  )
}
