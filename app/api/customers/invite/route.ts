// =====================================================
// CR REALTOR PLATFORM - CUSTOMER INVITE API
// Path: app/api/customers/invite/route.ts
// Purpose: Agent/Realtor creates customer → system auto-emails credentials
// FIXED: Allow realtor and admin roles to invite customers
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase-helpers'
import { sendCustomerInviteEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password + '!'
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, first_name, last_name, email, phone, organization_id')
      .eq('id', user.id)
      .single()

    // FIX: Allow agent, realtor, and admin roles
    const allowedRoles = ['agent', 'realtor', 'admin']
    if (profileError || !agentProfile || !allowedRoles.includes(agentProfile.role)) {
      return NextResponse.json({ 
        error: 'Only agents and realtors can invite customers',
        currentRole: agentProfile?.role 
      }, { status: 403 })
    }

    const body = await request.json()
    const { 
      email, 
      full_name, 
      phone,
      notes,
      budget_min,
      budget_max,
      timeline,
      property_type_preference,
      bedroom_preference
    } = body

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 })
    }

    const { data: existingCustomer } = await supabase
      .from('realtor_customers')
      .select('id, email, assigned_agent_id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingCustomer) {
      if (existingCustomer.assigned_agent_id === user.id) {
        return NextResponse.json({ 
          error: 'This customer is already assigned to you',
          customer_id: existingCustomer.id
        }, { status: 400 })
      }
      return NextResponse.json({ 
        error: 'A customer with this email already exists'
      }, { status: 400 })
    }

    const { data: existingInvite } = await supabase
      .from('customer_invitations')
      .select('id, status, expires_at')
      .eq('customer_email', email.toLowerCase())
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvite) {
      return NextResponse.json({ 
        error: 'A pending invitation already exists for this email'
      }, { status: 400 })
    }

    const tempPassword = generateTempPassword()
    const inviteToken = generateToken()

    const adminClient = createAdminClient()
    
    const { data: authData, error: createUserError } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone,
        user_type: 'customer',
        invited_by: user.id
      }
    })

    if (createUserError) {
      console.error('Error creating auth user:', createUserError)
      return NextResponse.json({ 
        error: 'Failed to create user account',
        details: createUserError.message
      }, { status: 500 })
    }

    const { data: customer, error: customerError } = await supabase
      .from('realtor_customers')
      .insert({
        user_id: authData.user?.id,
        assigned_agent_id: user.id,
        full_name,
        email: email.toLowerCase(),
        phone,
        notes,
        budget_min: budget_min || null,
        budget_max: budget_max || null,
        timeline: timeline || null,
        property_type_preference: property_type_preference || null,
        bedroom_preference: bedroom_preference || null,
        status: 'active',
        source: 'agent_invite'
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating customer:', customerError)
      await adminClient.auth.admin.deleteUser(authData.user!.id)
      return NextResponse.json({ 
        error: 'Failed to create customer record',
        details: customerError.message
      }, { status: 500 })
    }

    const { data: invitation, error: inviteError } = await supabase
      .from('customer_invitations')
      .insert({
        agent_id: user.id,
        customer_email: email.toLowerCase(),
        customer_name: full_name,
        customer_phone: phone,
        temp_password: tempPassword,
        token: inviteToken,
        status: 'pending',
        customer_id: customer.id,
        notes
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
    }

    const agentName = `${agentProfile.first_name} ${agentProfile.last_name}`
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/customer/login`
      : 'https://cr-realtor-platform.vercel.app/customer/login'

    const emailResult = await sendCustomerInviteEmail({
      customerEmail: email.toLowerCase(),
      customerName: full_name,
      agentName,
      agentEmail: agentProfile.email,
      agentPhone: agentProfile.phone,
      tempPassword,
      loginUrl
    })

    if (invitation) {
      await supabase
        .from('customer_invitations')
        .update({
          metadata: {
            email_sent: emailResult.success,
            email_sent_at: emailResult.success ? new Date().toISOString() : null,
            email_error: 'error' in emailResult ? emailResult.error : null,
            email_message_id: 'id' in emailResult ? emailResult.id : null
          }
        })
        .eq('id', invitation.id)
    }

    return NextResponse.json({
      success: true,
      message: emailResult.success 
        ? 'Customer account created and email sent!' 
        : 'Customer account created. Email not configured - share credentials manually.',
      email_sent: emailResult.success,
      customer: {
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name
      },
      credentials: {
        email: email.toLowerCase(),
        temporary_password: tempPassword,
        login_url: loginUrl
      }
    })

  } catch (error: any) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('customer_invitations')
      .select('*, customers (id, full_name, email, status)')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: invitations, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      invitations: invitations || [],
      count: invitations?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
