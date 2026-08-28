import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = 'force-dynamic'

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
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

    // Use any type to bypass TypeScript issues with incomplete database types
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && !profile.is_admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if features table exists, return empty array if not
    const { data: features, error } = await (supabase as any)
      .from('features')
      .select('*')
      .order('category')
      .order('display_name')

    if (error) {
      // Table might not exist, return empty features
      console.log('Features table error:', error.message)
      return NextResponse.json({ features: [] })
    }

    return NextResponse.json({ features: features || [] })
  } catch (error: any) {
    console.error('Admin features error:', error)
    return NextResponse.json({ features: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && !profile.is_admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { featureId, enabled } = body

    const { error } = await (supabase as any)
      .from('features')
      .update({ is_enabled: enabled })
      .eq('id', featureId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
