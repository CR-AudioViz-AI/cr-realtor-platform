import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

// GET - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const agentId = searchParams.get('agent_id')
    const conversationId = searchParams.get('conversation_id')

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id (id, full_name, avatar_url),
        customer:customers!customer_id (id, full_name, email)
      `)
      .order('created_at', { ascending: true })

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    } else if (customerId && agentId) {
      query = query
        .eq('customer_id', customerId)
        .eq('agent_id', agentId)
    } else if (customerId) {
      query = query.eq('customer_id', customerId)
    } else if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
    }

    return NextResponse.json({ messages: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { 
      customer_id,
      agent_id,
      sender_type, // 'customer' or 'agent'
      sender_id,
      content,
      conversation_id
    } = body

    // Create or get conversation
    let convId = conversation_id
    if (!convId && customer_id && agent_id) {
      // Check for existing conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('customer_id', customer_id)
        .eq('agent_id', agent_id)
        .single()

      if (existing) {
        convId = existing.id
      } else {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            customer_id,
            agent_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (convError) {
          return NextResponse.json({ error: convError.message }, { status: 500 })
        }
        convId = newConv.id
      }
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        customer_id,
        agent_id,
        sender_type,
        sender_id,
        content,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
    }

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', convId)

    return NextResponse.json({ message, conversation_id: convId })
  } catch (error: any) {
    return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// PATCH - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { message_ids, conversation_id, reader_type } = body

    let query = supabase.from('messages').update({ read: true, read_at: new Date().toISOString() })

    if (message_ids && message_ids.length > 0) {
      query = query.in('id', message_ids)
    } else if (conversation_id) {
      query = query.eq('conversation_id', conversation_id)
      if (reader_type === 'agent') {
        query = query.eq('sender_type', 'customer')
      } else {
        query = query.eq('sender_type', 'agent')
      }
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
