// CR AudioViz AI - Mortgage Rate Monitor
// Rate Alerts API with Resend Email Integration
// December 17, 2025
//
// Features:
// - Create rate alerts with email verification
// - Verify alerts via token
// - Unsubscribe functionality
// - Uses Resend (3,000 emails/month FREE)

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

// Initialize Supabase
const supabase = createClient(
  supabaseUrl(),
  secretKey()
);

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mortgage Rate Monitor <alerts@craudiovizai.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mortgage-rate-monitor.vercel.app';

interface AlertRequest {
  email: string;
  rateType: string;
  targetRate: number;
  direction: 'below' | 'above';
  state?: string;
}

// Send email via Resend API
async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Generate verification token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Email templates
const emailTemplates = {
  verification: (token: string, alert: AlertRequest) => ({
    subject: `Verify Your Rate Alert - ${alert.rateType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">🏠 Mortgage Rate Monitor</h1>
            <p style="color: #6b7280; margin: 5px 0 0;">by CR AudioViz AI</p>
          </div>
          
          <h2 style="color: #111827; margin-bottom: 20px;">Verify Your Rate Alert</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            You've requested to be notified when <strong>${alert.rateType}</strong> rates go 
            <strong>${alert.direction}</strong> <strong>${alert.targetRate}%</strong>.
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            Please click the button below to verify your email and activate your alert:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/api/alerts/verify?token=${token}" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Verify & Activate Alert
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            This link expires in 24 hours. If you didn't request this alert, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            CR AudioViz AI, LLC • Fort Myers, FL<br>
            <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent(alert.email)}" style="color: #6b7280;">Unsubscribe from all alerts</a>
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  confirmation: (alert: AlertRequest) => ({
    subject: `✅ Rate Alert Activated - ${alert.rateType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">🏠 Mortgage Rate Monitor</h1>
            <p style="color: #6b7280; margin: 5px 0 0;">by CR AudioViz AI</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 30px;">✓</span>
            </div>
          </div>
          
          <h2 style="color: #111827; text-align: center; margin-bottom: 20px;">Alert Activated!</h2>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #374151; margin: 0 0 10px;"><strong>Rate Type:</strong> ${alert.rateType}</p>
            <p style="color: #374151; margin: 0 0 10px;"><strong>Target:</strong> ${alert.direction === 'below' ? 'Below' : 'Above'} ${alert.targetRate}%</p>
            <p style="color: #374151; margin: 0;"><strong>Email:</strong> ${alert.email}</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            We'll notify you as soon as ${alert.rateType} rates go ${alert.direction} ${alert.targetRate}%. 
            Rate data is updated daily from the Federal Reserve (FRED).
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/rates" 
               style="display: inline-block; background: #1e40af; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
              View Current Rates
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            CR AudioViz AI, LLC • Fort Myers, FL<br>
            <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent(alert.email)}" style="color: #6b7280;">Manage alert preferences</a>
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  triggered: (alert: AlertRequest, currentRate: number) => ({
    subject: `🔔 Rate Alert: ${alert.rateType} is now ${currentRate}%`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">🏠 Mortgage Rate Monitor</h1>
            <p style="color: #6b7280; margin: 5px 0 0;">by CR AudioViz AI</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 30px;">🔔</span>
            </div>
          </div>
          
          <h2 style="color: #111827; text-align: center; margin-bottom: 10px;">Rate Alert Triggered!</h2>
          <p style="color: #6b7280; text-align: center; margin-bottom: 30px;">Your target rate has been reached</p>
          
          <div style="background: linear-gradient(135deg, #dbeafe, #e0e7ff); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <p style="color: #374151; margin: 0 0 5px; font-size: 14px;">${alert.rateType}</p>
            <p style="color: #1e40af; margin: 0; font-size: 48px; font-weight: 700;">${currentRate}%</p>
            <p style="color: #059669; margin: 10px 0 0; font-size: 14px;">
              ${alert.direction === 'below' ? '↓' : '↑'} Target: ${alert.targetRate}%
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6; text-align: center;">
            ${alert.rateType} rates are now ${alert.direction} your target of ${alert.targetRate}%. 
            This could be a good time to explore your options!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/compare" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">
              Compare Lenders
            </a>
            <a href="${APP_URL}/rates" 
               style="display: inline-block; background: #f3f4f6; color: #374151; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View All Rates
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This alert has been deactivated. Create a new alert to continue monitoring.<br>
            CR AudioViz AI, LLC • Fort Myers, FL<br>
            <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent(alert.email)}" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `,
  }),
};

// POST - Create new alert
export async function POST(request: Request) {
  try {
    const body: AlertRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.rateType || !body.targetRate || !body.direction) {
      return NextResponse.json(
        { error: 'Missing required fields: email, rateType, targetRate, direction' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Check for existing alert
    const { data: existing } = await supabase
      .from('rate_alerts')
      .select('id, verified')
      .eq('email', body.email.toLowerCase())
      .eq('rate_type', body.rateType)
      .eq('target_rate', body.targetRate)
      .eq('direction', body.direction)
      .single();

    if (existing) {
      if (existing.verified) {
        return NextResponse.json(
          { error: 'This alert already exists and is active' },
          { status: 409 }
        );
      }
      
      // Update existing unverified alert with new token
      await supabase
        .from('rate_alerts')
        .update({
          verification_token: token,
          token_expiry: tokenExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new alert
      const { error: insertError } = await supabase
        .from('rate_alerts')
        .insert({
          email: body.email.toLowerCase(),
          rate_type: body.rateType,
          target_rate: body.targetRate,
          direction: body.direction,
          state: body.state || null,
          active: false,
          verified: false,
          verification_token: token,
          token_expiry: tokenExpiry.toISOString(),
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create alert' },
          { status: 500 }
        );
      }
    }

    // Send verification email
    const emailTemplate = emailTemplates.verification(token, body);
    const emailResult = await sendEmail(body.email, emailTemplate.subject, emailTemplate.html);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Still return success - alert is created, user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Alert created. Please check your email to verify.',
      emailSent: emailResult.success,
      alert: {
        email: body.email,
        rateType: body.rateType,
        targetRate: body.targetRate,
        direction: body.direction,
        verified: false,
      },
    });

  } catch (error) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// GET - List alerts for email or check status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const { data: alerts, error } = await supabase
      .from('rate_alerts')
      .select('id, rate_type, target_rate, direction, active, verified, created_at')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      count: alerts?.length || 0,
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an alert
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Both id and email parameters required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('rate_alerts')
      .delete()
      .eq('id', id)
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Database delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });

  } catch (error) {
    console.error('Delete alert error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
