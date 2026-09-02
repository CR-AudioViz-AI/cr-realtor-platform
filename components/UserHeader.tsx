'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  User, LogOut, Settings, CreditCard, ChevronDown,
  Coins, Gift, Bell, ExternalLink, Loader2
} from 'lucide-react';

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

interface CreditBalance {
  balance: number
  lifetime_earned: number
  lifetime_spent: number
}

export default function UserHeader() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [credits, setCredits] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
            avatar_url: authUser.user_metadata?.avatar_url
          })

          // Fetch credit balance
          try {
            const response = await fetch(`/api/credits?userId=${authUser.id}`)
            if (response.ok) {
              const data = await response.json()
              setCredits(data)
            }
          } catch (e) {
            // Default credits if API fails
            setCredits({ balance: 1000, lifetime_earned: 1000, lifetime_spent: 0 })
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/login')
      } else if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin text-gray-400" size={20} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a 
          href="https://craudiovizai.com/auth/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Sign In
        </a>
        <a 
          href="https://craudiovizai.com/auth/signup"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Get Started
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {/* Credits Display */}
      <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-3 py-1.5 rounded-lg">
        <Coins className="text-amber-600" size={18} />
        <span className="font-semibold text-amber-700">
          {credits?.balance?.toLocaleString() || 0}
        </span>
        <span className="text-xs text-amber-600">credits</span>
        <a 
          href="https://craudiovizai.com/pricing" 
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-amber-500 hover:text-amber-600"
          title="Buy more credits"
        >
          <Gift size={14} />
        </a>
      </div>

      {/* Notifications */}
      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
        <Bell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.full_name} 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {(user.full_name || user.email)[0].toUpperCase()}
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {user.full_name || user.email.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border z-50 py-2">
              {/* User Info */}
              <div className="px-4 py-3 border-b">
                <p className="font-medium text-gray-900">{user.full_name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              {/* Mobile Credits */}
              <div className="md:hidden px-4 py-3 border-b bg-amber-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Credits</span>
                  <span className="font-bold text-amber-700">
                    {credits?.balance?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <a
                  href="https://craudiovizai.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink size={18} />
                  CR AudioViz AI Hub
                </a>
                <a
                  href="https://craudiovizai.com/credits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <CreditCard size={18} />
                  Manage Credits
                </a>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={18} />
                  Settings
                </Link>
              </div>

              {/* Sign Out */}
              <div className="border-t pt-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
