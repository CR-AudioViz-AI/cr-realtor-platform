// =====================================================
// CR REALTOR PLATFORM - CUSTOMER MESSAGING API
// Path: app/api/messages/customer/route.ts
// Timestamp: 2025-12-02 3:20 PM EST
// Purpose: Agent-customer messaging with email delivery
// FIX: Adapted sendEmail result type to match expected emailResult type
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { sendAgentEmail, logEmailSend, hasAgentEmailConfigured } from '@/lib/agent-email'
import { sendEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

// GET - Retrieve messages for a customer
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    // Determine if user is agent or customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAgent = profile?.role === 'agent'

    // If customer, get their customer record
    let targetCustomerId = customerId
    if (!isAgent) {
      const { data: customerRecord } = await supabase
        .from('realtor_customers')
        .select('id, assigned_agent_id')
        .eq('user_id', user.id)
        .single()

      if (!customerRecord) {
        return NextResponse.json({ error: 'Customer record not found' }, { status: 404 })
      }
      targetCustomerId = customerRecord.id
    }

    if (!targetCustomerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    // Verify agent owns this customer
    if (isAgent) {
      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('id, assigned_agent_id')
        .eq('id', targetCustomerId)
        .single()

      if (!customer || customer.assigned_agent_id !== user.id) {
        return NextResponse.json({ error: 'Not authorized for this customer' }, { status: 403 })
      }
    }

    // Build query
    let query = supabase
      .from('customer_messages')
      .select(`
        *,
        properties (id, address, city, state, price)
      `)
      .eq('customer_id', targetCustomerId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: messages, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('customer_messages')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', targetCustomerId)
      .eq('is_read', false)
      .neq('sender_type', isAgent ? 'agent' : 'customer')

    return NextResponse.json({
      messages: messages || [],
      unread_count: unreadCount || 0,
      customer_id: targetCustomerId
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST - Send a message (saves to DB + sends email)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      customer_id, 
      content, 
      attachments,
      property_id,
      message_type,
      send_email = true  // Default to sending email
    } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Get sender info
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, first_name, last_name, email, phone')
      .eq('id', user.id)
      .single()

    const isAgent = profile?.role === 'agent'
    const senderName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()

    // Determine customer and agent IDs
    let targetCustomerId = customer_id
    let agentId = isAgent ? user.id : null

    if (!isAgent) {
      // Customer sending message - get their record
      const { data: customerRecord } = await supabase
        .from('realtor_customers')
        .select('id, assigned_agent_id')
        .eq('user_id', user.id)
        .single()

      if (!customerRecord) {
        return NextResponse.json({ error: 'Customer record not found' }, { status: 404 })
      }
      targetCustomerId = customerRecord.id
      agentId = customerRecord.assigned_agent_id
    } else {
      // Agent sending - verify ownership
      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('id, assigned_agent_id, email, full_name, user_id')
        .eq('id', targetCustomerId)
        .single()

      if (!customer || customer.assigned_agent_id !== user.id) {
        return NextResponse.json({ error: 'Not authorized for this customer' }, { status: 403 })
      }
    }

    if (!targetCustomerId || !agentId) {
      return NextResponse.json({ error: 'Missing customer or agent ID' }, { status: 400 })
    }

    // Save message to database
    const { data: message, error: insertError } = await supabase
      .from('customer_messages')
      .insert({
        customer_id: targetCustomerId,
        agent_id: agentId,
        sender_type: isAgent ? 'agent' : 'customer',
        sender_id: user.id,
        content: content.trim(),
        attachments: attachments || [],
        property_id: property_id || null,
        message_type: message_type || 'general',
        is_read: false
      })
      .select(`
        *,
        properties (id, address, city, state, price)
      `)
      .single()

    if (insertError) {
      console.error('Error saving message:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // ========================================
    // SEND EMAIL NOTIFICATION
    // ========================================
    let emailResult: { success: boolean; error?: string; messageId?: string; provider?: string } = { success: false, error: 'Email not sent' }

    if (send_email && isAgent) {
      // Agent messaging customer - send from agent's email
      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('email, full_name')
        .eq('id', targetCustomerId)
        .single()

      if (customer?.email) {
        // Check if agent has email configured
        const hasEmail = await hasAgentEmailConfigured(user.id)
        const emailSubject = `Message from ${senderName}`

        if (hasEmail) {
          // Send from agent's own email - FIXED: single object parameter
          emailResult = await sendAgentEmail({
            agentId: user.id,
            to: customer.email,
            subject: emailSubject,
            html: buildMessageEmailHtml(content, senderName, profile?.phone, property_id)
          })

          // Log the email - FIXED: single object parameter
          await logEmailSend({
            agentId: user.id,
            recipientEmail: customer.email,
            subject: emailSubject,
            status: emailResult.success ? 'sent' : 'failed',
            messageId: emailResult.messageId,
            error: emailResult.error
          })
        } else {
          // Fallback to system email (Resend)
          const sendResult = await sendEmail({
            to: customer.email,
            subject: `New message from ${senderName}`,
            html: buildMessageEmailHtml(content, senderName, profile?.phone, property_id, true)
          })
          // Adapt the sendEmail result to match our expected type
          emailResult = {
            success: sendResult.success,
            messageId: 'id' in sendResult ? sendResult.id : undefined,
            error: 'error' in sendResult ? String(sendResult.error) : undefined,
            provider: 'demo' in sendResult && sendResult.demo ? 'demo' : 'resend'
          }
        }
      }
    } else if (send_email && !isAgent) {
      // Customer messaging agent - send notification to agent's email
      const { data: agentProfile } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('id', agentId)
        .single()

      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('full_name')
        .eq('id', targetCustomerId)
        .single()

      if (agentProfile?.email) {
        // Send notification via system email
        const sendResult = await sendEmail({
          to: agentProfile.email,
          subject: `New message from ${customer?.full_name || 'your customer'}`,
          html: buildCustomerMessageNotificationHtml(
            content, 
            customer?.full_name || 'Customer',
            agentProfile.first_name || 'Agent'
          )
        })
        // Adapt the sendEmail result to match our expected type
        emailResult = {
          success: sendResult.success,
          messageId: 'id' in sendResult ? sendResult.id : undefined,
          error: 'error' in sendResult ? String(sendResult.error) : undefined,
          provider: 'demo' in sendResult && sendResult.demo ? 'demo' : 'resend'
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: message,
      email_sent: emailResult.success,
      email_error: emailResult.error
    })

  } catch (error: unknown) {
    console.error('Message error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message_ids, customer_id, mark_all } = body

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAgent = profile?.role === 'agent'

    if (mark_all && customer_id) {
      // Mark all messages from the other party as read
      const { error } = await supabase
        .from('customer_messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('customer_id', customer_id)
        .eq('sender_type', isAgent ? 'customer' : 'agent')
        .eq('is_read', false)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, marked_all: true })
    }

    if (message_ids && message_ids.length > 0) {
      const { error } = await supabase
        .from('customer_messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', message_ids)
        .eq('sender_type', isAgent ? 'customer' : 'agent')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, marked_count: message_ids.length })
    }

    return NextResponse.json({ error: 'No messages specified' }, { status: 400 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ========================================
// EMAIL TEMPLATES
// ========================================

function buildMessageEmailHtml(
  content: string, 
  senderName: string, 
  phone?: string, 
  propertyId?: string,
  isSystemEmail = false
): string {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/customer/login`
    : 'https://cr-realtor-platform.vercel.app/customer/login'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 30px; border-bottom: 1px solid #e5e7eb;">
                  <h2 style="margin: 0; color: #1f2937; font-size: 20px;">
                    ${isSystemEmail ? 'New message from' : 'Message from'} ${senderName}
                  </h2>
                </td>
              </tr>
              
              <!-- Message Content -->
              <tr>
                <td style="padding: 30px;">
                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${content}</p>
                  </div>
                  
                  ${propertyId ? `
                  <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                    📍 This message is about a property you're interested in.
                  </p>
                  ` : ''}
                </td>
              </tr>
              
              <!-- Reply CTA -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                          Reply in Portal →
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="text-align: center; margin-top: 16px; color: #6b7280; font-size: 14px;">
                    Or simply reply to this email
                  </p>
                </td>
              </tr>
              
              <!-- Agent Contact -->
              <tr>
                <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    <strong>${senderName}</strong>
                    ${phone ? `<br>📞 ${phone}` : ''}
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function buildCustomerMessageNotificationHtml(
  content: string,
  customerName: string,
  agentFirstName: string
): string {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customers`
    : 'https://cr-realtor-platform.vercel.app/dashboard/customers'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 30px; border-bottom: 1px solid #e5e7eb;">
                  <h2 style="margin: 0; color: #1f2937; font-size: 20px;">
                    💬 New message from ${customerName}
                  </h2>
                </td>
              </tr>
              
              <!-- Message Preview -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Hi ${agentFirstName},</p>
                  <p style="margin: 0 0 20px; color: #374151;">Your customer ${customerName} sent you a message:</p>
                  
                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #10b981;">
                    <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${content.substring(0, 500)}${content.length > 500 ? '...' : ''}</p>
                  </div>
                </td>
              </tr>
              
              <!-- View CTA -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                          View & Reply →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    CR Realtor Platform • ${new Date().toLocaleDateString()}
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
