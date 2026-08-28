'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  Star,
  ChevronUp,
  ChevronDown,
  Home,
  MapPin,
  Heart,
  ThumbsUp,
  ThumbsDown,
  GripVertical,
  Save,
  Loader2,
  Check,
  MessageSquare,
  Camera,
  DollarSign,
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

interface Feedback {
  id: string
  property_id: string
  overall_rating: number
  location_rating: number
  condition_rating: number
  value_rating: number
  layout_rating: number
  likes: string
  dislikes: string
  interest_level: string
  rank_position: number | null
  rank_notes: string | null
  created_at: string
  properties: {
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
}

export default function PropertyRankingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadFeedback()
  }, [])

  async function loadFeedback() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/customer/login')
        return
      }

      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!customer) {
        router.push('/customer/login')
        return
      }

      setCustomerId((customer as { id: string }).id)

      const { data: feedbackData } = await supabase
        .from('walkthrough_feedback')
        .select(`
          *,
          properties (id, address, city, state, price, bedrooms, bathrooms, sqft, photos)
        `)
        .eq('customer_id', (customer as { id: string }).id)
        .order('rank_position', { ascending: true, nullsFirst: false })

      if (feedbackData) {
        // Sort: ranked items first (by rank), then unranked (by date)
        const ranked = (feedbackData as Feedback[]).filter(f => f.rank_position !== null).sort((a, b) => (a.rank_position || 0) - (b.rank_position || 0))
        const unranked = (feedbackData as Feedback[]).filter(f => f.rank_position === null).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setFeedback([...ranked, ...unranked])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function moveUp(index: number) {
    if (index === 0) return
    const newFeedback = [...feedback]
    const temp = newFeedback[index]
    newFeedback[index] = newFeedback[index - 1]
    newFeedback[index - 1] = temp
    
    // Update rank positions
    newFeedback.forEach((f, i) => {
      f.rank_position = i + 1
    })
    
    setFeedback(newFeedback)
    setHasChanges(true)
  }

  function moveDown(index: number) {
    if (index === feedback.length - 1) return
    const newFeedback = [...feedback]
    const temp = newFeedback[index]
    newFeedback[index] = newFeedback[index + 1]
    newFeedback[index + 1] = temp
    
    // Update rank positions
    newFeedback.forEach((f, i) => {
      f.rank_position = i + 1
    })
    
    setFeedback(newFeedback)
    setHasChanges(true)
  }

  async function saveRankings() {
    if (!customerId) return
    setSaving(true)

    try {
      const rankings = feedback.map((f, index) => ({
        feedback_id: f.id,
        rank_position: index + 1,
        rank_notes: f.rank_notes
      }))

      const response = await fetch('/api/walkthrough', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, rankings })
      })

      if (response.ok) {
        setNotification('Rankings saved! Your agent has been notified.')
        setHasChanges(false)
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const interestEmoji: Record<string, string> = {
    not_interested: '😐',
    maybe: '🤔',
    interested: '😊',
    very_interested: '😍',
    ready_to_offer: '🔥',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/customer/dashboard" className="p-2 -ml-2">
              <Home className="w-6 h-6" />
            </Link>
            <h1 className="font-bold text-lg text-gray-900">My Property Rankings</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Intro */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-8 h-8" />
          <h2 className="text-xl font-bold">Rank Your Favorites</h2>
        </div>
        <p className="text-blue-100 text-sm">
          Drag properties to rank them from most to least favorite. Your agent will see your updated rankings.
        </p>
      </div>

      {/* Rankings List */}
      <div className="p-4">
        {feedback.length > 0 ? (
          <div className="space-y-3">
            {feedback.map((item, index) => (
              <div key={item.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="flex">
                  {/* Rank Badge */}
                  <div className={`w-14 flex-shrink-0 flex flex-col items-center justify-center ${
                    index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-amber-600' : 'bg-gray-100'
                  }`}>
                    <span className={`text-2xl font-bold ${index < 3 ? 'text-white' : 'text-gray-500'}`}>#{index + 1}</span>
                    <div className="flex flex-col gap-1 mt-2">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'opacity-30' : 'hover:bg-white/30'}`}
                      >
                        <ChevronUp className={`w-4 h-4 ${index < 3 ? 'text-white' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === feedback.length - 1}
                        className={`p-1 rounded ${index === feedback.length - 1 ? 'opacity-30' : 'hover:bg-white/30'}`}
                      >
                        <ChevronDown className={`w-4 h-4 ${index < 3 ? 'text-white' : 'text-gray-500'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="flex-1 p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.properties?.photos?.[0] ? (
                          <img src={item.properties.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Home className="w-8 h-8 m-auto mt-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{formatPrice(item.properties?.price || 0)}</p>
                        <p className="text-sm text-gray-600 truncate">{item.properties?.address}</p>
                        <p className="text-xs text-gray-500">{item.properties?.city}, {item.properties?.state}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{item.properties?.bedrooms}bd • {item.properties?.bathrooms}ba</span>
                          <span className="text-lg">{interestEmoji[item.interest_level] || ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ratings Summary */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{item.overall_rating}/5</span>
                      </div>
                      {item.likes && (
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs truncate max-w-[100px]">{item.likes}</span>
                        </div>
                      )}
                      {item.dislikes && (
                        <div className="flex items-center gap-1 text-red-500">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-xs truncate max-w-[100px]">{item.dislikes}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/property/${item.property_id}`}
                        className="flex-1 py-2 text-center text-xs font-medium bg-gray-100 text-gray-700 rounded-lg"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/walkthrough/${item.property_id}`}
                        className="flex-1 py-2 text-center text-xs font-medium bg-blue-100 text-blue-700 rounded-lg"
                      >
                        Update Feedback
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-8 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-gray-900 mb-2">No Properties Reviewed Yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              After your showings, submit feedback to rank properties here.
            </p>
            <Link
              href="/customer/dashboard?tab=showings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              View My Showings
            </Link>
          </div>
        )}
      </div>

      {/* Save Button */}
      {feedback.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={saveRankings}
            disabled={saving || !hasChanges}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
              hasChanges ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {hasChanges ? 'Save Rankings' : 'Rankings Saved'}
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Your agent will be notified when you save changes
          </p>
        </div>
      )}
    </div>
  )
}
