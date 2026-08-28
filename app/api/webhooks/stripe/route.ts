// app/api/webhooks/stripe/route.ts — grant entitlement from a VERIFIED payment
//
// 2026-08-20: THIS ROUTE DID NOT EXIST. app/dashboard/addons/success/page.tsx
// carried a comment saying "webhook will also do this, but belt & suspenders" -
// that was false. The success page was the ONLY path that ever set an add-on
// active, and it could never run: it gated on a cookie-based getUser() and
// sessions live in localStorage here. So every customer who paid for an add-on
// received nothing.
//
// A webhook is the only trustworthy place to grant access, because it is the only
// point where Stripe - not the browser - tells us money moved. The success page
// now confirms; this grants.
//
// SIGNATURE VERIFICATION IS THE WHOLE POINT. Without it this endpoint is a public
// URL that hands out paid features to anyone who can POST JSON. Verified with a
// constant-time comparison against STRIPE_WEBHOOK_SECRET, using Stripe's own
// scheme, before the body is parsed as anything meaningful.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function db() {
  const url = supabaseUrl();
  const key = secretKey();
  if (!url || !key) throw new Error("Supabase service role is not configured");
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) },
  });
}

/**
 * Stripe signs `${timestamp}.${rawBody}` with HMAC-SHA256. The header carries
 * t= and one or more v1= signatures.
 */
function verify(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...v] = p.split("=");
      return [k.trim(), v.join("=")];
    }),
  ) as Record<string, string>;

  const ts = parts.t;
  if (!ts) return false;

  // Reject anything older than five minutes: a captured webhook must not be
  // replayable to re-grant an entitlement after a refund.
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = createHmac("sha256", secret).update(`${ts}.${raw}`).digest("hex");
  const given = parts.v1;
  if (!given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // 503, and loudly: a webhook that silently accepts everything because it is
    // unconfigured is worse than one that is down.
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const raw = await req.text();
  if (!verify(raw, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  try {
    const supabase = db();

    // Idempotency: Stripe retries, and a retry must not double-grant or
    // double-count. The event id is the natural key.
    const { data: seen } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("event_id", event.id)
      .maybeSingle();
    if (seen) return NextResponse.json({ received: true, duplicate: true });

    await supabase.from("webhook_events").insert({
      provider: "stripe",
      event_type: event.type,
      event_id: event.id,
      processed: false,
      created_at: new Date().toISOString(),
    });

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as {
        id?: string;
        payment_status?: string;
        client_reference_id?: string;
        metadata?: { user_id?: string; addon_id?: string };
        subscription?: string;
        customer?: string;
      };

      // Identity comes from metadata WE set at checkout on a session Stripe just
      // signed for - never from a query string, which is how the old success page
      // would have granted whatever add-on the URL named.
      const userId = s.metadata?.user_id ?? s.client_reference_id;
      const addonId = s.metadata?.addon_id;

      if (userId && addonId && s.payment_status === "paid") {
        await supabase.from("addon_subscriptions").upsert(
          {
            user_id: userId,
            addon_id: addonId,
            status: "active",
            stripe_session_id: s.id ?? null,
            stripe_subscription_id: s.subscription ?? null,
            stripe_customer_id: s.customer ?? null,
            activated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,addon_id" },
        );
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const s = event.data.object as { id?: string };
      if (s.id) {
        // Access ends when the subscription does. Leaving it active would give
        // away paid features indefinitely after cancellation.
        await supabase
          .from("addon_subscriptions")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
          .eq("stripe_subscription_id", s.id);
      }
    }

    await supabase
      .from("webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook processing failed";
    try {
      await db()
        .from("webhook_events")
        .update({ error: message })
        .eq("event_id", event.id);
    } catch {
      /* the error record is best-effort; the 500 below is what Stripe retries on */
    }
    // 500 so Stripe retries. Returning 200 on failure would silently drop a
    // payment that the customer has already made.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
