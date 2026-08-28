import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";


function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

const SUPABASE_URL = supabaseUrl();
const supabaseServiceKey = secretKey();
const resendApiKey = process.env.RESEND_API_KEY;

// Admin client for email operations — lazy init
function getAdminClient() { return getSupabase(); }

// Untyped client for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = new Proxy({}, { get(_: any, prop: string) { return (getAdminClient() as any)?.[prop]; } });

interface EmailSettings {
  id: string;
  agent_id: string;
  provider: 'gmail' | 'outlook' | 'smtp';
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  sender_email: string;
  sender_name?: string;
  signature?: string;
  is_verified: boolean;
}

interface SendEmailParams {
  agentId: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

/**
 * Get agent's email settings from database
 */
export async function getAgentEmailSettings(agentId: string): Promise<EmailSettings | null> {
  const { data, error } = await db
    .from('agent_email_settings')
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as EmailSettings;
}

/**
 * Check if agent has email configured and verified
 */
export async function hasAgentEmailConfigured(agentId: string): Promise<boolean> {
  const settings = await getAgentEmailSettings(agentId);
  return settings !== null && settings.is_verified === true;
}

/**
 * Refresh Gmail access token if expired
 */
async function refreshGmailToken(settings: EmailSettings): Promise<string | null> {
  if (!settings.refresh_token) {
    return null;
  }

  // Check if token is expired
  if (settings.token_expires_at) {
    const expiresAt = new Date(settings.token_expires_at);
    if (expiresAt > new Date(Date.now() + 60000)) {
      // Token valid for more than 1 minute
      return settings.access_token || null;
    }
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: settings.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text());
      return null;
    }

    const tokens = await response.json();
    const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Update token in database
    await db
      .from('agent_email_settings')
      .update({
        access_token: tokens.access_token,
        token_expires_at: newExpiresAt,
      })
      .eq('agent_id', settings.agent_id);

    return tokens.access_token;
  } catch (err) {
    console.error('Token refresh error:', err);
    return null;
  }
}

/**
 * Send email via Gmail API
 */
async function sendViaGmail(
  settings: EmailSettings,
  params: SendEmailParams
): Promise<EmailResult> {
  const accessToken = await refreshGmailToken(settings);
  
  if (!accessToken) {
    return { success: false, error: 'Gmail token expired or invalid' };
  }

  try {
    // Create email message in RFC 2822 format
    const fromHeader = settings.sender_name 
      ? `${settings.sender_name} <${settings.sender_email}>`
      : settings.sender_email;

    // Add signature if configured
    let htmlContent = params.html;
    if (settings.signature) {
      htmlContent += `<br/><br/>--<br/>${settings.signature}`;
    }

    const messageParts = [
      `From: ${fromHeader}`,
      `To: ${params.to}`,
      `Subject: ${params.subject}`,
      params.replyTo ? `Reply-To: ${params.replyTo}` : '',
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlContent,
    ].filter(Boolean);

    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedMessage }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gmail send failed:', errorData);
      
      // Update settings with error
      await db
        .from('agent_email_settings')
        .update({ last_error: `Gmail error: ${response.status}` })
        .eq('agent_id', settings.agent_id);

      return { success: false, error: `Gmail API error: ${response.status}` };
    }

    const result = await response.json();
    
    // Clear any previous errors
    await db
      .from('agent_email_settings')
      .update({ last_error: null })
      .eq('agent_id', settings.agent_id);

    return {
      success: true,
      messageId: result.id,
      provider: 'gmail',
    };
  } catch (err) {
    console.error('Gmail send error:', err);
    return { success: false, error: 'Failed to send via Gmail' };
  }
}

/**
 * Send email via SMTP (placeholder for future implementation)
 */
async function sendViaSMTP(
  settings: EmailSettings,
  params: SendEmailParams
): Promise<EmailResult> {
  // TODO: Implement nodemailer SMTP sending
  return { 
    success: false, 
    error: 'SMTP sending not yet implemented' 
  };
}

/**
 * Send email via Outlook (placeholder for future implementation)
 */
async function sendViaOutlook(
  settings: EmailSettings,
  params: SendEmailParams
): Promise<EmailResult> {
  // TODO: Implement Microsoft Graph API sending
  return { 
    success: false, 
    error: 'Outlook sending not yet implemented' 
  };
}

/**
 * Send email via Resend (fallback) - uses existing lib/email.ts
 */
async function sendViaResend(params: SendEmailParams): Promise<EmailResult> {
  if (!resendApiKey) {
    return { success: false, error: 'Resend not configured (RESEND_API_KEY missing)' };
  }

  try {
    // Use the existing email.ts sendEmail function instead of importing Resend directly
    // This avoids requiring the resend package if it's not installed
    const { sendEmail } = await import('@/lib/email');
    
    const result = await sendEmail({
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (!result.success) {
      return { success: false, error: result.error ? String(result.error) : 'Failed to send via Resend' };
    }

    return {
      success: true,
      messageId: result.id,
      provider: 'resend',
    };
  } catch (err) {
    console.error('Resend import/send error:', err);
    return { success: false, error: 'Resend fallback not available' };
  }
}

/**
 * Main function to send email from agent's account
 * Falls back to Resend if agent email not configured
 */
export async function sendAgentEmail(params: SendEmailParams): Promise<EmailResult> {
  // Try to get agent's email settings
  const settings = await getAgentEmailSettings(params.agentId);

  if (settings && settings.is_verified) {
    // Send via agent's configured provider
    switch (settings.provider) {
      case 'gmail':
        return sendViaGmail(settings, params);
      case 'outlook':
        return sendViaOutlook(settings, params);
      case 'smtp':
        return sendViaSMTP(settings, params);
      default:
        console.warn(`Unknown provider: ${settings.provider}, falling back to Resend`);
    }
  }

  // Fallback to Resend via existing lib/email.ts
  console.log('Using Resend fallback for agent:', params.agentId);
  return sendViaResend(params);
}

/**
 * Log email send attempt
 */
export async function logEmailSend(params: {
  agentId: string;
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
}): Promise<void> {
  try {
    await db
      .from('agent_email_log')
      .insert({
        agent_id: params.agentId,
        recipient_email: params.recipientEmail,
        subject: params.subject,
        status: params.status,
        message_id: params.messageId,
        error_message: params.error,
        sent_at: new Date().toISOString(),
      });
  } catch (err) {
    console.error('Failed to log email send:', err);
  }
}

