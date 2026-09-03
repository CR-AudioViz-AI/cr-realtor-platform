// app/sales/page.tsx
// Sales Dashboard - Track demos, leads, and conversions
// Internal tool for CR AudioViz AI team

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BarChart3, Users, Building2, DollarSign, TrendingUp, 
  Calendar, CheckCircle, Clock, AlertCircle, Plus,
  Search, Filter, Download, ExternalLink, Phone, Mail
} from 'lucide-react'

interface Demo {
  id: string
  brokerage: string
  agents: number
  markets: string[]
  status: 'active' | 'viewed' | 'converted' | 'expired'
  createdAt: string
  lastViewed?: string
  convertedAt?: string
  revenue?: number
}

interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  source: string
  status: 'new' | 'contacted' | 'demo_sent' | 'negotiating' | 'closed_won' | 'closed_lost'
  value: number
  createdAt: string
  notes?: string
}

// Mock data - would come from Supabase in production
const mockDemos: Demo[] = [
  {
    id: 'demo-agency-1',
    brokerage: 'Premiere Plus Realty',
    agents: 2,
    markets: ['Naples', 'Fort Myers', 'Bonita Springs'],
    status: 'active',
    createdAt: '2024-11-24T20:00:00Z',
    lastViewed: '2024-11-24T21:30:00Z'
  },
  {
    id: 'demo-gulf-coast-1',
    brokerage: 'Gulf Coast Properties',
    agents: 5,
    markets: ['Naples', 'Marco Island'],
    status: 'viewed',
    createdAt: '2024-11-20T14:00:00Z',
    lastViewed: '2024-11-23T10:00:00Z'
  },
  {
    id: 'demo-swfl-realty-1',
    brokerage: 'SWFL Realty Group',
    agents: 12,
    markets: ['Fort Myers', 'Cape Coral', 'Lehigh Acres'],
    status: 'converted',
    createdAt: '2024-11-15T09:00:00Z',
    convertedAt: '2024-11-22T16:00:00Z',
    revenue: 4788
  }
]

const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Tony Harvey',
    company: 'Premiere Plus Realty',
    email: 'tony@listorbuyrealestate.com',
    phone: '(239) 777-0155',
    source: 'Referral',
    status: 'demo_sent',
    value: 9576,
    createdAt: '2024-11-20T10:00:00Z',
    notes: 'Husband/wife team. Very interested in all 6 property types.'
  },
  {
    id: 'lead-2',
    name: 'Sarah Johnson',
    company: 'Naples Luxury Homes',
    email: 'sarah@naplesluxury.com',
    phone: '(239) 555-0200',
    source: 'Website',
    status: 'contacted',
    value: 14364,
    createdAt: '2024-11-22T14:00:00Z',
    notes: '3 agents, focusing on luxury market'
  },
  {
    id: 'lead-3',
    name: 'Mike Rodriguez',
    company: 'Rodriguez Realty',
    email: 'mike@rodriguezrealty.com',
    phone: '(239) 555-0300',
    source: 'LinkedIn',
    status: 'new',
    value: 4788,
    createdAt: '2024-11-24T08:00:00Z'
  }
]

export default function SalesDashboard() {
  const [demos] = useState<Demo[]>(mockDemos)
  const [leads] = useState<Lead[]>(mockLeads)
  const [activeTab, setActiveTab] = useState<'overview' | 'demos' | 'leads'>('overview')

  // Calculate stats
  const totalDemos = demos.length
  const activeDemos = demos.filter(d => d.status === 'active' || d.status === 'viewed').length
  const convertedDemos = demos.filter(d => d.status === 'converted').length
  const totalRevenue = demos.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const pipelineValue = leads.reduce((sum, l) => sum + l.value, 0)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      viewed: 'bg-blue-100 text-blue-700',
      converted: 'bg-purple-100 text-purple-700',
      expired: 'bg-gray-100 text-gray-700',
      new: 'bg-yellow-100 text-yellow-700',
      contacted: 'bg-blue-100 text-blue-700',
      demo_sent: 'bg-indigo-100 text-indigo-700',
      negotiating: 'bg-orange-100 text-orange-700',
      closed_won: 'bg-green-100 text-green-700',
      closed_lost: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CR</span>
                </div>
                <span className="text-xl font-bold">Sales Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/onboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>New Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+2 this week</span>
            </div>
            <div className="text-3xl font-bold mb-1">{totalDemos}</div>
            <div className="text-gray-500">Total Demos</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">{Math.round(convertedDemos/totalDemos*100)}%</span>
            </div>
            <div className="text-3xl font-bold mb-1">{convertedDemos}</div>
            <div className="text-gray-500">Converted</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">MRR</span>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
            <div className="text-gray-500">Revenue</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">{leads.length} leads</span>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(pipelineValue)}</div>
            <div className="text-gray-500">Pipeline Value</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            {['overview', 'demos', 'leads'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-4 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Demos */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Recent Demos</h2>
                <button 
                  onClick={() => setActiveTab('demos')}
                  className="text-blue-600 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {demos.slice(0, 3).map((demo) => (
                  <div key={demo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{demo.brokerage}</div>
                      <div className="text-sm text-gray-500">{demo.agents} agents • {demo.markets.join(', ')}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(demo.status)}`}>
                      {demo.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Leads */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Recent Leads</h2>
                <button 
                  onClick={() => setActiveTab('leads')}
                  className="text-blue-600 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {leads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.company} • {formatCurrency(lead.value)}/yr</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Demos Tab */}
        {activeTab === 'demos' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">All Demos</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search demos..."
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Link
                    href="/onboard"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Demo</span>
                  </Link>
                </div>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Brokerage</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Agents</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Markets</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {demos.map((demo) => (
                  <tr key={demo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{demo.brokerage}</td>
                    <td className="px-6 py-4">{demo.agents}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{demo.markets.join(', ')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(demo.status)}`}>
                        {demo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(demo.createdAt)}</td>
                    <td className="px-6 py-4">
                      <a href={`/demo/${demo.id.replace('demo-', '').split('-')[0]}`} target="_blank" className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">All Leads</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search leads..."
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Lead</span>
                  </button>
                </div>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{lead.name}</td>
                    <td className="px-6 py-4">{lead.company}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                          <Mail className="w-4 h-4" />
                        </a>
                        <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">{formatCurrency(lead.value)}/yr</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
