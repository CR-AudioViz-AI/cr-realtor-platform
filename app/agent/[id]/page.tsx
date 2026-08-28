'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Phone,
  Mail,
  MapPin,
  Award,
  Star,
  Home,
  Calendar,
  MessageSquare,
  ChevronLeft,
  Bed,
  Bath,
  Square,
  Building2,
  Loader2,
  Shield,
  Clock,
  TrendingUp,
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
  created_at: string
}

interface Property {
  id: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  property_type: string
  photos: string[]
  status: string
}

interface Review {
  id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
}

export default function AgentProfilePage() {
  const params = useParams()
  const supabase = createClient()
  const agentId = params.id as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [listings, setListings] = useState<Property[]>([])
  const [soldProperties, setSoldProperties] = useState<Property[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('listings')
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAgent()
  }, [agentId])

  async function loadAgent() {
    try {
      // Load agent profile
      const { data: agentData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', agentId)
        .single()

      if (error) throw error
      setAgent(agentData as Agent)

      // Load agent's active listings
      const { data: activeListings } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_agent_id', agentId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      setListings((activeListings || []) as Property[])

      // Load agent's sold properties
      const { data: sold } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_agent_id', agentId)
        .eq('status', 'sold')
        .order('created_at', { ascending: false })
        .limit(10)

      setSoldProperties((sold || []) as Property[])

      // Load reviews (if table exists)
      const { data: agentReviews } = await supabase
        .from('agent_reviews')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (agentReviews) {
        setReviews(agentReviews as Review[])
      }

    } catch (error) {
      console.error('Error loading agent:', error)
    } finally {
      setLoading(false)
    }
  }

  async function submitContact() {
    if (!contactForm.name || !contactForm.email) return
    setSubmitting(true)

    try {
      await supabase.from('leads').insert({
        full_name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        source: 'agent_profile',
        status: 'new',
        notes: `Agent Profile Contact: ${contactForm.message}`,
        assigned_to: agentId,
        created_at: new Date().toISOString()
      })

      setShowContactForm(false)
      setContactForm({ name: '', email: '', phone: '', message: '' })
      alert('Message sent! The agent will contact you shortly.')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'

  // Calculate stats
  const totalVolume = [...listings, ...soldProperties].reduce((acc, p) => acc + p.price, 0)
  const avgPrice = listings.length > 0 ? listings.reduce((acc, p) => acc + p.price, 0) / listings.length : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Agent not found</p>
          <Link href="/agents" className="text-blue-600">Browse all agents</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/agents" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-5 h-5" />
            All Agents
          </Link>
        </div>
      </header>

      {/* Agent Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold shadow-xl">
              {agent.avatar_url ? (
                <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                agent.full_name?.[0]?.toUpperCase() || 'A'
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">{agent.full_name}</h1>
              <p className="text-blue-100 mb-4">Licensed Real Estate Agent</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                {agent.license_number && (
                  <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4" />
                    License #{agent.license_number}
                  </span>
                )}
                {agent.years_experience && (
                  <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    {agent.years_experience} Years Experience
                  </span>
                )}
                <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {avgRating} ({reviews.length} reviews)
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowContactForm(true)}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Contact {agent.full_name.split(' ')[0]}
              </button>
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition flex items-center gap-2 justify-center"
                >
                  <Phone className="w-5 h-5" />
                  {agent.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
              <p className="text-sm text-gray-500">Active Listings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{soldProperties.length}</p>
              <p className="text-sm text-gray-500">Properties Sold</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{formatPrice(totalVolume)}</p>
              <p className="text-sm text-gray-500">Total Volume</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{formatPrice(avgPrice)}</p>
              <p className="text-sm text-gray-500">Avg. List Price</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About {agent.full_name.split(' ')[0]}</h2>
              <p className="text-gray-600 leading-relaxed">
                {agent.bio || `${agent.full_name} is a dedicated real estate professional committed to helping clients achieve their property goals. With extensive knowledge of the local market and a passion for exceptional service, ${agent.full_name.split(' ')[0]} works tirelessly to ensure every client has a smooth and successful real estate experience.`}
              </p>
              
              {agent.specialties && agent.specialties.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialties.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {agent.service_areas && agent.service_areas.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Service Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.service_areas.map((a, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        <MapPin className="w-3 h-3" />{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border">
              <div className="border-b px-2">
                <div className="flex gap-4">
                  {[
                    { id: 'listings', label: 'Active Listings', count: listings.length },
                    { id: 'sold', label: 'Recently Sold', count: soldProperties.length },
                    { id: 'reviews', label: 'Reviews', count: reviews.length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-4 font-medium text-sm border-b-2 transition ${
                        activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'listings' && (
                  <div className="space-y-4">
                    {listings.length > 0 ? listings.map(property => (
                      <Link key={property.id} href={`/property/${property.id}`} className="flex gap-4 p-4 border rounded-xl hover:shadow-md transition">
                        <div className="w-32 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          {property.photos?.[0] ? (
                            <img src={property.photos[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Building2 className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</p>
                          <p className="text-gray-600">{property.address}</p>
                          <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                          <div className="flex gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.bedrooms}</span>
                            <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{property.bathrooms}</span>
                            <span className="flex items-center gap-1"><Square className="w-4 h-4" />{property.sqft?.toLocaleString()}</span>
                          </div>
                        </div>
                      </Link>
                    )) : (
                      <p className="text-center text-gray-500 py-8">No active listings</p>
                    )}
                  </div>
                )}

                {activeTab === 'sold' && (
                  <div className="space-y-4">
                    {soldProperties.length > 0 ? soldProperties.map(property => (
                      <div key={property.id} className="flex gap-4 p-4 border rounded-xl">
                        <div className="w-32 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                          {property.photos?.[0] ? (
                            <img src={property.photos[0]} alt="" className="w-full h-full object-cover rounded-lg opacity-80" />
                          ) : (
                            <Building2 className="w-8 h-8 text-gray-400" />
                          )}
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded">SOLD</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</p>
                          <p className="text-gray-600">{property.address}</p>
                          <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-gray-500 py-8">No sold properties to display</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.length > 0 ? reviews.map(review => (
                      <div key={review.id} className="p-4 border rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{review.customer_name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No reviews yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl border p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact {agent.full_name.split(' ')[0]}</h3>
              <div className="space-y-3">
                {agent.email && (
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{agent.email}</span>
                  </a>
                )}
                {agent.phone && (
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{agent.phone}</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setShowContactForm(true)}
                className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Send a Message
              </button>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Top Producer</p>
                    <p className="text-xs text-gray-500">2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Million Dollar Agent</p>
                    <p className="text-xs text-gray-500">5+ Years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">5-Star Service</p>
                    <p className="text-xs text-gray-500">Consistently Rated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Message {agent.full_name.split(' ')[0]}</h2>
              <button onClick={() => setShowContactForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">×</button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} placeholder="Your Name *" className="w-full px-4 py-2 border rounded-lg" />
              <input type="email" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="Email *" className="w-full px-4 py-2 border rounded-lg" />
              <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="w-full px-4 py-2 border rounded-lg" />
              <textarea value={contactForm.message} onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))} placeholder="Your message..." rows={4} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="border-t px-6 py-4 flex gap-3">
              <button onClick={() => setShowContactForm(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={submitContact} disabled={!contactForm.name || !contactForm.email || submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
