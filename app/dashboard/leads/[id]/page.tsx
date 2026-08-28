'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  MessageSquare,
  Clock,
  Tag,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<any>(null)
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadLead() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (!error && data) {
        setLead(data)
      }
      setLoading(false)
    }

    if (leadId) {
      loadLead()
    }
  }, [leadId])

  const updateStatus = async (newStatus: string) => {
    setSaving(true)
    await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId)
    
    setLead((prev: any) => ({ ...prev, status: newStatus }))
    setSaving(false)
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    setSaving(true)
    
    const currentNotes = lead.notes || ''
    const timestamp = new Date().toLocaleString()
    const updatedNotes = `${currentNotes}\n\n[${timestamp}]\n${newNote}`.trim()
    
    await supabase
      .from('leads')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', leadId)
    
    setLead((prev: any) => ({ ...prev, notes: updatedNotes }))
    setNewNote('')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Lead Not Found</h2>
        <Link href="/dashboard/leads" className="text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back to Leads
        </Link>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    qualified: 'bg-emerald-100 text-emerald-700',
    proposal: 'bg-purple-100 text-purple-700',
    closed: 'bg-gray-100 text-gray-700',
  }

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.full_name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status] || statusColors.new}`}>
                {lead.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[lead.priority] || priorityColors.medium}`}>
                {lead.priority} priority
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{lead.email}</span>
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{lead.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Notes & History</h2>
            
            {lead.notes ? (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 whitespace-pre-wrap text-gray-700 text-sm">
                {lead.notes}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No notes yet.</p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
              />
              <button
                onClick={addNote}
                disabled={saving || !newNote.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="space-y-2">
              {['new', 'contacted', 'qualified', 'proposal', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={saving || lead.status === status}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl text-left transition ${
                    lead.status === status
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {lead.status === status && <CheckCircle className="w-4 h-4" />}
                  <span className="capitalize">{status}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="font-medium">{lead.source || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span className="font-medium">
                  {new Date(lead.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
