import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Central Supabase
const SUPABASE_URL = supabaseUrl()
const SUPABASE_SERVICE_KEY = secretKey()

const supabase = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

// Credit costs for realtor platform actions
const CREDIT_COSTS = {
  'ai_listing_description': 3,
  'ai_market_analysis': 5,
  'ai_email_draft': 2,
  'ai_social_post': 2,
  'property_report': 5,
  'mls_search': 1,
}

// GET - Check credit balance
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    // Try central database
    if (supabase) {
      const { data, error } = await supabase
        .from('user_credits')
        .select('balance, lifetime_earned, lifetime_spent')
        .eq('user_id', userId)
        .single()

      if (!error && data) {
        return NextResponse.json({
          success: true,
          balance: data.balance,
          lifetime_earned: data.lifetime_earned,
          lifetime_spent: data.lifetime_spent
        })
      }
    }

    // Fallback: Try central API
    const response = await fetch(`https://craudiovizai.com/api/credits/balance?userId=${userId}`)
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }

    // Default response for new users
    return NextResponse.json({
      success: true,
      balance: 1000, // Default free credits
      lifetime_earned: 1000,
      lifetime_spent: 0
    })
  } catch (error) {
    console.error('Credits API error:', error)
    return NextResponse.json({ 
      success: true, 
      balance: 1000,
      message: 'Using default credits'
    })
  }
}

// POST - Deduct credits
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, action, appId = 'realtor-platform', metadata } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate cost if not provided
    const creditCost = amount || CREDIT_COSTS[action as keyof typeof CREDIT_COSTS] || 1

    // Try central database
    if (supabase) {
      // Check balance first
      const { data: credits } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (!credits || credits.balance < creditCost) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient credits',
          balance: credits?.balance || 0,
          required: creditCost
        }, { status: 402 })
      }

      // Deduct credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          balance: credits.balance - creditCost,
          lifetime_spent: credits.balance + creditCost
        })
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }

      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        type: 'usage',
        credits: -creditCost,
        balance_after: credits.balance - creditCost,
        app_id: appId,
        app_name: 'RealtorPro',
        description: action,
        metadata
      })

      return NextResponse.json({
        success: true,
        deducted: creditCost,
        balance: credits.balance - creditCost
      })
    }

    // Fallback: Forward to central API
    const response = await fetch('https://craudiovizai.com/api/credits/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: creditCost, action, appId, metadata })
    })

    if (response.ok) {
      return NextResponse.json(await response.json())
    }

    return NextResponse.json({ success: true, message: 'Credit tracking pending' })
  } catch (error) {
    console.error('Credits deduct error:', error)
    return NextResponse.json({ success: true }) // Don't block user
  }
}
