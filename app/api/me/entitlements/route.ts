// app/api/me/entitlements/route.ts — what the signed-in agent has access to
//
// 2026-08-20: the dashboard pages answered this question themselves, server-side,
// with a COOKIE client:
//
//   const { data: { user } } = await createClient().auth.getUser()
//   if (!user) redirect('/auth/login')
//
// Sessions live in localStorage on this platform, so getUser() returned null on
// every request - for a signed-in agent too - and redirect() in a page component
// renders a BLANK PAGE rather than issuing a 307. The entire agent dashboard was
// blank for everyone, always.
//
// The question belongs here, where identity comes from a bearer token that
// Supabase verifies. app/dashboard/layout.tsx already gates the UI client-side;
// this supplies the entitlement facts those pages need.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/api/require-user";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  return createClient(url, key, {
    auth: { persistSession: false },
    // Next 14 caches PostgREST GETs by URL and serves stale rows invisibly.
    global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.res;

  try {
    const supabase = db();

    // maybeSingle, not single: "no active add-on" is the NORMAL case for most
    // agents, and single() treats it as an error - which is how an ordinary
    // free account starts looking like a failure.
    const [{ data: addons }, { data: sub }] = await Promise.all([
      supabase
        .from("addon_subscriptions")
        .select("addon_id")
        .eq("user_id", auth.userId)
        .eq("status", "active"),
      supabase
        .from("subscriptions")
        .select("id, plan, status")
        .eq("user_id", auth.userId)
        .eq("status", "active")
        .maybeSingle(),
    ]);

    const owned = new Set((addons ?? []).map((a) => (a as { addon_id: string }).addon_id));
    const has = (id: string) => owned.has(id) || owned.has("full-bundle");

    return NextResponse.json(
      {
        userId: auth.userId,
        email: auth.email,
        addons: [...owned],
        entitlements: {
          vendors: has("vendors"),
          crm: has("crm"),
          education: has("education"),
          propertyManagement: has("property-management"),
          specialties: has("specialties"),
        },
        // A realtor subscription earns a discount on add-ons. Absent means no
        // discount, not an error.
        hasRealtorAccount: Boolean(sub),
        discountPercent: sub ? 20 : 0,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load entitlements" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
