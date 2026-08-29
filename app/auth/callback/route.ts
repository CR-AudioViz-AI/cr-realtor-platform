export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * This deployment's own origin, from the environment — never from the request.
 * See the call site below for why requestUrl.origin cannot be trusted here.
 */
function selfOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return `http://127.0.0.1:${process.env.PORT || 3000}`
}


function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

// Agent roles that should go to agent dashboard
const AGENT_ROLES = ['realtor', 'agent', 'broker', 'admin', 'platform_admin', 'team_lead']

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Log OAuth login to central activity system
      try {
        // NOT `origin`, which is requestUrl.origin and therefore built from
        // the caller's Host header. An OAuth callback runs with a freshly
        // exchanged session in hand, so `Host: attacker.example` would post
        // this user's id and login event to the attacker. The deployment's own
        // identity comes from the environment instead.
        await fetch(`${selfOrigin()}/api/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            action: 'oauth_login',
            appId: 'realtor-platform',
            metadata: { 
              provider: data.user.app_metadata?.provider || 'oauth',
              email: data.user.email
            }
          })
        })
      } catch (e) {
        // Don't block on logging errors
      }

      // Get user profile to determine redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', data.user.id)
        .single()

      // Redirect based on role
      if (profile?.is_admin || profile?.role === 'platform_admin') {
        return NextResponse.redirect(`${origin}/dashboard/admin`)
      } else if (AGENT_ROLES.includes(profile?.role || '')) {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else {
        // Customer/client role - redirect to customer portal
        return NextResponse.redirect(`${origin}/customer/dashboard`)
      }
    }
  }

  // Fallback - redirect to customer dashboard
  return NextResponse.redirect(`${origin}/customer/dashboard`)
}
