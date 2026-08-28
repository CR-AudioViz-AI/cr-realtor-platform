'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Camera,
  Video,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Upload,
  MapPin,
  Home,
  Send,
  Loader2,
  Trash2,
  Play,
  Pause,
  FileText,
  Folder,
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

interface Property {
  id: string
  address: string
  city: string
  state: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  photos: string[]
}

interface MediaItem {
  id: string
  type: 'photo' | 'video'
  url: string
  caption: string
  room: string
  issue: boolean
  duration?: number
}

export default function MobileWalkthroughPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const propertyId = params.id as string
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [showingId, setShowingId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [notification, setNotification] = useState<string | null>(null)
  const [userType, setUserType] = useState<'customer' | 'agent'>('customer')

  // Media
  const [media, setMedia] = useState<MediaItem[]>([])
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; category: string }>>([])
  
  // Ratings
  const [ratings, setRatings] = useState({
    overall: 0, location: 0, condition: 0, value: 0, layout: 0
  })
  
  // Comments
  const [comments, setComments] = useState({
    likes: '', dislikes: '', questions: '', overall: '',
    // Agent-specific fields
    condition_notes: '', pricing_analysis: '', neighborhood_notes: '',
    seller_motivation: '', potential_issues: '', negotiation_notes: ''
  })
  
  // Interest
  const [interest, setInterest] = useState({ level: '', wouldRevisit: false })
  
  // Agent-specific
  const [agentFields, setAgentFields] = useState({
    investment_potential: 0,
    recommended_for: [] as string[],
    share_with_customer: false
  })

  const rooms = ['Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3', 'Bathroom', 'Master Bath', 'Backyard', 'Garage', 'Basement', 'Attic', 'Exterior', 'Other']
  const docCategories = ['Inspection', 'HOA', 'Title', 'Mortgage', 'Appraisal', 'Insurance', 'Utility Bills', 'Contract', 'Disclosure', 'Notes', 'Other']
  const buyerTypes = ['First-Time Buyer', 'Investor', 'Family', 'Retiree', 'Downsizing', 'Luxury', 'Fixer-Upper']

  useEffect(() => { loadData() }, [propertyId])

  async function loadData() {
    try {
      const { data: prop } = await supabase.from('properties').select('*').eq('id', propertyId).single()
      if (prop) setProperty(prop as Property)

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Check if agent
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        
        if (profile && (profile as { role: string }).role === 'agent') {
          setUserType('agent')
          setAgentId(session.user.id)
        } else {
          // Check if customer
          const { data: customer } = await supabase.from('customers').select('id, assigned_agent_id').eq('id', session.user.id).single()
          if (customer) {
            const c = customer as { id: string; assigned_agent_id?: string }
            setCustomerId(c.id)
            setAgentId(c.assigned_agent_id || null)
            setUserType('customer')
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file)
      setMedia(prev => [...prev, { id: `photo-${Date.now()}-${Math.random()}`, type: 'photo', url, caption: '', room: '', issue: false }])
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file)
      // Get video duration
      const video = document.createElement('video')
      video.src = url
      video.onloadedmetadata = () => {
        setMedia(prev => [...prev, { id: `video-${Date.now()}-${Math.random()}`, type: 'video', url, caption: '', room: '', issue: false, duration: Math.round(video.duration) }])
      }
    }
  }

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file)
      setDocuments(prev => [...prev, { name: file.name, url, category: 'Other' }])
    }
  }

  function updateMedia(id: string, updates: Partial<MediaItem>) {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  function removeMedia(id: string) {
    setMedia(prev => prev.filter(m => m.id !== id))
  }

  function RatingStars({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
    return (
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => onChange(star)} className="p-1 active:scale-110">
              <Star className={`w-9 h-9 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  async function submitFeedback() {
    if (!propertyId) return
    setSubmitting(true)

    try {
      const photos = media.filter(m => m.type === 'photo').map(m => ({ url: m.url, caption: m.caption, room: m.room, issue: m.issue }))
      const videos = media.filter(m => m.type === 'video').map(m => ({ url: m.url, title: m.caption, duration: m.duration }))

      if (userType === 'customer') {
        // Customer feedback
        await fetch('/api/walkthrough', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: propertyId,
            customer_id: customerId,
            agent_id: agentId,
            showing_id: showingId,
            overall_rating: ratings.overall,
            location_rating: ratings.location,
            condition_rating: ratings.condition,
            value_rating: ratings.value,
            layout_rating: ratings.layout,
            overall_comments: comments.overall,
            likes: comments.likes,
            dislikes: comments.dislikes,
            questions: comments.questions,
            photos,
            videos,
            interest_level: interest.level,
            would_revisit: interest.wouldRevisit,
          })
        })
      } else {
        // Agent evaluation
        await fetch('/api/agent-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: propertyId,
            agent_id: agentId,
            showing_id: showingId,
            overall_rating: ratings.overall,
            condition_rating: ratings.condition,
            pricing_rating: ratings.value,
            location_rating: ratings.location,
            investment_potential: agentFields.investment_potential,
            overall_notes: comments.overall,
            condition_notes: comments.condition_notes,
            pricing_analysis: comments.pricing_analysis,
            neighborhood_notes: comments.neighborhood_notes,
            seller_motivation: comments.seller_motivation,
            potential_issues: comments.potential_issues,
            negotiation_notes: comments.negotiation_notes,
            recommended_for: agentFields.recommended_for,
            photos,
            videos,
            share_with_customer: agentFields.share_with_customer,
          })
        })
      }

      // Upload documents
      for (const doc of documents) {
        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: propertyId,
            customer_id: customerId,
            agent_id: agentId,
            uploaded_by: userType === 'customer' ? customerId : agentId,
            owner_type: userType,
            file_url: doc.url,
            file_name: doc.name,
            file_type: 'document',
            category: doc.category.toLowerCase().replace(' ', '_'),
            share_with_agent: userType === 'customer',
            share_with_customer: userType === 'agent' && agentFields.share_with_customer,
            visible_to_all_agents: userType === 'agent',
          })
        })
      }

      setNotification('Feedback submitted! Your ' + (userType === 'customer' ? 'agent' : 'notes') + ' have been saved.')
      setTimeout(() => router.push(userType === 'customer' ? '/customer/dashboard?tab=showings' : '/dashboard/activity'), 2000)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  const totalSteps = userType === 'agent' ? 6 : 5

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />{notification}
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="p-2 -ml-2"><ChevronLeft className="w-6 h-6" /></button>
            <div className="text-center flex-1">
              <p className="font-semibold text-gray-900 truncate">{property?.address}</p>
              <p className="text-xs text-gray-500">{userType === 'agent' ? 'Agent Evaluation' : 'Walkthrough Feedback'}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${userType === 'agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {userType === 'agent' ? 'Agent' : 'Buyer'}
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </header>

      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            {property?.photos?.[0] ? <img src={property.photos[0]} alt="" className="w-full h-full object-cover" /> : <Home className="w-8 h-8 m-auto mt-4 text-gray-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg text-gray-900">{formatPrice(property?.price || 0)}</p>
            <p className="text-sm text-gray-600">{property?.bedrooms} bed • {property?.bathrooms} bath • {property?.sqft?.toLocaleString()} sqft</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Step 1: Photos & Videos */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">📸 Capture Media</h2>
            <p className="text-sm text-gray-500 mb-4">Take photos and videos of the property</p>

            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoUpload} className="hidden" />
            <input ref={videoInputRef} type="file" accept="video/*" capture="environment" onChange={handleVideoUpload} className="hidden" />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => photoInputRef.current?.click()} className="py-4 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 flex flex-col items-center gap-2 text-blue-600">
                <Camera className="w-8 h-8" /><span className="font-medium">Photo</span>
              </button>
              <button onClick={() => videoInputRef.current?.click()} className="py-4 border-2 border-dashed border-red-300 rounded-xl bg-red-50 flex flex-col items-center gap-2 text-red-600">
                <Video className="w-8 h-8" /><span className="font-medium">Video</span>
              </button>
            </div>

            {media.length > 0 && (
              <div className="space-y-3">
                {media.map(item => (
                  <div key={item.id} className="bg-white rounded-xl border overflow-hidden">
                    <div className="relative">
                      {item.type === 'photo' ? (
                        <img src={item.url} alt="" className="w-full h-40 object-cover" />
                      ) : (
                        <div className="relative">
                          <video src={item.url} className="w-full h-40 object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                          {item.duration && <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</span>}
                        </div>
                      )}
                      <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded ${item.type === 'video' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {item.type === 'video' ? 'VIDEO' : 'PHOTO'}
                      </span>
                      <button onClick={() => removeMedia(item.id)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 space-y-2">
                      <select value={item.room} onChange={(e) => updateMedia(item.id, { room: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="">Select Room</option>
                        {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <input type="text" value={item.caption} onChange={(e) => updateMedia(item.id, { caption: e.target.value })} placeholder="Add caption..." className="w-full px-3 py-2 border rounded-lg text-sm" />
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={item.issue} onChange={(e) => updateMedia(item.id, { issue: e.target.checked })} className="w-5 h-5 rounded text-red-600" />
                        <span className="text-sm text-red-600">Flag as issue/concern</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 text-center mt-4">{media.length} media items • You can skip if none needed</p>
          </div>
        )}

        {/* Step 2: Documents (for both) */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">📄 Documents</h2>
            <p className="text-sm text-gray-500 mb-4">Upload inspection reports, HOA docs, or any other files</p>

            <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.png" multiple onChange={handleDocUpload} className="hidden" />

            <button onClick={() => docInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center gap-2 text-gray-600 mb-4">
              <Upload className="w-6 h-6" />Upload Documents
            </button>

            {documents.length > 0 && (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="bg-white rounded-xl border p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <span className="flex-1 truncate font-medium">{doc.name}</span>
                      <button onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))} className="p-1 text-red-500"><X className="w-5 h-5" /></button>
                    </div>
                    <select value={doc.category} onChange={(e) => {
                      const newDocs = [...documents]
                      newDocs[index].category = e.target.value
                      setDocuments(newDocs)
                    }} className="w-full px-3 py-2 border rounded-lg text-sm">
                      {docCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Ratings */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">⭐ Rate This Property</h2>
            <RatingStars label="Overall Impression" value={ratings.overall} onChange={(v) => setRatings(p => ({ ...p, overall: v }))} />
            <RatingStars label="Location & Neighborhood" value={ratings.location} onChange={(v) => setRatings(p => ({ ...p, location: v }))} />
            <RatingStars label="Property Condition" value={ratings.condition} onChange={(v) => setRatings(p => ({ ...p, condition: v }))} />
            <RatingStars label="Value for Price" value={ratings.value} onChange={(v) => setRatings(p => ({ ...p, value: v }))} />
            <RatingStars label="Layout & Flow" value={ratings.layout} onChange={(v) => setRatings(p => ({ ...p, layout: v }))} />
            
            {userType === 'agent' && (
              <RatingStars label="Investment Potential" value={agentFields.investment_potential} onChange={(v) => setAgentFields(p => ({ ...p, investment_potential: v }))} />
            )}
          </div>
        )}

        {/* Step 4: Comments */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Your Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><ThumbsUp className="w-5 h-5 text-green-500" />What's Great?</label>
                <textarea value={comments.likes} onChange={(e) => setComments(p => ({ ...p, likes: e.target.value }))} placeholder="Great features, selling points..." rows={3} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><ThumbsDown className="w-5 h-5 text-red-500" />Concerns?</label>
                <textarea value={comments.dislikes} onChange={(e) => setComments(p => ({ ...p, dislikes: e.target.value }))} placeholder="Issues, drawbacks..." rows={3} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              
              {userType === 'customer' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><HelpCircle className="w-5 h-5 text-blue-500" />Questions for Agent?</label>
                  <textarea value={comments.questions} onChange={(e) => setComments(p => ({ ...p, questions: e.target.value }))} placeholder="Anything you want to know..." rows={3} className="w-full px-3 py-2 border rounded-xl text-sm" />
                </div>
              )}

              {userType === 'agent' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Pricing Analysis</label>
                    <textarea value={comments.pricing_analysis} onChange={(e) => setComments(p => ({ ...p, pricing_analysis: e.target.value }))} placeholder="Is it priced right? Comparable sales..." rows={2} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Seller Motivation</label>
                    <textarea value={comments.seller_motivation} onChange={(e) => setComments(p => ({ ...p, seller_motivation: e.target.value }))} placeholder="Why are they selling? Flexibility..." rows={2} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Potential Issues to Investigate</label>
                    <textarea value={comments.potential_issues} onChange={(e) => setComments(p => ({ ...p, potential_issues: e.target.value }))} placeholder="Items for inspection, concerns..." rows={2} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Negotiation Notes</label>
                    <textarea value={comments.negotiation_notes} onChange={(e) => setComments(p => ({ ...p, negotiation_notes: e.target.value }))} placeholder="Leverage points, strategy..." rows={2} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Interest (Customer) or Recommendations (Agent) */}
        {step === 5 && (
          <div>
            {userType === 'customer' ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">❤️ Your Interest</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { value: 'not_interested', label: 'Not Interested', icon: '😐', color: 'bg-gray-100' },
                    { value: 'maybe', label: 'Maybe', icon: '🤔', color: 'bg-yellow-100' },
                    { value: 'interested', label: 'Interested', icon: '😊', color: 'bg-blue-100' },
                    { value: 'very_interested', label: 'Very Interested', icon: '😍', color: 'bg-green-100' },
                    { value: 'ready_to_offer', label: 'Ready to Offer!', icon: '🔥', color: 'bg-red-100' },
                  ].map(option => (
                    <button key={option.value} onClick={() => setInterest(p => ({ ...p, level: option.value }))} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${interest.level === option.value ? 'border-blue-500 ' + option.color : 'border-gray-200 bg-white'}`}>
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                      {interest.level === option.value && <Check className="w-5 h-5 text-blue-600 ml-auto" />}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border">
                  <input type="checkbox" checked={interest.wouldRevisit} onChange={(e) => setInterest(p => ({ ...p, wouldRevisit: e.target.checked }))} className="w-6 h-6 rounded" />
                  <span className="font-medium">I'd like to visit again</span>
                </label>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Recommended For</h2>
                <p className="text-sm text-gray-500 mb-4">What type of buyers would this property suit?</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {buyerTypes.map(type => (
                    <button key={type} onClick={() => setAgentFields(p => ({ ...p, recommended_for: p.recommended_for.includes(type) ? p.recommended_for.filter(t => t !== type) : [...p.recommended_for, type] }))} className={`px-4 py-2 rounded-full border ${agentFields.recommended_for.includes(type) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border">
                  <input type="checkbox" checked={agentFields.share_with_customer} onChange={(e) => setAgentFields(p => ({ ...p, share_with_customer: e.target.checked }))} className="w-6 h-6 rounded" />
                  <span className="font-medium">Share this evaluation with customer</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">Note: Your evaluation will be visible to all agents using the platform</p>
              </>
            )}
          </div>
        )}

        {/* Step 6: Review (only for agents, customers skip to submit at step 5) */}
        {step === totalSteps && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Review & Submit</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-medium text-gray-900 mb-2">Media ({media.length})</h3>
                {media.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto">{media.map(m => (
                    <div key={m.id} className="relative flex-shrink-0">
                      {m.type === 'photo' ? <img src={m.url} alt="" className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center"><Video className="w-6 h-6 text-gray-500" /></div>}
                    </div>
                  ))}</div>
                ) : <p className="text-sm text-gray-500">No media</p>}
              </div>
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-medium text-gray-900 mb-2">Documents ({documents.length})</h3>
                {documents.length > 0 ? documents.map((d, i) => <p key={i} className="text-sm text-gray-600">• {d.name} ({d.category})</p>) : <p className="text-sm text-gray-500">No documents</p>}
              </div>
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-medium text-gray-900 mb-2">Ratings</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Overall</span><span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />{ratings.overall || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span>{ratings.location || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Condition</span><span>{ratings.condition || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Value</span><span>{ratings.value || '-'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
        {step > 1 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 border rounded-xl font-medium text-gray-700">Back</button>}
        {step < totalSteps ? (
          <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">Continue</button>
        ) : (
          <button onClick={submitFeedback} disabled={submitting} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}Submit
          </button>
        )}
      </div>
    </div>
  )
}
