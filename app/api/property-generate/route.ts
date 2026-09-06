// 2026-09-04: dead OpenRouter model replaced, and a note on why this recurs.
//
// deepseek/deepseek-v4-flash:free is no longer served. A request naming it
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
// app/api/generate/route.ts — javari-property
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'; export const runtime = 'nodejs'; export const maxDuration = 60
const GROQ = process.env.GROQ_API_KEY ?? ''; const OR = process.env.OPENROUTER_API_KEY ?? ''
const SYSTEM = `You are a real estate expert for CR AudioViz AI. Help with property searches, market analysis, investment evaluation, rental analysis, and real estate documentation.`; const ACTIONS = ["market_analysis", "investment_evaluation", "rental_estimate", "property_description", "offer_letter", "lease_agreement"]; const COST = 6
async function gen(p: string): Promise<string> {
  if (OR) { try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${OR}`,'HTTP-Referer':'https://craudiovizai.com'}, body:JSON.stringify({model:'nvidia/nemotron-3.5-lightning:free',max_tokens:2048,temperature:0.7,messages:[{role:'system',content:SYSTEM},{role:'user',content:p}]}) })
    if (r.ok) { const d = await r.json() as {choices?:Array<{message?:{content?:string}}> }; const t = d.choices?.[0]?.message?.content ?? ''; if (t.length > 50) return t }
  } catch {} }
  if (!GROQ) throw new Error('no AI key')
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${GROQ}`}, body:JSON.stringify({model:'openai/gpt-oss-120b',max_tokens:2048,temperature:0.7,messages:[{role:'system',content:SYSTEM},{role:'user',content:p}]}) })
  if (!r.ok) throw new Error(`Groq ${r.status}`); const d = await r.json() as {choices?:Array<{message?:{content?:string}}> }; return d.choices?.[0]?.message?.content ?? ''
}
export async function GET() { return NextResponse.json({actions:ACTIONS,cost:COST+' credits',cost_usd:'$0.00'}) }
export async function POST(req: NextRequest) {
  try {
    const b = await req.json() as {action:string;input:string}
    if (!b.input?.trim()) return NextResponse.json({error:'input required'},{status:400})
    if (!ACTIONS.includes(b.action)) return NextResponse.json({error:'invalid action',available:ACTIONS},{status:400})
    const result = await gen(`${b.action.replace(/_/g,' ')}: ${b.input}`)
    return NextResponse.json({result,action:b.action,cost_usd:'$0.00',credits_used:COST})
  } catch(err) { return NextResponse.json({error:String(err)},{status:500}) }
}