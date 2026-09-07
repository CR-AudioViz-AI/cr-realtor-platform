import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use any to bypass strict typing issues
    const { data: profile, error } = await (supabase as any)
      .from('profiles')
      .select('specialties')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
    }

    return NextResponse.json({ specialties: profile?.specialties || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { specialties } = body

    // Use any to bypass strict typing issues
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ specialties })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 })
    }

    return NextResponse.json({ success: true, specialties })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
