// 2026-09-04: retired model replaced.
//
// gpt-4-turbo-preview no longer exists at the provider. A request naming it returns 404, and
// most call sites treat a failed completion as an empty answer - so the feature
// degrades silently rather than erroring, and nobody reports it.
//
// gpt-4.1-nano is the current equivalent under the platform's cost order, verified
// answering this session. Found by sweeping the fleet with core's
// audit-model-names guard, which no satellite runs: core has had it since
// 25 August, when every free model named in the codebase turned out to be retired.
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

const JAVARI_REALTOR_PROMPT = `You are Javari, the AI assistant for CR Realtor Platform. You're a Southwest Florida real estate expert—sharp, direct, and deeply knowledgeable.

## YOUR PERSONALITY
- Direct and concise. No filler words. No corporate speak.
- Confident but not arrogant. You know your stuff.
- Personal when appropriate, professional always.

## SOUTHWEST FLORIDA EXPERTISE

### Markets You Know:
**Naples:** Port Royal ($15M-$60M), Aqualane Shores ($4M-$15M), Old Naples, Park Shore, Pelican Bay, Grey Oaks, Mediterra
**Marco Island:** Hideaway Beach, waterfront estates, Gulf-access canals
**Fort Myers:** Downtown River District, McGregor, Gateway
**Cape Coral:** Gulf-access (units 61-80 best), sailboat water, freshwater canals
**Bonita Springs:** Bonita Bay, Pelican Landing, Spanish Wells

### Key Knowledge:
- Gulf Access: Direct vs bridge-restricted vs sailboat water
- Flood Zones: AE, VE, X—insurance implications
- Pricing: Naples median $650K, Marco $750K, Cape $400K, Fort Myers $380K
- Seasonal: Peak Dec-Apr, inventory drops 40%

### Florida RE Law:
- AS-IS vs Standard contracts, inspection periods (10-15 days typical)
- Closing costs: Buyer 2-3%, Seller 7-8%
- Homestead: $50K exemption, Save Our Homes cap, portability up to $500K

## RESPONSE STYLE
Be direct. Give specific numbers. No fluff.
Keep responses under 150 words unless detail is specifically requested.`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let userContext = ''
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        userContext = `\n\nCurrent user: ${profile.first_name} ${profile.last_name}`
      }
    }

    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Get context from database
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
    let dataContext = ''

    if (lastMessage.includes('pipeline') || lastMessage.includes('properties') || lastMessage.includes('listings')) {
      const { data: properties } = await supabase
        .from('properties')
        .select('title, price, city, status')
        .limit(10)
      
      if (properties?.length) {
        dataContext = `\n\nCurrent listings:\n${properties.map(p => 
          `- ${p.title} | ${p.city} | $${(p.price/1000000).toFixed(2)}M | ${p.status}`
        ).join('\n')}`
      }
    }

    if (lastMessage.includes('lead') || lastMessage.includes('follow')) {
      const { data: leads } = await supabase
        .from('realtor_leads')
        .select('full_name, status, priority, notes')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (leads?.length) {
        dataContext += `\n\nRecent leads:\n${leads.map(l => 
          `- ${l.full_name} | ${l.status} | ${l.priority} priority`
        ).join('\n')}`
      }
    }

    // Call OpenAI API directly via fetch
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          { 
            role: 'system', 
            content: JAVARI_REALTOR_PROMPT + userContext + dataContext
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI error:', errorData)
      return NextResponse.json({
        message: "I'm having trouble connecting right now. Try again in a moment.",
        provider: 'error',
      })
    }

    const data = await openaiResponse.json()
    const response = data.choices?.[0]?.message?.content || 'No response generated.'

    return NextResponse.json({
      message: response,
      provider: 'javari-realtor',
    })

  } catch (error: any) {
    console.error('Javari chat error:', error)
    return NextResponse.json({
      message: "Something went wrong. Try again.",
      provider: 'error',
    })
  }
}
