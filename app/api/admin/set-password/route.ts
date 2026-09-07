import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


/**
 * 2026-09-04: the gate was the last ten characters of the service-role key,
 * passed in a QUERY STRING.
 *
 * Three problems, and this route sets passwords, so each of them is account
 * takeover:
 *
 *   A URL is not a secret channel. Query strings land in proxy logs, browser
 *   history, referrer headers and every access log between here and the client.
 *
 *   The value is DERIVED FROM the service-role key. Leaking it leaks ten
 *   characters of the credential that owns the database.
 *
 *   Ten characters is short enough to attack, and nothing here rate-limits or
 *   records the attempt.
 *
 * Now it requires the full ADMIN_API_SECRET in an Authorization header, compared
 * in constant time, and refuses outright when that secret is unset rather than
 * falling back to anything.
 */
function adminAuthorised(request: Request): boolean {
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected || expected.length < 24) return false;

  const header = request.headers.get('authorization') ?? '';
  const given = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (given.length !== expected.length) return false;

  // Constant-time comparison: a length-varying early return leaks the secret one
  // character at a time to anyone willing to measure.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: NextRequest) {
  try {
    if (!adminAuthorised(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Still needed to build the admin client below. It is read here and never
    // compared against anything a caller sent - that comparison was the defect.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json(
        { error: 'Not configured.', code: 'NOT_CONFIGURED' },
        { status: 503 },
      )
    }
    
    const body = await request.json()
    const { userId, password, email } = body
    
    if (!password || (!userId && !email)) {
      return NextResponse.json({ 
        error: 'Missing userId/email or password' 
      }, { status: 400 })
    }
    
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
    
    let targetUserId = userId
    
    // If email provided, find user ID first
    if (!targetUserId && email) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const user = users?.users?.find((u: { email?: string }) => u.email === email)
      if (!user) {
        return NextResponse.json({ error: `User not found: ${email}` }, { status: 404 })
      }
      targetUserId = user.id
    }
    
    // Update password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password }
    )
    
    if (error) {
      return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: `Password updated for ${data.user?.email}`,
      userId: targetUserId
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
