'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  Star,
  User,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Eye,
  ChevronRight,
  TrendingUp,
  DollarSign,
  MapPin,
  MessageSquare,
  Camera,
  Video,
  AlertTriangle,
  CheckCircle,
  Users,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

interface Evaluation {
  id: string
  property_id: string
  agent_id: string
  overall_rating: number
  condition_rating: number
  pricing_rating: number
  location_rating: number
  investment_potential: number
  overall_notes: string
  condition_notes: string
  pricing_analysis: string
  potential_issues: string
  negotiation_notes: string
  seller_motivation: string
  recommended_for: string[]
  share_with_customer: boolean
  created_at: string
  properties?: {
    id: string
    address: string
    city: string
    state: string
    price: number
    photos: string[]
  }
  agent?: {
    id: string
    full_name: string
    avatar_url: string
    license_number: string
  }
}

export default function AgentEvaluationsPage() {
  const supabase = createClient()

  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')
  const [agentId, setAgentId] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setAgentId(user.id)

      const response = await fetch('/api/agent-feedback?limit=100')
      const data = await response.json()
      setEvaluations(data.evaluations || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = evaluations.filter(e => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!e.properties?.address?.toLowerCase().includes(q) && !e.properties?.city?.toLowerCase().includes(q) && !e.agent?.full_name?.toLowerCase().includes(q)) return false
    }
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating)
      if (e.overall_rating < rating) return false
    }
    return true
  })

  const formatPrice = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const avgRating = (e: Evaluation) => {
    const ratings = [e.overall_rating, e.condition_rating, e.pricing_rating, e.location_rating].filter(r => r > 0)
    return ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A'
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Evaluations</h1>
          <p className="text-gray-500">Agent feedback from all showings across the platform</p>
        </div>
        <div className="flex gap-2">
          <Link href="/walkthrough/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
            <MessageSquare className="w-4 h-4" />Add Evaluation
          </Link>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
          <p className="text-sm text-gray-500">Total Evaluations</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-gray-900">{new Set(evaluations.map(e => e.property_id)).size}</p>
          <p className="text-sm text-gray-500">Properties Reviewed</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-gray-900">{new Set(evaluations.map(e => e.agent_id)).size}</p>
          <p className="text-sm text-gray-500">Contributing Agents</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-gray-900">{evaluations.filter(e => e.agent_id === agentId).length}</p>
          <p className="text-sm text-gray-500">My Evaluations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by address, city, or agent..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="px-4 py-2 border rounded-lg bg-white">
          <option value="all">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Evaluations List */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.length > 0 ? filtered.map(evaluation => (
            <div key={evaluation.id} onClick={() => setSelectedEval(evaluation)} className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition ${selectedEval?.id === evaluation.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {evaluation.properties?.photos?.[0] ? (
                    <img src={evaluation.properties.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 m-auto mt-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{evaluation.properties?.address}</p>
                      <p className="text-sm text-gray-500">{evaluation.properties?.city}, {evaluation.properties?.state}</p>
                      <p className="text-sm font-medium text-blue-600">{formatPrice(evaluation.properties?.price || 0)}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{avgRating(evaluation)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {evaluation.agent?.full_name?.[0] || '?'}
                    </div>
                    <span className="text-sm text-gray-600">{evaluation.agent?.full_name}</span>
                    {evaluation.agent_id === agentId && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">You</span>}
                    <span className="text-xs text-gray-400">• {formatDate(evaluation.created_at)}</span>
                  </div>

                  {evaluation.overall_notes && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{evaluation.overall_notes}</p>
                  )}

                  {evaluation.recommended_for && evaluation.recommended_for.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {evaluation.recommended_for.slice(0, 3).map((r, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No evaluations found</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl border sticky top-6 h-fit">
          {selectedEval ? (
            <div>
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Evaluation Details</h2>
                <Link href={`/property/${selectedEval.property_id}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                  View Listing <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Property */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    {selectedEval.properties?.photos?.[0] && <img src={selectedEval.properties.photos[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedEval.properties?.address}</p>
                    <p className="text-sm text-gray-500">{selectedEval.properties?.city}</p>
                    <p className="text-sm font-medium text-blue-600">{formatPrice(selectedEval.properties?.price || 0)}</p>
                  </div>
                </div>

                {/* Agent */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedEval.agent?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedEval.agent?.full_name}</p>
                    <p className="text-xs text-gray-500">License: {selectedEval.agent?.license_number || 'N/A'}</p>
                  </div>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Overall', value: selectedEval.overall_rating },
                    { label: 'Condition', value: selectedEval.condition_rating },
                    { label: 'Pricing', value: selectedEval.pricing_rating },
                    { label: 'Location', value: selectedEval.location_rating },
                    { label: 'Investment', value: selectedEval.investment_potential },
                  ].map(r => (
                    <div key={r.label} className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">{r.label}</p>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= (r.value || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selectedEval.overall_notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Overview</p>
                    <p className="text-sm text-gray-700">{selectedEval.overall_notes}</p>
                  </div>
                )}

                {selectedEval.condition_notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Condition Notes</p>
                    <p className="text-sm text-gray-700">{selectedEval.condition_notes}</p>
                  </div>
                )}

                {selectedEval.pricing_analysis && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Pricing Analysis</p>
                    <p className="text-sm text-gray-700">{selectedEval.pricing_analysis}</p>
                  </div>
                )}

                {selectedEval.potential_issues && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-red-700 uppercase mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />Potential Issues
                    </p>
                    <p className="text-sm text-red-700">{selectedEval.potential_issues}</p>
                  </div>
                )}

                {selectedEval.seller_motivation && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Seller Motivation</p>
                    <p className="text-sm text-gray-700">{selectedEval.seller_motivation}</p>
                  </div>
                )}

                {selectedEval.negotiation_notes && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-green-700 uppercase mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />Negotiation Tips
                    </p>
                    <p className="text-sm text-green-700">{selectedEval.negotiation_notes}</p>
                  </div>
                )}

                {selectedEval.recommended_for && selectedEval.recommended_for.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recommended For</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEval.recommended_for.map((r, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{r}</span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 pt-2">Evaluated on {formatDate(selectedEval.created_at)}</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select an evaluation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
