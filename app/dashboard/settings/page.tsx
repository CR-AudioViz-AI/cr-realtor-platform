'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  Phone,
  MapPin,
  Building2,
  Camera,
  Save,
  Check,
  Loader2,
  Globe,
  MessageSquare,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    license_number: '',
    bio: '',
    specialties: [] as string[],
    service_areas: [] as string[],
    website: '',
    avatar_url: '',
  })

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    lead_alerts: true,
    showing_reminders: true,
    weekly_summary: true,
    marketing_emails: false,
    default_commission: '3',
    calendar_sync: false,
    auto_response: false,
    theme: 'light',
  })

  const [newSpecialty, setNewSpecialty] = useState('')
  const [newArea, setNewArea] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        license_number: data.license_number || '',
        bio: data.bio || '',
        specialties: data.specialties || [],
        service_areas: data.service_areas || [],
        website: data.website || '',
        avatar_url: data.avatar_url || '',
      })
    }

    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('cr_agent_preferences')
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs))
    }

    setLoading(false)
  }

  async function saveProfile() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        license_number: profile.license_number,
        bio: profile.bio,
        specialties: profile.specialties,
        service_areas: profile.service_areas,
        website: profile.website,
      })
      .eq('id', user.id)

    // Save preferences to localStorage
    localStorage.setItem('cr_agent_preferences', JSON.stringify(preferences))

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addSpecialty = () => {
    if (newSpecialty && !profile.specialties.includes(newSpecialty)) {
      setProfile(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty] }))
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (s: string) => {
    setProfile(prev => ({ ...prev, specialties: prev.specialties.filter(x => x !== s) }))
  }

  const addArea = () => {
    if (newArea && !profile.service_areas.includes(newArea)) {
      setProfile(prev => ({ ...prev, service_areas: [...prev.service_areas, newArea] }))
      setNewArea('')
    }
  }

  const removeArea = (a: string) => {
    setProfile(prev => ({ ...prev, service_areas: prev.service_areas.filter(x => x !== a) }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your profile and preferences</p>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <>
              {/* Avatar & Basic Info */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={profile.first_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={profile.last_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={profile.license_number}
                        onChange={(e) => setProfile(prev => ({ ...prev, license_number: e.target.value }))}
                        placeholder="SL1234567"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yoursite.com"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    placeholder="Tell clients about yourself..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Specialties & Areas */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Expertise</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {profile.specialties.map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                        {s}
                        <button onClick={() => removeSpecialty(s)} className="hover:text-blue-900">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                      placeholder="e.g., Luxury Homes, First-Time Buyers"
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={addSpecialty} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Add</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {profile.service_areas.map(a => (
                      <span key={a} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {a}
                        <button onClick={() => removeArea(a)} className="hover:text-emerald-900">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addArea()}
                      placeholder="e.g., Naples, Fort Myers, Bonita Springs"
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={addArea} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Add</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Notification Settings</h2>
              <div className="space-y-4">
                {[
                  { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                  { key: 'sms_notifications', label: 'SMS Notifications', desc: 'Get text alerts for urgent items', icon: MessageSquare },
                  { key: 'lead_alerts', label: 'New Lead Alerts', desc: 'Instant notification when you get a new lead', icon: User },
                  { key: 'showing_reminders', label: 'Showing Reminders', desc: 'Reminders before scheduled showings', icon: Calendar },
                  { key: 'weekly_summary', label: 'Weekly Summary', desc: 'Weekly performance report', icon: Building2 },
                  { key: 'marketing_emails', label: 'Marketing Emails', desc: 'Tips, updates, and promotions', icon: Mail },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[item.key as keyof typeof preferences] as boolean}
                          onChange={(e) => setPreferences(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-6">App Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={preferences.default_commission}
                    onChange={(e) => setPreferences(prev => ({ ...prev, default_commission: e.target.value }))}
                    className="w-full max-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Calendar Sync</p>
                      <p className="text-sm text-gray-500">Sync with Google Calendar</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.calendar_sync}
                      onChange={(e) => setPreferences(prev => ({ ...prev, calendar_sync: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Auto-Response</p>
                      <p className="text-sm text-gray-500">Automatic reply to new leads</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.auto_response}
                      onChange={(e) => setPreferences(prev => ({ ...prev, auto_response: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <div className="flex gap-3">
                    {['light', 'dark', 'system'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => setPreferences(prev => ({ ...prev, theme }))}
                        className={`px-4 py-2 rounded-lg capitalize ${
                          preferences.theme === theme
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Password</button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Enable 2FA</button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-red-600 mb-4">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back.</p>
                  <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
