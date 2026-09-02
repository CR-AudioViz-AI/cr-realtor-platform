'use client'

// Force dynamic rendering - uses useSearchParams
export const dynamic = 'force-dynamic'

// =====================================================
// CR REALTOR PLATFORM - EMAIL SETTINGS PAGE
// Path: app/dashboard/settings/email/page.tsx
// Timestamp: 2025-12-01 5:05 PM EST
// Purpose: Agent configures their email integration
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface EmailSettings {
  id?: string
  provider: string
  sender_email: string
  sender_name?: string
  reply_to?: string
  signature_html?: string
  signature_text?: string
  is_verified: boolean
  verified_at?: string
  last_used_at?: string
  last_error?: string
  is_active: boolean
  send_copy_to_self: boolean
  smtp_configured?: boolean
  smtp_host?: string
  smtp_port?: number
  oauth_connected?: boolean
}

export default function EmailSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [settings, setSettings] = useState<EmailSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // SMTP form state
  const [smtpForm, setSmtpForm] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_secure: true,
    sender_email: '',
    sender_name: '',
    reply_to: '',
    signature_html: ''
  })

  // Check for OAuth callback status
  useEffect(() => {
    const emailConnected = searchParams.get('email_connected')
    const emailError = searchParams.get('email_error')
    
    if (emailConnected) {
      setSuccess(`Successfully connected ${emailConnected}!`)
      // Clear URL params
      router.replace('/dashboard/settings/email')
    }
    if (emailError) {
      setError(`Connection failed: ${emailError}`)
      router.replace('/dashboard/settings/email')
    }
  }, [searchParams, router])

  // Load existing settings
  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const res = await fetch('/api/agent/email-settings')
      const data = await res.json()
      
      if (data.settings) {
        setSettings(data.settings)
        if (data.settings.provider === 'smtp') {
          setSmtpForm({
            smtp_host: data.settings.smtp_host || '',
            smtp_port: data.settings.smtp_port || 587,
            smtp_username: data.settings.sender_email || '',
            smtp_password: '',
            smtp_secure: true,
            sender_email: data.settings.sender_email || '',
            sender_name: data.settings.sender_name || '',
            reply_to: data.settings.reply_to || '',
            signature_html: data.settings.signature_html || ''
          })
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function connectGmail() {
    try {
      setError('')
      const res = await fetch('/api/agent/email-settings/gmail')
      const data = await res.json()
      
      if (data.auth_url) {
        window.location.href = data.auth_url
      } else if (data.setup_required) {
        setError('Gmail integration requires setup. Please contact support.')
      } else {
        setError(data.error || 'Failed to start Gmail connection')
      }
    } catch (err) {
      setError('Failed to connect Gmail')
    }
  }

  async function saveSMTPSettings() {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch('/api/agent/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'smtp',
          ...smtpForm
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccess('SMTP settings saved! Send a test email to verify.')
        loadSettings()
      } else {
        setError(data.error || 'Failed to save settings')
      }
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function sendTestEmail() {
    setTesting(true)
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch('/api/agent/email-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccess(data.message)
        loadSettings()
      } else {
        setError(data.error || 'Test email failed')
      }
    } catch (err) {
      setError('Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  async function disconnectEmail() {
    if (!confirm('Are you sure you want to disconnect your email?')) return
    
    try {
      const res = await fetch('/api/agent/email-settings', {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setSettings(null)
        setSuccess('Email disconnected')
      }
    } catch (err) {
      setError('Failed to disconnect')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse bg-white rounded-lg p-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Settings
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Email Integration</h1>
          <p className="text-gray-600 mt-1">
            Connect your email to send messages to customers from your own address.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Current Connection Status */}
        {settings && settings.is_verified && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Connected via {settings.provider === 'gmail' ? 'Gmail' : settings.provider === 'outlook' ? 'Outlook' : 'SMTP'}
                  </p>
                  <p className="text-sm text-gray-500">{settings.sender_email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={sendTestEmail}
                  disabled={testing}
                  className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                >
                  {testing ? 'Sending...' : 'Send Test'}
                </button>
                <button
                  onClick={disconnectEmail}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Disconnect
                </button>
              </div>
            </div>
            
            {settings.last_used_at && (
              <p className="mt-4 text-xs text-gray-500">
                Last used: {new Date(settings.last_used_at).toLocaleDateString()}
              </p>
            )}
            {settings.last_error && (
              <p className="mt-2 text-sm text-red-600">
                Last error: {settings.last_error}
              </p>
            )}
          </div>
        )}

        {/* Connection Options */}
        {(!settings || !settings.is_verified) && (
          <div className="space-y-6">
            
            {/* Gmail Option */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Connect Gmail</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Securely connect your Gmail account. Emails will be sent from your @gmail.com address.
                  </p>
                  <button
                    onClick={connectGmail}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Connect Gmail
                  </button>
                </div>
              </div>
            </div>

            {/* Outlook Option (Coming Soon) */}
            <div className="bg-white rounded-lg shadow-sm border p-6 opacity-60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.584.23h-8.547v-6.959l1.6 1.229c.102.086.213.127.334.127.136 0 .25-.05.342-.148l.883-.958c.098-.107.148-.228.148-.363 0-.122-.044-.235-.133-.336L12.198 6.62l5.623 4.314.043.037V7.387c0-.233.078-.43.232-.59.153-.161.347-.24.584-.24h4.742c.232 0 .427.08.578.24.152.16.228.357.228.59H24zM0 7.387V17.39c0 .232.076.426.228.58.152.155.346.233.578.233h4.742c.237 0 .43-.078.584-.233.154-.154.232-.348.232-.58V7.387c0-.233-.078-.43-.232-.59-.154-.161-.347-.24-.584-.24H.806c-.232 0-.426.079-.578.24C.076 6.957 0 7.154 0 7.387zm7.5 3.33L13.5 5.1v2.01L7.5 12.727v-2.01z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Connect Outlook</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Connect your Microsoft Outlook or Office 365 account.
                  </p>
                  <span className="inline-block mt-4 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* SMTP Option */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Custom SMTP Server</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Use your own mail server or third-party SMTP service.
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                        <input
                          type="text"
                          value={smtpForm.smtp_host}
                          onChange={(e) => setSmtpForm({...smtpForm, smtp_host: e.target.value})}
                          placeholder="smtp.example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                        <input
                          type="number"
                          value={smtpForm.smtp_port}
                          onChange={(e) => setSmtpForm({...smtpForm, smtp_port: parseInt(e.target.value)})}
                          placeholder="587"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          value={smtpForm.smtp_username}
                          onChange={(e) => setSmtpForm({...smtpForm, smtp_username: e.target.value})}
                          placeholder="your@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                          type="password"
                          value={smtpForm.smtp_password}
                          onChange={(e) => setSmtpForm({...smtpForm, smtp_password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Send From Email</label>
                      <input
                        type="email"
                        value={smtpForm.sender_email}
                        onChange={(e) => setSmtpForm({...smtpForm, sender_email: e.target.value})}
                        placeholder="you@yourdomain.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={smtpForm.sender_name}
                        onChange={(e) => setSmtpForm({...smtpForm, sender_name: e.target.value})}
                        placeholder="Your name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <button
                      onClick={saveSMTPSettings}
                      disabled={saving}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save SMTP Settings'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3">How Email Integration Works</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              When you message a customer, the email comes FROM your connected address
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              Customers can reply directly to your email
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              All conversations are also saved in the platform for your records
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              Your email credentials are encrypted and never shared
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  )
}
