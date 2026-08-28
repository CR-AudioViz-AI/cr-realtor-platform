'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  CreditCard, Check, Shield, ArrowLeft, Zap, Lock,
  GraduationCap, Target, Building2, Share2, Bot, Sparkles, Loader2
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


const ADDONS = {
  'education': {
    id: 'education',
    name: 'Education Center',
    description: 'Complete education library for you and your clients',
    price: 4900, // cents
    icon: GraduationCap,
    color: 'from-blue-500 to-indigo-600',
    features: [
      'First-Time Homebuyer Academy (12 modules)',
      'Real Estate Investing 101 (10 modules)',
      'Home Seller Masterclass (8 modules)',
      '100+ term glossary',
      'Downloadable checklists',
      'Share with unlimited clients',
    ],
    stripe_price_id: 'price_education_monthly',
  },
  'crm': {
    id: 'crm',
    name: 'Lead Scoring & CRM Pro',
    description: 'AI-powered lead management and automation',
    price: 7900,
    icon: Target,
    color: 'from-purple-500 to-violet-600',
    features: [
      'Automatic A-F lead grading',
      'Follow-up automation',
      'Email template library',
      'Pipeline management',
      'Performance analytics',
    ],
    stripe_price_id: 'price_crm_monthly',
  },
  'vendors': {
    id: 'vendors',
    name: 'Vendor Network',
    description: 'Premium vendor directory access',
    price: 2900,
    icon: Building2,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Access 500+ verified vendors',
      'Priority contact queue',
      'Ratings & reviews',
      'Referral tracking',
    ],
    stripe_price_id: 'price_vendors_monthly',
  },
  'marketing': {
    id: 'marketing',
    name: 'Property Marketing Suite',
    description: 'Professional marketing tools',
    price: 3900,
    icon: Share2,
    color: 'from-amber-500 to-orange-600',
    features: [
      'QR code generator',
      'Social sharing widgets',
      'Property comparison',
      'Neighborhood maps',
    ],
    stripe_price_id: 'price_marketing_monthly',
  },
  'ai-assistant': {
    id: 'ai-assistant',
    name: 'AI Assistant Pro',
    description: 'AI-powered client Q&A assistant',
    price: 4900,
    icon: Bot,
    color: 'from-cyan-500 to-blue-600',
    features: [
      'Expert knowledge base',
      '24/7 client answers',
      'Embed on your website',
      'Branded with your info',
    ],
    stripe_price_id: 'price_ai_monthly',
  },
  'full-bundle': {
    id: 'full-bundle',
    name: 'Complete Realtor Suite',
    description: 'All add-ons included at a huge discount',
    price: 14900,
    icon: Sparkles,
    color: 'from-pink-500 via-purple-500 to-indigo-600',
    features: [
      'Education Center ($49 value)',
      'Lead Scoring & CRM Pro ($79 value)',
      'Vendor Network ($29 value)',
      'Property Marketing Suite ($39 value)',
      'AI Assistant Pro ($49 value)',
      'Save $96/month!',
    ],
    stripe_price_id: 'price_bundle_monthly',
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  const addonId = searchParams.get('addon') || 'education'
  const discountParam = searchParams.get('discount') || '0'
  const discountPercent = parseInt(discountParam)
  
  const addon = ADDONS[addonId as keyof typeof ADDONS]
  
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  if (!addon) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Add-on not found</h1>
        <Link href="/dashboard/addons" className="text-blue-600 hover:underline">
          Browse available add-ons
        </Link>
      </div>
    )
  }

  const originalPrice = addon.price / 100
  const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100))

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/checkout?addon=' + addonId)
      return
    }

    setLoading(true)
    setError('')

    try {
      // Call Stripe checkout API
      const response = await fetch('/api/checkout/addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addon_id: addon.id,
          price_id: addon.stripe_price_id,
          discount_percent: discountPercent,
          user_id: user.id,
          user_email: user.email,
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Icon = addon.icon

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/addons" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} /> Back to Add-Ons
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${addon.color} p-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Icon size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{addon.name}</h1>
                <p className="text-white/80">{addon.description}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Features */}
            <div className="mb-6">
              <h2 className="font-semibold mb-3">What's included:</h2>
              <ul className="space-y-2">
                {addon.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <Check className="text-green-500" size={18} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Monthly subscription</span>
                <div className="text-right">
                  {discountPercent > 0 && (
                    <span className="text-gray-400 line-through mr-2">${originalPrice}</span>
                  )}
                  <span className="text-3xl font-bold">${discountedPrice}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-2 rounded-lg text-sm">
                  <Zap size={16} />
                  <span>{discountPercent}% Realtor account discount applied!</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard size={20} />
                  Subscribe for ${discountedPrice}/month
                </>
              )}
            </button>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Shield size={16} />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock size={16} />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center mt-4">
              By subscribing, you agree to our Terms of Service and Privacy Policy. 
              Your subscription will renew automatically each month until cancelled.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  )
}
