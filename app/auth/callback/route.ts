import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
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
        await fetch(`${origin}/api/activity`, {
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
