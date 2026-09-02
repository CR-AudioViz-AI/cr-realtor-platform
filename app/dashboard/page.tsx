'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Home, Users, TrendingUp, DollarSign, Calendar, Bell,
  FileText, MessageSquare, BarChart3, Settings, Search,
  Plus, ArrowUpRight, ArrowDownRight, Eye, Phone, Mail,
  Clock, CheckCircle, AlertCircle, Star
} from 'lucide-react'

const QUICK_STATS = [
  { label: 'Active Listings', value: '12', change: '+2', trend: 'up', icon: Home },
  { label: 'Active Leads', value: '47', change: '+8', trend: 'up', icon: Users },
  { label: 'Pending Deals', value: '5', change: '+1', trend: 'up', icon: FileText },
  { label: 'Monthly Revenue', value: '$24,500', change: '+12%', trend: 'up', icon: DollarSign }
]

const RECENT_LEADS = [
  { id: 1, name: 'Michael Johnson', email: 'michael@email.com', phone: '(239) 555-0123', interest: 'Naples - $500K-$750K', status: 'hot', created: '2 hours ago' },
  { id: 2, name: 'Sarah Williams', email: 'sarah@email.com', phone: '(239) 555-0456', interest: 'Cape Coral - Gulf Access', status: 'warm', created: '5 hours ago' },
  { id: 3, name: 'David Brown', email: 'david@email.com', phone: '(239) 555-0789', interest: 'Fort Myers - Under $400K', status: 'new', created: '1 day ago' },
  { id: 4, name: 'Jennifer Davis', email: 'jennifer@email.com', phone: '(239) 555-0321', interest: 'Bonita Springs - Condo', status: 'warm', created: '2 days ago' }
]

const UPCOMING_SHOWINGS = [
  { id: 1, property: '2850 Winkler Ave, Fort Myers', client: 'Michael Johnson', time: 'Today, 2:00 PM', status: 'confirmed' },
  { id: 2, property: '1420 SE 47th St, Cape Coral', client: 'Sarah Williams', time: 'Tomorrow, 10:00 AM', status: 'pending' },
  { id: 3, property: '3500 Oasis Blvd, Cape Coral', client: 'David Brown', time: 'Dec 21, 3:00 PM', status: 'confirmed' }
]

const RECENT_ACTIVITY = [
  { id: 1, action: 'New lead received', detail: 'Michael Johnson - Naples buyer', time: '2 hours ago', icon: Users },
  { id: 2, action: 'Showing scheduled', detail: '2850 Winkler Ave - Tomorrow 2PM', time: '3 hours ago', icon: Calendar },
  { id: 3, action: 'Offer submitted', detail: '1420 SE 47th St - $385,000', time: '5 hours ago', icon: FileText },
  { id: 4, action: 'Listing price updated', detail: '3500 Oasis Blvd - $459,000', time: '1 day ago', icon: Home }
]

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Good morning')
  
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 12 && hour < 17) setGreeting('Good afternoon')
    else if (hour >= 17) setGreeting('Good evening')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting}! 👋</h1>
            <p className="text-gray-500">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link
              href="/dashboard/leads/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Lead
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {QUICK_STATS.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Leads */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Leads</h2>
              <Link href="/dashboard/leads" className="text-blue-600 hover:text-blue-700 text-sm">
                View All
              </Link>
            </div>
            <div className="divide-y">
              {RECENT_LEADS.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{lead.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lead.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'hot' ? 'bg-red-100 text-red-700' :
                            lead.status === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{lead.interest}</div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{lead.created}</span>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Showings */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Upcoming Showings</h2>
                <Link href="/dashboard/showings" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All
                </Link>
              </div>
              <div className="divide-y">
                {UPCOMING_SHOWINGS.map((showing) => (
                  <div key={showing.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {showing.status === 'confirmed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="font-medium text-sm">{showing.time}</span>
                    </div>
                    <div className="text-sm text-gray-600">{showing.property}</div>
                    <div className="text-sm text-gray-400">with {showing.client}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
              </div>
              <div className="divide-y">
                {RECENT_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <activity.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{activity.action}</div>
                      <div className="text-sm text-gray-500">{activity.detail}</div>
                      <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/properties" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <Home className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <span className="font-medium">My Properties</span>
          </Link>
          <Link href="/dashboard/crm" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <Users className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <span className="font-medium">CRM Pipeline</span>
          </Link>
          <Link href="/dashboard/marketing" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <BarChart3 className="w-8 h-8 mx-auto text-purple-600 mb-2" />
            <span className="font-medium">Marketing</span>
          </Link>
          <Link href="/dashboard/reports" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-orange-600 mb-2" />
            <span className="font-medium">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
