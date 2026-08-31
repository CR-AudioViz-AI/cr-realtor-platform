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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    // Get the task
    const { data: task, error: fetchError } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Calculate next due date based on frequency
    let nextDue = new Date();
    switch (task.frequency) {
      case 'weekly': nextDue.setDate(nextDue.getDate() + 7); break;
      case 'monthly': nextDue.setMonth(nextDue.getMonth() + 1); break;
      case 'quarterly': nextDue.setMonth(nextDue.getMonth() + 3); break;
      case 'semi_annual': nextDue.setMonth(nextDue.getMonth() + 6); break;
      case 'annual': nextDue.setFullYear(nextDue.getFullYear() + 1); break;
      default: nextDue = new Date(task.next_due); // one_time stays same
    }

    // Update the task
    const { data: updated, error: updateError } = await supabase
      .from('maintenance_tasks')
      .update({
        status: task.frequency === 'one_time' ? 'completed' : 'pending',
        last_completed: new Date().toISOString(),
        next_due: task.frequency === 'one_time' ? task.next_due : nextDue.toISOString().split('T')[0],
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}
