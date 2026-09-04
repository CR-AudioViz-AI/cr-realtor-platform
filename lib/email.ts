// lib/email.ts - Email service using Resend for CR Realtor Platform
import { Resend } from 'resend';

// 2026-09-04: suppression and consent, reading the SAME central tables the core
// platform uses - email_suppressions and email_preferences.
//
// This module sent every message straight to Resend. sendNewListingAlert mails
// customers about properties, which is marketing, and nothing checked whether the
// recipient had unsubscribed or whether their address had already hard-bounced.
//
// The consent system was built and tested in the core platform months ago. It was
// never reached from here, because this repository has its own email module and
// nobody swept the ecosystem after building the gate. Logging that gap would have
// left it open; this closes it.
//
// Mailing an address that has hard-bounced is what damages a sending domain, and a
// domain is shared across every brand this engine serves.

type EmailCategory = "transactional" | "marketing";

/** Categories a recipient may opt out of. The rest are a record of something they did. */
const OPTIONAL = new Set<EmailCategory>(["marketing"]);

function consentDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

async function centralGet(path: string): Promise<unknown[] | null> {
  const db = consentDb();
  if (!db) return null;
  try {
    const res = await fetch(`${db.url}/rest/v1/${path}`, {
      headers: { apikey: db.key, Authorization: `Bearer ${db.key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

/** True when this address must not be mailed at all. */
async function isSuppressed(email: string): Promise<boolean> {
  const rows = await centralGet(
    `email_suppressions?select=email&email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`,
  );
  // A lookup that FAILS returns null, and null must not read as "not suppressed".
  // Failing closed on marketing is the safe direction: a delayed newsletter costs
  // nothing, a mail to a hard-bounced address costs sending reputation.
  if (rows === null) return true;
  return rows.length > 0;
}

/** True when this category may be sent to this address. */
async function hasConsent(email: string, category: EmailCategory): Promise<boolean> {
  if (!OPTIONAL.has(category)) return true;
  const rows = await centralGet(
    `email_preferences?select=marketing,unsubscribed_at&email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`,
  );
  if (rows === null) return false;      // fail closed, as above
  if (rows.length === 0) return true;   // no record means no opt-out has been expressed
  const row = rows[0] as { marketing?: boolean | null; unsubscribed_at?: string | null };
  if (row.unsubscribed_at) return false;
  return row.marketing !== false;
}


let _resend: Resend | null = null;
function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cr-realtor.com';

// Generic sendEmail function
export async function sendEmail(data: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  /** Defaults to transactional. Anything a recipient may opt out of must say so. */
  category?: EmailCategory;
}) {
  // Every message from this module now passes the same two checks the core
  // platform applies, against the same tables.
  const category: EmailCategory = data.category ?? "transactional";
  if (await isSuppressed(data.to)) {
    return { success: true, skipped: "suppressed" as const };
  }
  if (!(await hasConsent(data.to, category))) {
    return { success: true, skipped: "unsubscribed" as const };
  }

  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set, skipping email');
    return { success: true, demo: true };
  }
  try {
    // 2026-08-30: getResend() returns null when RESEND_API_KEY is absent — by design,
    // so a missing key does not construct a client at module scope. That means it has
    // to be checked, not asserted.
    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Email is not configured (RESEND_API_KEY missing).' };
    }
    const result = await resend.emails.send({
      from: data.from || `CR Realtor Platform <${FROM_EMAIL}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

// Customer invite - accepts all possible parameters for backward compatibility
export async function sendCustomerInviteEmail(data: {
  customerEmail?: string;
  email?: string;
  customerName: string;
  agentName: string;
  agentEmail?: string;
  agentPhone?: string;
  tempPassword: string;
  loginUrl: string;
}) {
  const recipientEmail = data.customerEmail || data.email;
  if (!recipientEmail) return { success: false, error: 'No recipient email' };
  
  return sendEmail({
    to: recipientEmail,
    subject: `Welcome to Your Real Estate Portal - ${data.agentName}`,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Your Portal!</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Hi ${data.customerName},</p>
          <p>${data.agentName} has created a personalized real estate portal for you.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Login:</strong> ${recipientEmail}</p>
            <p style="margin: 10px 0 0 0;"><strong>Temp Password:</strong> ${data.tempPassword}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Access Your Portal</a>
          </div>
          <p style="color: #666; font-size: 14px;">Contact ${data.agentName}${data.agentPhone ? ` at ${data.agentPhone}` : ''}${data.agentEmail ? ` or ${data.agentEmail}` : ''} with questions.</p>
        </div>
      </body></html>
    `,
  });
}

// New listing alert
export async function sendNewListingAlert(data: {
  customerEmail: string;
  customerName: string;
  properties: Array<{ address: string; city: string; price: number; bedrooms: number; bathrooms: number; sqft: number; imageUrl?: string; propertyUrl: string; }>;
  searchName: string;
  agentName: string;
}) {
  const cards = data.properties.map(p => `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 15px;">
      ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.address}" style="width: 100%; height: 180px; object-fit: cover;">` : ''}
      <div style="padding: 15px;">
        <h3 style="margin: 0 0 5px 0; color: #1e3a5f;">${p.address}</h3>
        <p style="margin: 0; font-size: 20px; font-weight: bold; color: #2563eb;">$${p.price.toLocaleString()}</p>
        <p style="margin: 5px 0; color: #666;">${p.bedrooms} bed • ${p.bathrooms} bath • ${p.sqft.toLocaleString()} sqft</p>
        <a href="${p.propertyUrl}" style="color: #2563eb;">View Details →</a>
      </div>
    </div>
  `).join('');
  return sendEmail({ category: 'marketing', to: data.customerEmail, subject: `🏠 ${data.properties.length} New Properties Match: ${data.searchName}`, html: `<body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;"><h2>New Properties for You!</h2><p>Hi ${data.customerName}, ${data.properties.length} new properties match "${data.searchName}":</p>${cards}</body>` });
}

// Showing confirmation
export async function sendShowingConfirmation(data: { customerEmail: string; customerName: string; propertyAddress: string; showingDate: string; showingTime: string; agentName: string; agentPhone?: string; notes?: string; }) {
  return sendEmail({ to: data.customerEmail, subject: `✅ Showing Confirmed: ${data.propertyAddress}`, html: `<body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;"><h2>✅ Showing Confirmed!</h2><p>Hi ${data.customerName},</p><div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 20px 0;"><p><strong>Property:</strong> ${data.propertyAddress}</p><p><strong>Date:</strong> ${data.showingDate} at ${data.showingTime}</p><p><strong>Agent:</strong> ${data.agentName}${data.agentPhone ? ` • ${data.agentPhone}` : ''}</p></div>${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}</body>` });
}

// New lead notification
export async function sendNewLeadNotification(data: { agentEmail: string; agentName: string; leadName: string; leadEmail: string; leadPhone?: string; source: string; propertyInterest?: string; message?: string; dashboardUrl: string; }) {
  return sendEmail({ to: data.agentEmail, subject: `🔥 New Lead: ${data.leadName}`, html: `<body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;"><h2>🔥 New Lead!</h2><div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>${data.leadName}</h3><p><strong>Email:</strong> ${data.leadEmail}</p>${data.leadPhone ? `<p><strong>Phone:</strong> ${data.leadPhone}</p>` : ''}<p><strong>Source:</strong> ${data.source}</p>${data.propertyInterest ? `<p><strong>Interest:</strong> ${data.propertyInterest}</p>` : ''}</div>${data.message ? `<p><em>"${data.message}"</em></p>` : ''}<a href="${data.dashboardUrl}" style="background: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Lead</a></body>` });
}

// Showing request
export async function sendShowingRequest(data: { agentEmail: string; agentName: string; customerName: string; customerEmail: string; customerPhone: string; propertyAddress: string; requestedDate: string; requestedTime: string; alternateDate?: string; alternateTime?: string; message?: string; dashboardUrl: string; }) {
  return sendEmail({ to: data.agentEmail, subject: `🏠 Showing Request: ${data.propertyAddress}`, html: `<body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;"><h2>New Showing Request</h2><p>Hi ${data.agentName},</p><div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;"><p><strong>Property:</strong> ${data.propertyAddress}</p><p><strong>Requested:</strong> ${data.requestedDate} at ${data.requestedTime}</p>${data.alternateDate ? `<p><strong>Alternate:</strong> ${data.alternateDate} at ${data.alternateTime}</p>` : ''}<hr><p><strong>Client:</strong> ${data.customerName}</p><p><strong>Email:</strong> ${data.customerEmail}</p><p><strong>Phone:</strong> ${data.customerPhone}</p></div>${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}<a href="${data.dashboardUrl}" style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Confirm Showing</a></body>` });
}
