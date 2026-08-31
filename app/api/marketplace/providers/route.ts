export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = request.nextUrl;
    
    const category = searchParams.get('category');
    const zip = searchParams.get('zip');
    const search = searchParams.get('search');

    let query = supabase
      .from('service_providers')
      .select('*')
      .eq('subscription_status', 'active')
      .order('subscription_tier', { ascending: false })
      .order('rating', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (zip) {
      query = query.contains('service_areas', [zip]);
    }

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: providers, error } = await query.limit(50);

    if (error) throw error;
    return NextResponse.json({ providers: providers || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to load providers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    const { data: provider, error } = await supabase
      .from('service_providers')
      .insert({
        user_id: user.id,
        ...body,
        rating: 0,
        review_count: 0,
        is_verified: false,
        subscription_status: 'trial',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ provider });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
