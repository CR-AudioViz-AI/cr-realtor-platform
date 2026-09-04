export const dynamic = 'force-dynamic'
export const revalidate = 0
// =============================================================================
// CONSENT MANAGEMENT API
// CR AudioViz AI - Realtor Platform
// Created: Monday, December 30, 2025 | 12:58 PM EST
// Endpoint: POST /api/consent
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 

  ConsentRequest, 
  ConsentResponse, 
  ConsentScope, 
  WithdrawConsentRequest 
} from '@/types/attribution';


function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = process.env.NEXT_PUBLIC_SUPABASE_URL
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}



const CONSENT_VERSION = '1.0.0';

// Get current consent text based on version
function getConsentText(scopes: ConsentScope[]): string {
  const scopeDescriptions: Record<ConsentScope, string> = {
    attribution: 'track which properties I view and my real estate journey',
    marketing: 'send me personalized property recommendations',
    analytics: 'collect anonymous usage data to improve the platform',
    all: 'all of the above permissions',
  };

  const selectedDescriptions = scopes.map((s) => scopeDescriptions[s]).join(', ');
  
  return `I consent to allow my real estate agent to ${selectedDescriptions}. I understand I can withdraw this consent at any time through my account settings.`;
}

// POST - Grant or update consent

// 2026-09-04: IDOR CLOSED on all three handlers.
//
// POST, GET and DELETE each took user_id straight from the request and used it
// against a SERVICE-ROLE client, which bypasses row level security. Nothing
// authenticated the caller.
//
// This is a CONSENT api, which makes it the worst place for this defect. It
// allowed anyone to read whose data an agent may access, to GRANT an agent access
// to a stranger's data by posting their id, and to WITHDRAW somebody's consent
// without their knowledge. A consent record that can be written by anyone is not
// a consent record.
//
// The id now comes from the verified bearer token. A user_id in the request is
// ignored rather than validated, because accepting one at all is the defect.
async function callerId(request: NextRequest): Promise<string | null> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

function unauthorised(): NextResponse {
  return NextResponse.json(
    { success: false, message: 'Sign in required.', code: 'AUTH_REQUIRED' },
    { status: 401 },
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()!
  try {
    const body: ConsentRequest = await request.json();
    // user_id is deliberately not taken from the body.
    const { agent_id, scopes, ip_address, user_agent } = body;
    const user_id = await callerId(request);
    if (!user_id) return unauthorised();

    // Validate required fields
    if (!user_id || !agent_id || !scopes || scopes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for existing consent
    const { data: existingConsent } = await supabase
      .from('consent_records')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('agent_id', agent_id)
      .eq('status', 'granted')
      .single();

    const consentText = getConsentText(scopes);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiration

    if (existingConsent) {
      // Update existing consent
      const { data, error } = await supabase
        .from('consent_records')
        .update({
          scope: scopes,
          consent_text: consentText,
          consent_version: CONSENT_VERSION,
          ip_address,
          user_agent,
          granted_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConsent.id)
        .select()
        .single();

      if (error) throw error;

      // Log the consent update
      await logConsentEvent(user_id, agent_id, 'updated', scopes);

      const response: ConsentResponse = {
        success: true,
        consent_id: data.id,
        status: 'granted',
        expires_at: expiresAt.toISOString(),
        message: 'Consent updated successfully',
      };

      return NextResponse.json(response);
    }

    // Create new consent record
    const { data, error } = await supabase
      .from('consent_records')
      .insert({
        user_id,
        agent_id,
        scope: scopes,
        status: 'granted',
        ip_address,
        user_agent,
        consent_text: consentText,
        consent_version: CONSENT_VERSION,
        granted_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Log the consent grant
    await logConsentEvent(user_id, agent_id, 'granted', scopes);

    const response: ConsentResponse = {
      success: true,
      consent_id: data.id,
      status: 'granted',
      expires_at: expiresAt.toISOString(),
      message: 'Consent granted successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Consent API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process consent' },
      { status: 500 }
    );
  }
}

// GET - Check consent status
export async function GET(request: NextRequest) {
  const supabase = getSupabase()!
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    const userId = await callerId(request);
    if (!userId) return unauthorised();

    if (!userId || !agentId) {
      return NextResponse.json(
        { success: false, message: 'Missing user_id or agent_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({
        success: true,
        has_consent: false,
        status: 'pending',
        scopes: [],
        message: 'No consent record found',
      });
    }

    // Check if consent has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({
        success: true,
        has_consent: false,
        status: 'expired',
        scopes: [],
        message: 'Consent has expired',
      });
    }

    return NextResponse.json({
      success: true,
      has_consent: data.status === 'granted',
      status: data.status,
      scopes: data.scope,
      consent_id: data.id,
      granted_at: data.granted_at,
      expires_at: data.expires_at,
      message: 'Consent status retrieved',
    });
  } catch (error) {
    console.error('Consent check error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check consent status' },
      { status: 500 }
    );
  }
}

// DELETE - Withdraw consent
export async function DELETE(request: NextRequest) {
  const supabase = getSupabase()!
  try {
    const body: WithdrawConsentRequest = await request.json();
    const { consent_id, reason } = body;
    const user_id = await callerId(request);
    if (!user_id) return unauthorised();

    if (!consent_id || !user_id) {
      return NextResponse.json(
        { success: false, message: 'Missing consent_id or user_id' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingConsent, error: fetchError } = await supabase
      .from('consent_records')
      .select('agent_id, scope')
      .eq('id', consent_id)
      .eq('user_id', user_id)
      .single();

    if (fetchError || !existingConsent) {
      return NextResponse.json(
        { success: false, message: 'Consent record not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update consent status to withdrawn
    const { error } = await supabase
      .from('consent_records')
      .update({
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', consent_id);

    if (error) throw error;

    // Log the withdrawal
    await logConsentEvent(user_id, existingConsent.agent_id, 'withdrawn', existingConsent.scope, reason);

    return NextResponse.json({
      success: true,
      message: 'Consent withdrawn successfully. Your agent will no longer be able to track your activity.',
    });
  } catch (error) {
    console.error('Consent withdrawal error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to withdraw consent' },
      { status: 500 }
    );
  }
}

// Helper: Log consent events for audit trail
async function logConsentEvent(
  userId: string,
  agentId: string,
  action: 'granted' | 'updated' | 'withdrawn',
  scopes: ConsentScope[],
  reason?: string
) {
  try {
    // 2026-08-30: this helper lives OUTSIDE every handler and used `supabase` from a
    // scope it cannot see. TS2304 'Cannot find name supabase' — meaning the consent
    // AUDIT TRAIL has never written a single row. On a consent endpoint, that is the
    // part regulators ask about.
    //
    // Uses the file's own getSupabase() factory, the same one every handler here uses.
    const supabase = getSupabase()!
    await supabase.from('audit_logs').insert({
      entity_type: 'consent',
      entity_id: `${userId}_${agentId}`,
      action,
      actor_id: userId,
      actor_type: 'user',
      metadata: {
        scopes,
        reason,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to log consent event:', error);
    // Don't throw - logging failure shouldn't break consent flow
  }
}
