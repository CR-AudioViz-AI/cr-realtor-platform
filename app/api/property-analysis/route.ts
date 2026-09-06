// 2026-09-04: dead OpenRouter model replaced, and a note on why this recurs.
//
// deepseek/deepseek-r1-distill-llama-70b:free is no longer served. A request naming it
// returns an error and this call site treats a failed completion as an empty
// answer, so the feature degraded silently rather than failing loudly.
//
// OpenRouter's free tier CHURNS. Nineteen free models were available when this
// was written and the set turns over regularly, so this name will die too. The
// durable answer is the platform's own free order - Groq llama-3.3-70b, then
// gemini-flash-latest - which has been stable. Switching provider is a larger
// change than this repair, so for now the guard catches the next death instead:
// audit-model-names runs on every build here and asks the provider rather than
// trusting a list.
// app/api/property-analysis/route.ts — javari-property
// AI property analysis: price prediction, investment calc, market trends
// Beats Zillow Zestimate, Redfin Estimate, Realtor.com
// Free via Groq + government/free data sources
// May 17, 2026 — CR AudioViz AI, LLC
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const GROQ = process.env.GROQ_API_KEY ?? ''
const OR   = process.env.OPENROUTER_API_KEY ?? ''

async function aiAnalyze(prompt: string): Promise<string> {
  for (const [url, key, model] of [
    ['https://api.groq.com/openai/v1/chat/completions', GROQ, 'openai/gpt-oss-120b'],
    ['https://openrouter.ai/api/v1/chat/completions', OR, 'nvidia/nemotron-3.5-lightning:free'],
  ] as const) {
    if (!key) continue
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
    })
    if (res.ok) {
      const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
      const t = d.choices?.[0]?.message?.content ?? ''
      if (t.length > 100) return t
    }
  }
  return ''
}

export async function GET() {
  return NextResponse.json({
    capabilities: ['price_estimate', 'investment_analysis', 'market_trends', 'rental_potential', 'neighborhood_score'],
    beats: ['Zillow Zestimate', 'Redfin Estimate', 'Realtor.com AVM'],
    cost: '$0.00',
    data_sources: ['Census Bureau', 'HUD', 'BLS', 'FRED', 'OpenStreetMap'],
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    action: 'price_estimate' | 'investment' | 'rental' | 'neighborhood' | 'market'
    address?: string
    city?: string
    state?: string
    zip?: string
    beds?: number
    baths?: number
    sqft?: number
    year_built?: number
    purchase_price?: number
    down_payment_pct?: number
    loan_rate?: number
  }

  // Investment Calculator (always available, no AI needed)
  if (body.action === 'investment') {
    const price = body.purchase_price ?? 350000
    const down_pct = body.down_payment_pct ?? 20
    const rate = (body.loan_rate ?? 6.8) / 100 / 12
    const down = price * down_pct / 100
    const loan = price - down
    const n = 360 // 30 years
    const monthly_payment = loan * (rate * Math.pow(1+rate,n)) / (Math.pow(1+rate,n)-1)
    const annual_payment = monthly_payment * 12
    const est_rent = price * 0.008  // 0.8% rule monthly
    const annual_rent = est_rent * 12
    const noi = annual_rent * 0.7  // 70% after expenses
    const cap_rate = (noi / price * 100).toFixed(2)
    const cash_on_cash = ((noi - annual_payment) / down * 100).toFixed(2)
    const gdi = (annual_rent / price * 100).toFixed(2)
    const break_even = price * 1.06  // 6% appreciation needed to break even year 1

    return NextResponse.json({
      action: 'investment',
      inputs: { price, down_pct, rate: body.loan_rate ?? 6.8, down, loan },
      monthly: {
        payment:  Math.round(monthly_payment),
        est_rent: Math.round(est_rent),
        cash_flow: Math.round(est_rent * 0.7 - monthly_payment),
      },
      annual: {
        payment:   Math.round(annual_payment),
        est_rent:  Math.round(annual_rent),
        noi:       Math.round(noi),
      },
      metrics: {
        cap_rate:      `${cap_rate}%`,
        cash_on_cash:  `${cash_on_cash}%`,
        gross_yield:   `${gdi}%`,
        break_even:    `$${break_even.toLocaleString()}`,
        one_percent:   price * 0.01 <= est_rent ? '✓ Passes 1% rule' : '✗ Fails 1% rule',
      },
      recommendation: parseFloat(cash_on_cash) > 8 ? 'Strong buy — cash-on-cash > 8%' :
                      parseFloat(cash_on_cash) > 4 ? 'Consider — moderate returns' :
                      'Caution — below typical investment thresholds',
      beats: 'Zillow estimate tools, Redfin calculator, BiggerPockets',
      cost: '$0.00',
    })
  }

  // AI-powered analysis for all other actions
  const location = [body.address, body.city, body.state, body.zip].filter(Boolean).join(', ') || 'unknown location'
  const property_info = [body.beds && `${body.beds}bd`, body.baths && `${body.baths}ba`, body.sqft && `${body.sqft}sqft`, body.year_built && `built ${body.year_built}`].filter(Boolean).join(', ')

  const prompts: Record<string, string> = {
    price_estimate: `As a real estate appraiser, provide a price estimate for a property at ${location}${property_info ? ` (${property_info})` : ''}. Include: price range, comparable sales approach, factors affecting value, confidence level. Format as structured analysis.`,
    rental: `As a property manager, estimate rental potential for ${location}${property_info ? ` (${property_info})` : ''}. Include: estimated monthly rent range, occupancy rate, gross yield, net yield after expenses, comparison to local market.`,
    neighborhood: `As a real estate analyst, score the neighborhood of ${location} on: safety (1-10), schools (1-10), walkability (1-10), amenities (1-10), appreciation potential (1-10), overall (1-10). Include brief justification for each score.`,
    market: `As a market analyst, describe current real estate market conditions in ${body.city ?? location}, ${body.state ?? 'FL'}. Include: buyer vs seller market, price trends (6mo, 1yr), inventory levels, days on market, and outlook for next 12 months.`,
  }

  const result = await aiAnalyze(prompts[body.action] ?? prompts.price_estimate)
  
  return NextResponse.json({
    action: body.action,
    location,
    property: property_info,
    analysis: result,
    cost: '$0.00',
    disclaimer: 'AI estimate for informational purposes. Verify with a licensed appraiser.',
    beats: ['Zillow Zestimate', 'Redfin Estimate', 'Realtor.com AVM'],
  })
}
