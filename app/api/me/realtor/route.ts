// app/api/me/realtor/route.ts — the agent's own listings, leads and customers
//
// 2026-08-20: app/dashboard/realtor/page.tsx read this server-side with a COOKIE
// client. Sessions live in localStorage here, so getUser() returned null on every
// request and the page "redirected" to login - which renders a blank page rather
// than a 307. An agent has never seen their own dashboard.
//
// Every query filters on agent_id equal to the VERIFIED caller.
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
    global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.res;

  try {
    const supabase = db();
    const agent = auth.userId;

    const [{ data: profile }, { data: properties }, { data: leads }, { data: customers }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", agent).maybeSingle(),
        supabase.from("properties").select("*").eq("agent_id", agent).order("created_at", { ascending: false }),
        supabase.from("realtor_leads").select("*").eq("agent_id", agent).order("created_at", { ascending: false }).limit(10),
        supabase.from("realtor_customers").select("*").eq("agent_id", agent),
      ]);

    const props = properties ?? [];
    const leadRows = leads ?? [];
    const st = (r: unknown) => (r as { status?: string }).status;

    return NextResponse.json(
      {
        // A missing profile is an account without an agent record, not an error.
        profile: profile ?? null,
        properties: props,
        leads: leadRows,
        stats: {
          totalListings: props.length,
          activeListings: props.filter((p) => st(p) === "active").length,
          pendingListings: props.filter((p) => st(p) === "pending").length,
          soldListings: props.filter((p) => st(p) === "sold").length,
          newLeads: leadRows.filter((l) => st(l) === "new").length,
          activeLeads: leadRows.filter((l) => st(l) === "new" || st(l) === "contacted").length,
          totalCustomers: (customers ?? []).length,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load dashboard" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
