// app/api/checkout/addon/route.ts — start an add-on purchase
//
// 2026-08-20: this route previously read { addon_id, discount_percent, user_id,
// user_email } straight from the REQUEST BODY with no authentication and no
// ownership check. Anyone could POST
//
//   { user_id: <somebody else>, addon_id: 'full-bundle', discount_percent: 100 }
//
// and receive a checkout URL for zero against another person's account, plus a
// pending addon_subscriptions row written on their behalf. That is the IDOR shape
// the core platform's route-auth guardrail fails builds on; it never ran here
// because this repo had type checking and linting disabled.
//
// Now: identity comes from the verified bearer token, and PRICE IS DERIVED
// SERVER-SIDE. The discount is decided here from the caller's own subscription -
// it is not something a browser can assert.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/api/require-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Cents. The only source of truth for what an add-on costs.
const ADDON_PRICES: Record<string, { monthly: number; name: string }> = {
  education: { monthly: 4900, name: "Education Center" },
  crm: { monthly: 7900, name: "Lead Scoring & CRM Pro" },
  vendors: { monthly: 2900, name: "Vendor Network" },
  marketing: { monthly: 3900, name: "Property Marketing Suite" },
  "ai-assistant": { monthly: 4900, name: "AI Assistant Pro" },
  "full-bundle": { monthly: 14900, name: "Complete Realtor Suite" },
};

/** Holders of an active realtor subscription get 20% off add-ons. */
const REALTOR_DISCOUNT_PERCENT = 20;

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) },
  });
}

function siteOrigin(req: NextRequest): string {
  // The old code hardcoded realtor.craudiovizai.com, which is not a live domain -
  // production is javarikeys.com - so the post-payment return went nowhere.
  return process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.res;

  let body: { addon_id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const addonId = body.addon_id;
  const addon = addonId ? ADDON_PRICES[addonId] : undefined;
  if (!addonId || !addon) {
    return NextResponse.json({ error: "Unknown add-on" }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    // Fail closed AND say so: a misconfigured deployment must not look like a
    // declined payment, or nobody finds out it is misconfigured.
    return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
  }

  try {
    const supabase = db();

    // Already owned? Charging twice for the same entitlement is the worst
    // outcome here, so this is checked before a session is created.
    const { data: existing } = await supabase
      .from("addon_subscriptions")
      .select("id")
      .eq("user_id", auth.userId)
      .eq("addon_id", addonId)
      .eq("status", "active")
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "You already have this add-on", code: "ALREADY_OWNED" }, { status: 409 });
    }

    // The discount is DERIVED, never accepted from the caller.
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", auth.userId)
      .eq("status", "active")
      .maybeSingle();
    const discountPercent = sub ? REALTOR_DISCOUNT_PERCENT : 0;
    const unitAmount = Math.round(addon.monthly * (1 - discountPercent / 100));

    const origin = siteOrigin(req);
    const form = new URLSearchParams({
      mode: "subscription",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": addon.name,
      "line_items[0][price_data][recurring][interval]": "month",
      "line_items[0][price_data][unit_amount]": String(unitAmount),
      success_url: `${origin}/dashboard/addons/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/addons`,
      client_reference_id: auth.userId,
      // The webhook grants entitlement from THIS metadata on a verified session,
      // never from a query string the browser controls.
      "metadata[user_id]": auth.userId,
      "metadata[addon_id]": addonId,
    });
    if (auth.email) form.set("customer_email", auth.email);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const detail = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return NextResponse.json(
        { error: detail.error?.message ?? "Could not start checkout" },
        { status: 502 },
      );
    }

    const session = (await res.json()) as { id: string; url: string };

    // Recorded as PENDING only. Nothing here grants access - the webhook does
    // that, and only after Stripe confirms payment.
    await supabase.from("addon_subscriptions").upsert(
      {
        user_id: auth.userId,
        addon_id: addonId,
        status: "pending",
        price_cents: unitAmount,
        discount_percent: discountPercent,
        stripe_session_id: session.id,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id,addon_id" },
    );

    return NextResponse.json(
      { url: session.url, amount_cents: unitAmount, discount_percent: discountPercent },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
