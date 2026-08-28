// =====================================================
// CR REALTOR PLATFORM - CUSTOMER MESSAGES PAGE
// Path: app/customer/dashboard/messages/page.tsx
// Timestamp: 2025-12-01 11:18 AM EST
// Purpose: Customer messaging with their agent (multi-tenant)
// =====================================================

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  MessageSquare,
  Send,
  User,
  CheckCheck,
  Home,
  Phone,
  Mail,
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface AgentData {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
}

interface Message {
  id: string
  customer_id: string
  agent_id: string
  sender_type: 'agent' | 'customer'
  sender_id: string
  content: string
  attachments: string[]
  property_id?: string
  message_type: string
  is_read: boolean
  read_at?: string
  created_at: string
  properties?: {
    id: string
    address: string
    city: string
    state: string
    price: number
  }
}

export default function CustomerMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/customer')
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
        if (data.customer_id) {
          setCustomerId(data.customer_id)
        }
        
        // Mark messages as read
        if (data.messages.length > 0) {
          await fetch('/api/messages/customer', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_id: data.customer_id, mark_all: true })
          })
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch agent info
  const fetchAgent = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: customer } = await supabase
      .from('realtor_customers')
      .select('assigned_agent_id')
      .eq('user_id', user.id)
      .single()

    if (customer) {
      const { data: agentData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone')
        .eq('id', customer.assigned_agent_id)
        .single()

      if (agentData) {
        setAgent(agentData)
      }
    }
  }, [supabase])

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          send_email: true
        })
      })

      const data = await response.json()
      
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        scrollToBottom()
      } else {
        alert(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Initial load
  useEffect(() => {
    fetchAgent()
    fetchMessages()
  }, [fetchAgent, fetchMessages])

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const agentName = agent ? `${agent.first_name} ${agent.last_name}`.trim() : 'Your Agent'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Agent Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {agent?.first_name?.charAt(0) || 'A'}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{agentName}</h2>
                <p className="text-sm text-gray-500">Your Real Estate Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {agent?.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Call agent"
                >
                  <Phone className="h-5 w-5" />
                </a>
              )}
              {agent?.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Email agent"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-gray-300" />
              </div>
              <p className="font-medium text-lg">No messages yet</p>
              <p className="text-sm mt-1">Send a message to {agentName} to get started</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.sender_type === 'customer'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                } px-4 py-3`}>
                  {/* Agent name for agent messages */}
                  {message.sender_type === 'agent' && (
                    <p className="text-xs font-medium text-gray-500 mb-1">{agentName}</p>
                  )}

                  {/* Property reference */}
                  {message.properties && (
                    <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                      message.sender_type === 'customer' ? 'border-blue-500' : 'border-gray-200'
                    }`}>
                      <Home className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {message.properties.address}, {message.properties.city}
                      </span>
                    </div>
                  )}
                  
                  {/* Message content */}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  
                  {/* Timestamp and status */}
                  <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                    message.sender_type === 'customer' ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    <span>{formatTime(message.created_at)}</span>
                    {message.sender_type === 'customer' && (
                      <CheckCheck className={`h-3.5 w-3.5 ${
                        message.is_read ? 'text-blue-200' : 'text-blue-400'
                      }`} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder={`Message ${agentName}...`}
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {sending ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {agentName} will also receive this message via email
          </p>
        </div>
      </div>
    </div>
  )
}
