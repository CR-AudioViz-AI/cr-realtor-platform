export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: history, error } = await supabase
      .from('home_value_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    // Get user's home info for purchase price
    const { data: profile } = await supabase
      .from('profiles')
      .select('home_purchase_price, home_purchase_date')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      history: history || [],
      current_value: history?.[0]?.estimated_value || 0,
      purchase_price: profile?.home_purchase_price || 0,
      purchase_date: profile?.home_purchase_date || null,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch value history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { estimated_value, source } = body;

    // Get previous value to calculate change
    const { data: lastValue } = await supabase
      .from('home_value_history')
      .select('estimated_value')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    let changePercent = null;
    if (lastValue) {
      changePercent = ((estimated_value - lastValue.estimated_value) / lastValue.estimated_value) * 100;
    }

    const { data: value, error } = await supabase
      .from('home_value_history')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        estimated_value,
        source: source || 'manual',
        change_percent: changePercent,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ value });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to add value' }, { status: 500 });
  }
}
