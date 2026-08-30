import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    // 2026-08-30: THE SECRET NO LONGER TRAVELS IN THE URL.
    //
    // This route compared a query parameter to serviceKey.slice(-10) — the last ten
    // characters of SUPABASE_SERVICE_ROLE_KEY, passed in a query string. Query
    // strings land in Vercel request logs, browser history, and the Referer header
    // of every outbound link. That leaked ten characters of the service-role key to
    // three places, on a route that dumps EVERY auth user's email and sign-in time.
    //
    // Now an Authorization header compared against the FULL ADMIN_SECRET, in
    // constant time.
    const auth = request.headers.get('authorization') ?? ''
    const presented = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    
    // 2026-08-30: serviceKey is still declared — it is used below to build the
    // admin client. My first edit deleted the line that declared it along with the
    // insecure comparison that used it, and the build caught that immediately.
    // Removing a bad USE of a variable is not the same as removing the variable.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

    const expected = process.env.ADMIN_SECRET ?? ''
    // No fallback literal. A `?? "some-default"` on an admin gate is an open door
    // wearing a lock, and that exact pattern was removed from core on 2026-08-28.
    if (expected.length === 0 || presented.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Constant time. A plain !== leaks the secret one character at a time to
    // anyone measuring the response.
    let diff = presented.length ^ expected.length
    for (let i = 0; i < presented.length && i < expected.length; i++) {
      diff |= presented.charCodeAt(i) ^ expected.charCodeAt(i)
    }
    if (diff !== 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Create admin client
    // 2026-08-24: called createClient() with NO IMPORT - a plain ReferenceError,
    // so this route crashed on the first line touching the database. Same class as
    // the 15 undefined calls found across the core expenses module. The file
    // already obtains the SDK via require inside getSupabase(); this call site was
    // missed. Now uses the same runtime import.
    const { createClient: _mk } = require('@supabase/supabase-js');
    const supabaseAdmin = _mk(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
      serviceKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    
    // List auth users using admin API
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json({ 
        error: authError.message,
        hint: 'Auth admin API failed'
      }, { status: 500 })
    }
    
    // Get profiles for comparison
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role')
    
    return NextResponse.json({
      success: true,
      // 2026-08-30: `u` annotated. The implicit any failed the build — the ONLY
      // thing standing between this route and production, which means the
      // query-string secret above would have shipped if the checker were quieter.
      authUsers: authUsers?.users?.map((u: {
        id: string
        email?: string
        created_at?: string
        last_sign_in_at?: string
        app_metadata?: { provider?: string }
      }) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        provider: u.app_metadata?.provider || 'email'
      })) || [],
      profiles: profiles || [],
      profilesError: profilesError?.message || null,
      authCount: authUsers?.users?.length || 0,
      profileCount: profiles?.length || 0
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
