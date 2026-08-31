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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get document count
    const { count: documentCount } = await supabase
      .from('home_documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get YTD expenses
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const { data: expenses } = await supabase
      .from('home_expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startOfYear);

    const expensesYTD = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    // Get warranty counts
    const now = new Date().toISOString();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count: activeWarranties } = await supabase
      .from('warranties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('warranty_end_date', now);

    const { count: expiringWarranties } = await supabase
      .from('warranties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('warranty_end_date', now)
      .lt('warranty_end_date', thirtyDaysFromNow);

    // Get overdue maintenance count
    const { count: maintenanceDue } = await supabase
      .from('maintenance_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .lt('next_due', now);

    // Get home value (latest)
    const { data: homeValue } = await supabase
      .from('home_value_history')
      .select('estimated_value, change_percent')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // Get upcoming reminders
    const { data: reminders } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_sent', false)
      .lte('due_date', thirtyDaysFromNow)
      .order('due_date', { ascending: true })
      .limit(5);

    return NextResponse.json({
      stats: {
        documents: documentCount || 0,
        expenses_ytd: expensesYTD,
        warranties_active: activeWarranties || 0,
        warranties_expiring: expiringWarranties || 0,
        maintenance_due: maintenanceDue || 0,
        home_value: homeValue?.estimated_value || 0,
        home_value_change: homeValue?.change_percent || 0,
      },
      reminders: reminders || [],
    });

  } catch (error) {
    console.error('Error getting homeowner stats:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
