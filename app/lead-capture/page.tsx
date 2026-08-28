'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Check,
  Loader2,
  ChevronDown,
  DollarSign,
  MapPin,
  Calendar,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface LeadCaptureProps {
  agentId?: string
  propertyId?: string
  propertyAddress?: string
  source?: string
}

export default function LeadCapturePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    message: '',
    buyer_type: 'buyer',
    budget_min: '',
    budget_max: '',
    timeline: 'flexible',
    preferred_areas: '',
    property_types: [] as string[],
    source: 'website',
  })

  const propertyTypes = [
    'Single Family',
    'Condo',
    'Townhouse',
    'Villa',
    'Waterfront',
    'Luxury',
    'Investment',
    'New Construction',
  ]

  const timelines = [
    { id: 'asap', label: 'ASAP' },
    { id: '1-3months', label: '1-3 Months' },
    { id: '3-6months', label: '3-6 Months' },
    { id: '6-12months', label: '6-12 Months' },
    { id: 'flexible', label: 'Just Browsing' },
  ]

  const togglePropertyType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      property_types: prev.property_types.includes(type)
        ? prev.property_types.filter(t => t !== type)
        : [...prev.property_types, type]
    }))
  }

  const submitLead = async () => {
    if (!formData.full_name || !formData.email) return
    
    setLoading(true)

    // Save to localStorage as backup
    const existingLeads = JSON.parse(localStorage.getItem('cr_captured_leads') || '[]')
    const newLead = {
      id: crypto.randomUUID(),
      ...formData,
      status: 'new',
      priority: formData.timeline === 'asap' ? 'high' : 'medium',
      created_at: new Date().toISOString(),
    }
    localStorage.setItem('cr_captured_leads', JSON.stringify([...existingLeads, newLead]))

    // Also try to save to Supabase
    try {
      await supabase.from('realtor_leads').insert({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        source: formData.source,
        status: 'new',
        priority: formData.timeline === 'asap' ? 'high' : 'medium',
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        property_type: formData.property_types.join(', '),
        preferred_areas: formData.preferred_areas,
      })
    } catch (error) {
      console.log('Lead saved locally, database save failed:', error)
    }

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your information has been submitted. We&apos;ll be in touch within 24 hours to help you find your perfect home.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setFormData({
                full_name: '',
                email: '',
                phone: '',
                message: '',
                buyer_type: 'buyer',
                budget_min: '',
                budget_max: '',
                timeline: 'flexible',
                preferred_areas: '',
                property_types: [],
                source: 'website',
              })
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Dream Home</h1>
          <p className="text-gray-600">Tell us what you&apos;re looking for and we&apos;ll help you find the perfect property</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Buyer Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
            {['buyer', 'seller', 'both'].map(type => (
              <button
                key={type}
                onClick={() => setFormData(prev => ({ ...prev, buyer_type: type }))}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition capitalize ${
                  formData.buyer_type === type
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type === 'both' ? 'Buy & Sell' : `I'm a ${type}`}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="John Smith"
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Budget Range */}
            {formData.buyer_type !== 'seller' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
                      placeholder="Min"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
                      placeholder="Max"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
              <div className="flex flex-wrap gap-2">
                {timelines.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, timeline: t.id }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      formData.timeline === t.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Types */}
            {formData.buyer_type !== 'seller' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Types Interested In</label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => togglePropertyType(type)}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${
                        formData.property_types.includes(type)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Areas</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.preferred_areas}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_areas: e.target.value }))}
                  placeholder="e.g., Naples, Fort Myers, Bonita Springs"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  placeholder="Tell us more about what you're looking for..."
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={submitLead}
              disabled={!formData.full_name || !formData.email || loading}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Get Started
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By submitting, you agree to be contacted about real estate services. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
