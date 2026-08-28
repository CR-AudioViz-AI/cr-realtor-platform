// app/api/me/property-management/route.ts — the agent's own portfolio stats
//
// 2026-08-20: app/dashboard/property-management/page.tsx computed these itself,
// server-side, with a COOKIE client. Sessions live in localStorage on this
// platform, so getUser() returned null on every request and the page "redirected"
// to login - which renders a blank page rather than issuing a 307. The property
// management dashboard has never shown an agent a single number.
//
// The agent scoping moves here because it is the SECURITY boundary: every query
// filters on agent_id = the VERIFIED caller, never an id supplied by the browser.
// The page renders numbers; it does not decide whose numbers it may see.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/api/require-user";
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function db() {
  const url = supabaseUrl();
  const key = secretKey();
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
    const agent = auth.userId;

    const [props, tenants, leases, maint] = await Promise.all([
      supabase.from("properties").select("id, listing_type").eq("agent_id", agent),
      supabase.from("tenants").select("id, status").eq("agent_id", agent),
      supabase.from("leases").select("id, status, monthly_rent, end_date").eq("agent_id", agent),
      supabase.from("maintenance_requests").select("id, status, priority").eq("agent_id", agent),
    ]);

    const properties = props.data ?? [];
    const tenantRows = tenants.data ?? [];
    const leaseRows = leases.data ?? [];
    const maintRows = maint.data ?? [];

    const activeLeases = leaseRows.filter((l) => (l as { status?: string }).status === "active");

    // "Expiring" means within thirty days, computed server-side so every caller
    // sees the same window regardless of the browser's clock or timezone.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 30);

    return NextResponse.json(
      {
        stats: {
          totalProperties: properties.length,
          rentalProperties: properties.filter((p) =>
            ["for_rent", "for_lease"].includes((p as { listing_type?: string }).listing_type ?? ""),
          ).length,
          activeTenants: tenantRows.filter((t) => (t as { status?: string }).status === "active").length,
          activeLeases: activeLeases.length,
          monthlyIncome: activeLeases.reduce(
            (sum, l) => sum + ((l as { monthly_rent?: number }).monthly_rent ?? 0),
            0,
          ),
          expiringLeases: activeLeases.filter((l) => {
            const end = (l as { end_date?: string }).end_date;
            return Boolean(end) && new Date(end as string) <= cutoff;
          }).length,
          openMaintenance: maintRows.filter((m) =>
            ["submitted", "in_progress", "scheduled"].includes((m as { status?: string }).status ?? ""),
          ).length,
          urgentMaintenance: maintRows.filter(
            (m) =>
              (m as { priority?: string }).priority === "urgent" &&
              (m as { status?: string }).status !== "completed",
          ).length,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load portfolio" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
