'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import {
  Home, Search, Heart, Bell, MessageSquare, FileText, Calculator,
  LogOut, Menu, X, Briefcase, Loader2, Shield, Gamepad2, 
  GraduationCap, ClipboardList, Building2, TrendingUp
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


const NAVIGATION = [
  { name: 'Dashboard', href: '/customer/dashboard', icon: Home },
  { name: 'Property Intelligence', href: '/customer/dashboard/intelligence', icon: Shield },
  { name: 'Browse Properties', href: '/customer/dashboard/properties', icon: Search },
  { name: 'Saved Homes', href: '/customer/dashboard/favorites', icon: Heart },
  { name: 'Mortgage Calculator', href: '/customer/dashboard/mortgage', icon: Calculator },
  { name: 'Investment Calculator', href: '/customer/dashboard/investment-calculator', icon: Building2 },
  { name: 'Checklists', href: '/customer/dashboard/checklists', icon: ClipboardList },
  { name: 'Education', href: '/customer/dashboard/education', icon: GraduationCap },
  { name: 'Games', href: '/customer/dashboard/games', icon: Gamepad2 },
  { name: 'Messages', href: '/customer/dashboard/messages', icon: MessageSquare },
  { name: 'Documents', href: '/customer/dashboard/documents', icon: FileText },
  { name: 'Service Providers', href: '/customer/dashboard/vendors', icon: Briefcase },
]

const AGENT_ROLES = ['realtor', 'agent', 'broker', 'admin', 'platform_admin', 'team_lead']

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: string | null
  avatar_url: string | null
  brokerage: string | null
}

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  const supabase = createClient()

  const loadUserData = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, role, avatar_url, brokerage')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        setProfile({
          id: session.user.id,
          email: session.user.email || null,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          phone: null, role: 'client', avatar_url: null, brokerage: null
        })
      } else if (profileData) {
        if (AGENT_ROLES.includes(profileData.role || '')) {
          router.push('/dashboard')
          return
        }
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => { loadUserData() }, [loadUserData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-semibold text-gray-900">CR Realtor</span>
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link href="/customer/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">CR Realtor</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {NAVIGATION.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
