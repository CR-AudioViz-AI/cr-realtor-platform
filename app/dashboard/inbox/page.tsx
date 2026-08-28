'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  CheckCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

interface Conversation {
  id: string
  customer_id: string
  agent_id: string
  last_message?: string
  last_message_at?: string
  agent_unread: number
}

interface Customer {
  id: string
  full_name: string
  email: string
  phone?: string
}

interface Message {
  id: string
  conversation_id: string
  sender_type: string
  content: string
  read: boolean
  created_at: string
}

export default function AgentInboxPage() {
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [customers, setCustomers] = useState<Record<string, Customer>>({})
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [agentId, setAgentId] = useState<string | null>(null)

  useEffect(() => { loadConversations() }, [])
  useEffect(() => { if (selectedConv) loadMessages(selectedConv.id) }, [selectedConv?.id])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadConversations() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setAgentId(user.id)

      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })

      if (convs) {
        setConversations(convs as Conversation[])
        
        // Load customer info for each conversation
        const customerIds = [...new Set(convs.map((c: Conversation) => c.customer_id))]
        if (customerIds.length > 0) {
          const { data: custData } = await supabase
            .from('realtor_customers')
            .select('*')
            .in('id', customerIds)
          
          if (custData) {
            const custMap: Record<string, Customer> = {}
            custData.forEach((c: Customer) => { custMap[c.id] = c })
            setCustomers(custMap)
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(convId: string) {
    setLoadingMsgs(true)
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      setMessages((data || []) as Message[])

      // Mark as read
      await supabase.from('messages').update({ read: true }).eq('conversation_id', convId).eq('sender_type', 'customer')
      await supabase.from('conversations').update({ agent_unread: 0 }).eq('id', convId)
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, agent_unread: 0 } : c))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingMsgs(false)
    }
  }

  async function sendMessage() {
    if (!newMsg.trim() || !selectedConv || !agentId) return
    setSending(true)
    
    try {
      const content = newMsg.trim()
      setNewMsg('')

      const { data: msg } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConv.id,
          customer_id: selectedConv.customer_id,
          agent_id: agentId,
          sender_type: 'agent',
          sender_id: agentId,
          content
        })
        .select()
        .single()

      if (msg) setMessages(prev => [...prev, msg as Message])

      await supabase.from('conversations').update({
        last_message: content,
        last_message_at: new Date().toISOString()
      }).eq('id', selectedConv.id)

      setConversations(prev => prev.map(c =>
        c.id === selectedConv.id ? { ...c, last_message: content, last_message_at: new Date().toISOString() } : c
      ))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (d: string) => {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const filteredConvs = conversations.filter(c => {
    const cust = customers[c.customer_id]
    return !searchTerm || cust?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || cust?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const totalUnread = conversations.reduce((acc, c) => acc + (c.agent_unread || 0), 0)

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500">{totalUnread > 0 ? `${totalUnread} unread` : 'Customer conversations'}</p>
        </div>
        <button onClick={loadConversations} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl border overflow-hidden flex">
        {/* Conversations List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length > 0 ? filteredConvs.map(conv => {
              const cust = customers[conv.customer_id]
              return (
                <button key={conv.id} onClick={() => setSelectedConv(conv)} className={`w-full p-4 text-left border-b hover:bg-gray-50 ${selectedConv?.id === conv.id ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {cust?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{cust?.full_name || 'Unknown'}</p>
                        {conv.last_message_at && <span className="text-xs text-gray-400 ml-2">{formatTime(conv.last_message_at)}</span>}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conv.last_message || 'No messages'}</p>
                      {conv.agent_unread > 0 && <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs rounded-full mt-1">{conv.agent_unread}</span>}
                    </div>
                  </div>
                </button>
              )
            }) : (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {customers[selectedConv.customer_id]?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{customers[selectedConv.customer_id]?.full_name}</p>
                      <p className="text-sm text-gray-500">{customers[selectedConv.customer_id]?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {customers[selectedConv.customer_id]?.phone && (
                      <a href={`tel:${customers[selectedConv.customer_id].phone}`} className="p-2 hover:bg-gray-200 rounded-lg"><Phone className="w-5 h-5 text-gray-600" /></a>
                    )}
                    <a href={`mailto:${customers[selectedConv.customer_id]?.email}`} className="p-2 hover:bg-gray-200 rounded-lg"><Mail className="w-5 h-5 text-gray-600" /></a>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                ) : messages.length > 0 ? messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender_type === 'agent' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender_type === 'agent' ? 'text-blue-200' : 'text-gray-400'}`}>
                        <span className="text-xs">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.sender_type === 'agent' && msg.read && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Start the conversation!</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()} placeholder="Type a message..." disabled={sending} className="flex-1 px-4 py-2 border rounded-full disabled:opacity-50" />
                  <button onClick={sendMessage} disabled={!newMsg.trim() || sending} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50">
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
