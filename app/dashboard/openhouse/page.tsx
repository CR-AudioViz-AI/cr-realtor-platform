'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  QrCode,
  Clipboard,
  Check,
  X,
  Loader2,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Mail,
  Phone,
  UserPlus,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface OpenHouse {
  id: string
  property_id?: string
  property_address: string
  property_city: string
  date: string
  start_time: string
  end_time: string
  notes?: string
  visitors: { name: string; email: string; phone: string; interested: boolean }[]
  status: 'upcoming' | 'active' | 'completed'
  created_at: string
}

interface Property {
  id: string
  title: string
  address: string
  city: string
  photos: string[]
}

export default function OpenHousePage() {
  const supabase = createClient()
  const [openHouses, setOpenHouses] = useState<OpenHouse[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showVisitorModal, setShowVisitorModal] = useState(false)
  const [editingOH, setEditingOH] = useState<OpenHouse | null>(null)
  const [selectedOH, setSelectedOH] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    property_id: '',
    property_address: '',
    property_city: '',
    date: '',
    start_time: '13:00',
    end_time: '16:00',
    notes: '',
  })

  const [visitorForm, setVisitorForm] = useState({
    name: '',
    email: '',
    phone: '',
    interested: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load properties
    const { data: props } = await supabase
      .from('properties')
      .select('id, title, address, city, photos')
      .eq('status', 'active')

    setProperties(props || [])

    // Load open houses from localStorage
    const stored = localStorage.getItem('cr_open_houses')
    if (stored) {
      setOpenHouses(JSON.parse(stored))
    }

    setLoading(false)
  }

  const saveOpenHouses = (ohs: OpenHouse[]) => {
    localStorage.setItem('cr_open_houses', JSON.stringify(ohs))
    setOpenHouses(ohs)
  }

  const createOpenHouse = () => {
    setSaving(true)
    const property = properties.find(p => p.id === formData.property_id)
    
    const newOH: OpenHouse = {
      id: editingOH?.id || crypto.randomUUID(),
      property_id: formData.property_id || undefined,
      property_address: formData.property_address || property?.address || '',
      property_city: formData.property_city || property?.city || '',
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      notes: formData.notes,
      visitors: editingOH?.visitors || [],
      status: 'upcoming',
      created_at: editingOH?.created_at || new Date().toISOString(),
    }

    if (editingOH) {
      saveOpenHouses(openHouses.map(oh => oh.id === editingOH.id ? newOH : oh))
    } else {
      saveOpenHouses([...openHouses, newOH])
    }

    setSaving(false)
    setShowModal(false)
    setEditingOH(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      property_id: '',
      property_address: '',
      property_city: '',
      date: '',
      start_time: '13:00',
      end_time: '16:00',
      notes: '',
    })
  }

  const openEdit = (oh: OpenHouse) => {
    setFormData({
      property_id: oh.property_id || '',
      property_address: oh.property_address,
      property_city: oh.property_city,
      date: oh.date,
      start_time: oh.start_time,
      end_time: oh.end_time,
      notes: oh.notes || '',
    })
    setEditingOH(oh)
    setShowModal(true)
  }

  const deleteOH = (id: string) => {
    if (!confirm('Delete this open house?')) return
    saveOpenHouses(openHouses.filter(oh => oh.id !== id))
  }

  const addVisitor = () => {
    if (!selectedOH || !visitorForm.name) return
    
    saveOpenHouses(openHouses.map(oh => {
      if (oh.id !== selectedOH) return oh
      return {
        ...oh,
        visitors: [...oh.visitors, { ...visitorForm }]
      }
    }))

    setVisitorForm({ name: '', email: '', phone: '', interested: false })
    setShowVisitorModal(false)
  }

  const copySignInLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/open-house/${id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedOpenHouse = openHouses.find(oh => oh.id === selectedOH)

  const upcomingOHs = openHouses.filter(oh => new Date(oh.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const pastOHs = openHouses.filter(oh => new Date(oh.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const totalVisitors = openHouses.reduce((sum, oh) => sum + oh.visitors.length, 0)
  const interestedVisitors = openHouses.reduce((sum, oh) => sum + oh.visitors.filter(v => v.interested).length, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Open Houses</h1>
          <p className="text-gray-500">Schedule and manage your open house events</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingOH(null); setShowModal(true) }}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Open House
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{upcomingOHs.length}</p>
          <p className="text-xs text-gray-500">Upcoming</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pastOHs.length}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalVisitors}</p>
          <p className="text-xs text-gray-500">Total Visitors</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{interestedVisitors}</p>
          <p className="text-xs text-gray-500">Interested Leads</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Open House List */}
        <div className="lg:col-span-2 space-y-4">
          {upcomingOHs.length > 0 && (
            <div className="bg-white rounded-xl border">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">Upcoming Open Houses</h2>
              </div>
              <div className="divide-y">
                {upcomingOHs.map(oh => (
                  <div
                    key={oh.id}
                    onClick={() => setSelectedOH(oh.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${selectedOH === oh.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{oh.property_address}</h3>
                        <p className="text-sm text-gray-500">{oh.property_city}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(oh.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {oh.start_time} - {oh.end_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {oh.visitors.length} visitors
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); copySignInLink(oh.id) }} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy sign-in link">
                          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(oh) }} className="p-2 hover:bg-gray-100 rounded-lg">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteOH(oh.id) }} className="p-2 hover:bg-red-100 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastOHs.length > 0 && (
            <div className="bg-white rounded-xl border">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">Past Open Houses</h2>
              </div>
              <div className="divide-y">
                {pastOHs.slice(0, 5).map(oh => (
                  <div
                    key={oh.id}
                    onClick={() => setSelectedOH(oh.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${selectedOH === oh.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{oh.property_address}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(oh.date).toLocaleDateString()} • {oh.visitors.length} visitors
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {openHouses.length === 0 && (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-medium text-gray-900 mb-2">No Open Houses</h3>
              <p className="text-gray-500 mb-4">Schedule your first open house event</p>
              <button
                onClick={() => { resetForm(); setShowModal(true) }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Schedule Open House
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedOpenHouse ? (
            <div className="bg-white rounded-xl border p-6 sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedOpenHouse.property_address}</h3>
                  <p className="text-sm text-gray-500">{selectedOpenHouse.property_city}</p>
                </div>
                <button onClick={() => setSelectedOH(null)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(selectedOpenHouse.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{selectedOpenHouse.start_time} - {selectedOpenHouse.end_time}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Visitors ({selectedOpenHouse.visitors.length})</h4>
                  <button
                    onClick={() => setShowVisitorModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedOpenHouse.visitors.map((visitor, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{visitor.name}</p>
                        {visitor.interested && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Interested</span>
                        )}
                      </div>
                      {visitor.email && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />{visitor.email}
                        </p>
                      )}
                      {visitor.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{visitor.phone}
                        </p>
                      )}
                    </div>
                  ))}
                  {selectedOpenHouse.visitors.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No visitors yet</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => copySignInLink(selectedOpenHouse.id)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Copy Sign-In Link
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-6 text-center text-gray-500">
              <Home className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Select an open house to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{editingOH ? 'Edit Open House' : 'Schedule Open House'}</h2>
              <button onClick={() => { setShowModal(false); setEditingOH(null) }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {properties.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
                  <select
                    value={formData.property_id}
                    onChange={(e) => {
                      const prop = properties.find(p => p.id === e.target.value)
                      setFormData(prev => ({
                        ...prev,
                        property_id: e.target.value,
                        property_address: prop?.address || '',
                        property_city: prop?.city || '',
                      }))
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select a listing --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.title || p.address}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={formData.property_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
                  placeholder="123 Main St"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.property_city}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_city: e.target.value }))}
                  placeholder="Naples"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex gap-3">
              <button onClick={() => { setShowModal(false); setEditingOH(null) }} className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={createOpenHouse}
                disabled={!formData.property_address || !formData.date || saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingOH ? 'Update' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Visitor Modal */}
      {showVisitorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Visitor</h2>
              <button onClick={() => setShowVisitorModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={visitorForm.email}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={visitorForm.phone}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visitorForm.interested}
                  onChange={(e) => setVisitorForm(prev => ({ ...prev, interested: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">Interested in property</span>
              </label>
            </div>
            <div className="border-t px-6 py-4 flex gap-3">
              <button onClick={() => setShowVisitorModal(false)} className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={addVisitor}
                disabled={!visitorForm.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add Visitor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
