'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Star,
  Home,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  Award,
  Filter,
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

interface Agent {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  license_number?: string
  bio?: string
  specialties?: string[]
  service_areas?: string[]
  years_experience?: number
  total_sales?: number
  listings_count?: number
}

export default function AgentsListPage() {
  const supabase = createClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('')

  const serviceAreas = ['All Areas', 'Naples', 'Fort Myers', 'Bonita Springs', 'Cape Coral', 'Marco Island', 'Estero']

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    try {
      // Load all agents (profiles with role = agent)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .order('full_name')

      if (error) throw error

      // Get listing counts for each agent
      const agentsWithCounts = await Promise.all((data || []).map(async (agent: Agent) => {
        const { count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('listing_agent_id', agent.id)
          .eq('status', 'active')

        return { ...agent, listings_count: count || 0 }
      }))

      setAgents(agentsWithCounts)
    } catch (error) {
      console.error('Error loading agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = agents.filter(agent => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!agent.full_name?.toLowerCase().includes(q) && 
          !agent.specialties?.some(s => s.toLowerCase().includes(q))) {
        return false
      }
    }
    if (selectedArea && selectedArea !== 'All Areas') {
      if (!agent.service_areas?.includes(selectedArea)) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CR Realty</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/search" className="text-gray-600 hover:text-blue-600">Properties</Link>
              <Link href="/customer/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Meet Our Agents</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Work with Southwest Florida's most experienced real estate professionals
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or specialty..."
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="pl-12 pr-8 py-3 border rounded-xl bg-white appearance-none min-w-[200px]"
              >
                {serviceAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(agent => (
              <div key={agent.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition group">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {agent.avatar_url ? (
                        <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        agent.full_name?.[0]?.toUpperCase() || 'A'
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{agent.full_name}</h3>
                      <p className="text-sm text-gray-500">Licensed Agent</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">5.0</span>
                        <span className="text-sm text-gray-400">(Reviews)</span>
                      </div>
                    </div>
                  </div>

                  {agent.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.specialties?.slice(0, 3).map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{s}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {agent.listings_count || 0} Listings
                    </span>
                    {agent.years_experience && (
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {agent.years_experience} Years
                      </span>
                    )}
                  </div>

                  {agent.service_areas && agent.service_areas.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{agent.service_areas.slice(0, 2).join(', ')}</span>
                    </div>
                  )}

                  <div className="border-t pt-4 flex gap-2">
                    <Link
                      href={`/agent/${agent.id}`}
                      className="flex-1 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      View Profile
                    </Link>
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="p-2 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <Phone className="w-5 h-5 text-gray-600" />
                      </a>
                    )}
                    <a
                      href={`mailto:${agent.email}`}
                      className="p-2 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <Mail className="w-5 h-5 text-gray-600" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-gray-900 mb-2">No Agents Found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-blue-100 mb-8">
            Our agents are standing by to help you find the perfect property in Southwest Florida.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition"
          >
            <Home className="w-5 h-5" />
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  )
}
