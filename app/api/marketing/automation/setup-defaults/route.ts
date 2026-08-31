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

const DEFAULT_TEMPLATES = [
  {
    name: 'Birthday Greeting',
    type: 'birthday',
    subject: 'Happy Birthday, {{first_name}}! 🎂',
    body: `Dear {{first_name}},

Wishing you a wonderful birthday filled with joy and happiness!

It's been a pleasure working with you, and I hope this year brings you everything you've been hoping for.

Warm regards,
{{agent_name}}
{{agent_phone}}`,
    variables: ['first_name', 'agent_name', 'agent_phone'],
  },
  {
    name: 'Home Anniversary',
    type: 'home_anniversary',
    subject: 'Happy Home Anniversary! 🏠',
    body: `Dear {{first_name}},

Can you believe it's been {{years}} year(s) since you moved into {{home_address}}? Time flies when you're in a place you love!

I hope your home continues to bring you joy. If you ever have questions about your home's value or the market, I'm always here to help.

Best,
{{agent_name}}`,
    variables: ['first_name', 'years', 'home_address', 'agent_name'],
  },
  {
    name: 'Holiday - Thanksgiving',
    type: 'holiday',
    subject: 'Happy Thanksgiving! 🦃',
    body: `Dear {{first_name}},

Wishing you and your family a wonderful Thanksgiving filled with gratitude, good food, and great company.

I'm thankful to have clients like you!

Warmly,
{{agent_name}}`,
    variables: ['first_name', 'agent_name'],
  },
];

const DEFAULT_RULES = [
  {
    name: 'Birthday Auto-Message',
    type: 'birthday',
    trigger: 'date_based',
    trigger_config: { days_before: 0 },
    send_via: ['email'],
  },
  {
    name: 'Home Anniversary',
    type: 'home_anniversary',
    trigger: 'date_based',
    trigger_config: { days_before: 0 },
    send_via: ['email'],
  },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Create default templates
    const templatesWithAgent = DEFAULT_TEMPLATES.map(t => ({
      ...t,
      agent_id: user.id,
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: templates, error: tError } = await supabase
      .from('message_templates')
      .upsert(templatesWithAgent, { onConflict: 'agent_id,type' })
      .select();

    if (tError) throw tError;

    // Create default rules linked to templates
    const templateMap = templates?.reduce((m: Record<string, string>, t: { type: string; id: string }) => ({ ...m, [t.type]: t.id }), {} as Record<string, string>) || {};
    
    const rulesWithAgent = DEFAULT_RULES.map(r => ({
      ...r,
      agent_id: user.id,
      template_id: templateMap[r.type],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: rules, error: rError } = await supabase
      .from('automation_rules')
      .upsert(rulesWithAgent, { onConflict: 'agent_id,type' })
      .select();

    if (rError) throw rError;

    return NextResponse.json({ 
      success: true, 
      templates: templates?.length || 0,
      rules: rules?.length || 0,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to setup defaults' }, { status: 500 });
  }
}
