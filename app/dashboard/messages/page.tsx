// =====================================================
// CR REALTOR PLATFORM - AGENT MESSAGING PAGE
// Path: app/dashboard/messages/page.tsx
// Timestamp: 2025-12-01 11:00 AM EST
// Purpose: Agent-customer messaging interface
// =====================================================

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Clock, 
  CheckCheck,
  Paperclip,
  Home,
  ChevronLeft,
  RefreshCw,
  Bell,
  BellOff
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface Customer {
  id: string
  full_name: string
  email: string
  phone?: string
  status: string
  last_message_at?: string
  unread_count?: number
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

export default function MessagesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileList, setShowMobileList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch customers with message counts
  const fetchCustomers = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all customers for this agent
      const { data: customerData, error } = await supabase
        .from('realtor_customers')
        .select('*')
        .eq('assigned_agent_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Get unread counts for each customer
      const customersWithCounts = await Promise.all(
        (customerData || []).map(async (customer) => {
          const { count } = await supabase
            .from('customer_messages')
            .select('id', { count: 'exact', head: true })
            .eq('customer_id', customer.id)
            .eq('sender_type', 'customer')
            .eq('is_read', false)

          // Get last message time
          const { data: lastMessage } = await supabase
            .from('customer_messages')
            .select('created_at')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...customer,
            unread_count: count || 0,
            last_message_at: lastMessage?.created_at
          }
        })
      )

      // Sort by unread count, then by last message
      customersWithCounts.sort((a, b) => {
        if (b.unread_count !== a.unread_count) {
          return (b.unread_count || 0) - (a.unread_count || 0)
        }
        return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
      })

      setCustomers(customersWithCounts)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch messages for selected customer
  const fetchMessages = useCallback(async (customerId: string) => {
    try {
      const response = await fetch(`/api/messages/customer?customer_id=${customerId}`)
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
        
        // Mark messages as read
        await fetch('/api/messages/customer', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_id: customerId, mark_all: true })
        })

        // Refresh customer list to update unread counts
        fetchCustomers()
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [fetchCustomers])

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Initial load
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Load messages when customer selected
  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages(selectedCustomer.id)
      setShowMobileList(false)
    }
  }, [selectedCustomer, fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Filter customers by search
  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Total unread count
  const totalUnread = customers.reduce((sum, c) => sum + (c.unread_count || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalUnread} new
            </span>
          )}
        </div>
        <button
          onClick={fetchCustomers}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
        
        {/* Customer List - Left Panel */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${
          !showMobileList ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No customers yet</p>
                <p className="text-sm mt-1">Add customers to start messaging</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
                    selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {customer.full_name.charAt(0).toUpperCase()}
                    </div>
                    {(customer.unread_count || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                        {customer.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${
                        (customer.unread_count || 0) > 0 ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {customer.full_name}
                      </p>
                      {customer.last_message_at && (
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {formatTime(customer.last_message_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-700'
                        : customer.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area - Right Panel */}
        <div className={`flex-1 flex flex-col ${
          showMobileList ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedCustomer ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedCustomer.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{selectedCustomer.full_name}</h2>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCustomer.status === 'active' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedCustomer.status}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${
                        message.sender_type === 'agent'
                          ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                          : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                      } px-4 py-3`}>
                        {/* Property reference */}
                        {message.properties && (
                          <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                            message.sender_type === 'agent' ? 'border-blue-500' : 'border-gray-200'
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
                          message.sender_type === 'agent' ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          <span>{formatTime(message.created_at)}</span>
                          {message.sender_type === 'agent' && (
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
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Type a message..."
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
                  Messages are also sent to the customer's email
                </p>
              </div>
            </>
          ) : (
            /* No customer selected */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
              <p className="text-center max-w-sm">
                Choose a customer from the list to view your conversation history and send messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
