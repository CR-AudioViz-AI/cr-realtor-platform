'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Heart,
  MessageSquare,
  FileText,
  Calculator,
  MapPin,
  ArrowRight,
  ChevronRight,
  Loader2,
  Star,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface DashboardStats {
  savedHomes: number
  savedSearches: number
  upcomingShowings: number
  unreadMessages: number
  documents: number
}

export default function CustomerDashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('there')
  const [stats, setStats] = useState<DashboardStats>({
    savedHomes: 0,
    savedSearches: 0,
    upcomingShowings: 0,
    unreadMessages: 0,
    documents: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get user name with graceful error handling
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        setUserName(profile?.full_name?.split(' ')[0] || 'there')
      } catch {
        setUserName(user.email?.split('@')[0] || 'there')
      }

      // Get stats (with fallbacks for missing tables)
      const statsData: DashboardStats = {
        savedHomes: 0,
        savedSearches: 0,
        upcomingShowings: 0,
        unreadMessages: 0,
        documents: 0
      }

      // Saved properties count
      try {
        const { count } = await supabase
          .from('saved_properties')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
        statsData.savedHomes = count || 0
      } catch {}

      // Saved searches count
      try {
        const { count } = await supabase
          .from('saved_searches')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
        statsData.savedSearches = count || 0
      } catch {}

      // Upcoming showings
      try {
        const { count } = await supabase
          .from('showing_requests')
          .select('id', { count: 'exact', head: true })
          .eq('customer_id', user.id)
          .gte('requested_date', new Date().toISOString())
        statsData.upcomingShowings = count || 0
      } catch {}

      // Unread messages
      try {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false)
        statsData.unreadMessages = count || 0
      } catch {}

      // Documents
      try {
        const { count } = await supabase
          .from('customer_documents')
          .select('id', { count: 'exact', head: true })
          .eq('customer_id', user.id)
        statsData.documents = count || 0
      } catch {}

      setStats(statsData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Quick actions - ONLY pages that exist
  const quickActions = [
    {
      title: 'Browse Properties',
      description: 'Find homes that match your criteria',
      icon: Search,
      href: '/customer/dashboard/properties',
      color: 'bg-blue-500',
    },
    {
      title: 'Saved Homes',
      description: `${stats.savedHomes} properties saved`,
      icon: Heart,
      href: '/customer/dashboard/favorites',
      color: 'bg-red-500',
    },
    {
      title: 'Messages',
      description: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'Chat with your agent',
      icon: MessageSquare,
      href: '/customer/dashboard/messages',
      color: 'bg-purple-500',
      badge: stats.unreadMessages
    },
    {
      title: 'Documents',
      description: 'Contracts & disclosures',
      icon: FileText,
      href: '/customer/dashboard/documents',
      color: 'bg-green-500',
    }
  ]

  // Tools - ONLY pages that exist
  const tools = [
    {
      title: 'Mortgage Calculator',
      description: 'Estimate your monthly payments',
      icon: Calculator,
      href: '/customer/dashboard/mortgage'
    },
    {
      title: 'Service Providers',
      description: 'Inspectors, lenders, title & more',
      icon: MapPin,
      href: '/customer/dashboard/vendors'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-blue-100 text-lg">
          Your home buying journey starts here. Let us find your perfect home.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/customer/dashboard/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            <Search className="h-4 w-4" />
            Browse Properties
          </Link>
          <Link
            href="/customer/dashboard/favorites"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
          >
            <Heart className="h-4 w-4" />
            Saved Homes
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.savedHomes}</p>
              <p className="text-sm text-gray-500">Saved Homes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.savedSearches}</p>
              <p className="text-sm text-gray-500">Saved Searches</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingShowings}</p>
              <p className="text-sm text-gray-500">Showings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
              <p className="text-sm text-gray-500">Documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="bg-white rounded-xl p-5 border hover:shadow-lg transition group relative"
            >
              {action.badge && action.badge > 0 && (
                <span className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500">{action.description}</p>
              <div className="mt-3 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                Go <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column - Tools */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">Buyer Tools</h2>
              <p className="text-sm text-gray-500">Powerful tools to help you make informed decisions</p>
            </div>
            <div className="divide-y">
              {tools.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <tool.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{tool.title}</h3>
                    <p className="text-sm text-gray-500">{tool.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Getting Started */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <h3 className="font-bold text-lg mb-2">Getting Started</h3>
            <ul className="space-y-2 text-green-100 text-sm">
              <li className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${stats.savedSearches > 0 ? 'bg-white text-green-600' : 'bg-green-400'}`}>
                  {stats.savedSearches > 0 ? '✓' : '1'}
                </div>
                Create a saved search
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${stats.savedHomes > 0 ? 'bg-white text-green-600' : 'bg-green-400'}`}>
                  {stats.savedHomes > 0 ? '✓' : '2'}
                </div>
                Save homes you like
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${stats.upcomingShowings > 0 ? 'bg-white text-green-600' : 'bg-green-400'}`}>
                  {stats.upcomingShowings > 0 ? '✓' : '3'}
                </div>
                Schedule showings
              </li>
            </ul>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-xl p-5 border">
            <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your agent is here to help you every step of the way.
            </p>
            <Link
              href="/customer/dashboard/messages"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <MessageSquare className="h-4 w-4" />
              Message Your Agent
            </Link>
          </div>

          {/* Market Tip */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800">Market Tip</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Set up email alerts for your saved searches to be first to know about new listings!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
