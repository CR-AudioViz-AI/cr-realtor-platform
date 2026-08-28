'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Clock, Calendar, Bell, Check, AlertCircle, Plus, Trash2,
  Mail, Phone, MessageSquare, Home, User, Loader2
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface FollowUp {
  id: string
  contact_id?: string
  contact_name: string
  contact_email?: string
  contact_phone?: string
  follow_up_type: 'email' | 'call' | 'text' | 'showing'
  due_date: string
  due_time?: string
  notes?: string
  status: 'pending' | 'completed' | 'overdue'
  property_id?: string
  property_address?: string
  created_at: string
}

interface FollowUpSchedulerProps {
  className?: string
}

const FOLLOW_UP_PRESETS = [
  { label: 'In 1 Hour', hours: 1 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 Days', days: 3 },
  { label: 'In 1 Week', days: 7 },
  { label: 'In 2 Weeks', days: 14 },
  { label: 'In 1 Month', days: 30 },
]

const TYPE_CONFIG = {
  email: { icon: Mail, color: 'bg-blue-100 text-blue-700', label: 'Email' },
  call: { icon: Phone, color: 'bg-green-100 text-green-700', label: 'Call' },
  text: { icon: MessageSquare, color: 'bg-purple-100 text-purple-700', label: 'Text' },
  showing: { icon: Home, color: 'bg-orange-100 text-orange-700', label: 'Showing' },
}

export default function FollowUpScheduler({ className = '' }: FollowUpSchedulerProps) {
  const supabase = createClient()
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    follow_up_type: 'call' as FollowUp['follow_up_type'],
    due_date: '',
    due_time: '09:00',
    notes: '',
    property_address: ''
  })

  useEffect(() => {
    loadFollowUps()
  }, [])

  async function loadFollowUps() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('agent_id', user.id)
      .order('due_date', { ascending: true })

    if (!error && data) {
      // Update status based on due date
      const now = new Date()
      const updated = data.map(f => ({
        ...f,
        status: f.status === 'completed' ? 'completed' :
                new Date(f.due_date) < now ? 'overdue' : 'pending'
      }))
      setFollowUps(updated as FollowUp[])
    }
    setLoading(false)
  }

  const setPresetDate = (preset: typeof FOLLOW_UP_PRESETS[0]) => {
    const date = new Date()
    if (preset.hours) date.setHours(date.getHours() + preset.hours)
    if (preset.days) date.setDate(date.getDate() + preset.days)
    setFormData({ ...formData, due_date: date.toISOString().split('T')[0] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('follow_ups').insert({
      agent_id: user.id,
      contact_name: formData.contact_name,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
      follow_up_type: formData.follow_up_type,
      due_date: formData.due_date,
      due_time: formData.due_time || null,
      notes: formData.notes || null,
      property_address: formData.property_address || null,
      status: 'pending'
    })

    if (!error) {
      setShowForm(false)
      setFormData({
        contact_name: '', contact_email: '', contact_phone: '',
        follow_up_type: 'call', due_date: '', due_time: '09:00',
        notes: '', property_address: ''
      })
      loadFollowUps()
    }
    setSaving(false)
  }

  const markComplete = async (id: string) => {
    await supabase.from('follow_ups').update({ status: 'completed' }).eq('id', id)
    loadFollowUps()
  }

  const deleteFollowUp = async (id: string) => {
    if (!confirm('Delete this follow-up?')) return
    await supabase.from('follow_ups').delete().eq('id', id)
    loadFollowUps()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const pendingCount = followUps.filter(f => f.status === 'pending').length
  const overdueCount = followUps.filter(f => f.status === 'overdue').length

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border p-6 ${className}`}>
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="animate-spin text-blue-600" size={24} />
          <span>Loading follow-ups...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Bell className="text-blue-600" size={20} /> Follow-Up Reminders
          </h3>
          <div className="flex gap-3 text-sm mt-1">
            <span className="text-gray-500">{pendingCount} pending</span>
            {overdueCount > 0 && (
              <span className="text-red-600 font-medium">{overdueCount} overdue!</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Add Follow-Up
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Name *</label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                required
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.follow_up_type}
                onChange={(e) => setFormData({...formData, follow_up_type: e.target.value as any})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="call">📞 Phone Call</option>
                <option value="email">✉️ Email</option>
                <option value="text">💬 Text Message</option>
                <option value="showing">🏠 Schedule Showing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Due Date *</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {FOLLOW_UP_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPresetDate(preset)}
                  className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                required
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="time"
                value={formData.due_time}
                onChange={(e) => setFormData({...formData, due_time: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="What to discuss..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {saving ? 'Saving...' : 'Save Follow-Up'}
            </button>
          </div>
        </form>
      )}

      {/* Follow-Up List */}
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {followUps.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="mx-auto mb-2" size={32} />
            <p>No follow-ups scheduled</p>
          </div>
        ) : (
          followUps.map(followUp => {
            const config = TYPE_CONFIG[followUp.follow_up_type]
            const Icon = config.icon
            
            return (
              <div key={followUp.id} className={`p-4 ${followUp.status === 'overdue' ? 'bg-red-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{followUp.contact_name}</h4>
                      {followUp.status === 'overdue' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
                      )}
                      {followUp.status === 'completed' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {config.label} • {formatDate(followUp.due_date)} {followUp.due_time && `at ${followUp.due_time}`}
                    </p>
                    {followUp.notes && <p className="text-sm text-gray-600 mt-1">{followUp.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    {followUp.status !== 'completed' && (
                      <button
                        onClick={() => markComplete(followUp.id)}
                        className="p-2 hover:bg-green-100 rounded-lg"
                        title="Mark complete"
                      >
                        <Check size={18} className="text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteFollowUp(followUp.id)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
