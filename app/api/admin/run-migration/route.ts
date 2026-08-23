import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export const maxDuration = 60

// This endpoint runs the RLS fix using service role (bypasses RLS)
// Call: GET /api/admin/run-migration?key=YOUR_KEY
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    // Verify admin access (last 10 chars of service key)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey || !adminKey || adminKey !== serviceKey.slice(-10)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Create admin client with service role
    // 2026-08-26: called createClient() with NO IMPORT - a plain ReferenceError,
    // so this route crashed on the first line touching the database. Same class as
    // the 15 undefined calls found across the core expenses module. The file
    // already obtains the SDK via require inside getSupabase(); this call site was
    // missed. Now uses the same runtime import.
    const { createClient: _mk } = require('@supabase/supabase-js');
    const supabaseAdmin = _mk(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
      serviceKey,
      {
        auth: { persistSession: false },
        db: { schema: 'public' }
      }
    )
    
    const results: string[] = []
    
    // The service role key should bypass RLS
    // Let's test by reading properties
    const { data: testProps, error: testError } = await supabaseAdmin
      .from('properties')
      .select('id, title')
      .limit(1)
    
    if (testError) {
      results.push(`Test query error: ${testError.message}`)
      results.push(`Service key starts with: ${serviceKey.substring(0, 30)}...`)
      results.push(`Service key ends with: ...${serviceKey.slice(-20)}`)
    } else {
      results.push(`✅ Service role working! Found ${testProps?.length || 0} properties`)
    }
    
    // Try to read profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, role')
      .eq('role', 'realtor')
    
    if (profilesError) {
      results.push(`Profiles error: ${profilesError.message}`)
    } else {
      results.push(`✅ Profiles accessible: ${profiles?.length || 0} realtors`)
      profiles?.forEach(p => results.push(`  - ${p.full_name}: ${p.email}`))
    }
    
    // Try knowledge base
    const { data: kb, error: kbError } = await supabaseAdmin
      .from('javari_knowledge_base')
      .select('topic, category')
      .limit(5)
    
    if (kbError) {
      results.push(`Knowledge base error: ${kbError.message}`)
    } else {
      results.push(`✅ Knowledge base: ${kb?.length || 0} entries`)
    }
    
    // Try market data
    const { data: market, error: marketError } = await supabaseAdmin
      .from('javari_market_data')
      .select('metric_type, value')
    
    if (marketError) {
      results.push(`Market data error: ${marketError.message}`)
    } else {
      results.push(`✅ Market data: ${market?.length || 0} entries`)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration check complete',
      results,
      timestamp: new Date().toISOString(),
      envCheck: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!serviceKey,
        serviceKeyLength: serviceKey?.length || 0
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
