// app/api/me/pm/[resource]/route.ts — tenants, leases and maintenance for the agent
//
// 2026-08-20: the three property-management sub-pages each read this themselves,
// server-side, with a COOKIE client. Sessions live in localStorage on this
// platform, so getUser() returned null on every request and each page
// "redirected" to login - which renders a blank page rather than issuing a 307.
// None of them has ever shown an agent a single row.
//
// One route serves all three because they are the same shape: one agent-scoped
// table plus a lookup to resolve names. The agent scoping lives HERE because it
// is the security boundary - every query filters on agent_id equal to the
// VERIFIED caller, never an id the browser supplied.
//
// The resource name is checked against a fixed allowlist. Interpolating a path
// segment into .from() would let a caller read any table the service role can
// see, which is all of them.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/api/require-user";
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const ALLOWED = {
  tenants: "tenants",
  leases: "leases",
  maintenance: "maintenance_requests",
} as const;

type Resource = keyof typeof ALLOWED;

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

export async function GET(
  req: NextRequest,
  { params }: { params: { resource: string } },
): Promise<NextResponse> {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.res;

  const key = params.resource as Resource;
  const table = ALLOWED[key];
  if (!table) {
    return NextResponse.json(
      { error: "Unknown resource" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const supabase = db();

    const { data: rows, error } = await supabase
      .from(table)
      .select("*")
      .eq("agent_id", auth.userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    const items = rows ?? [];

    // Resolve related names in one round trip rather than per row.
    const propertyIds = [...new Set(items.map((r) => (r as { property_id?: string }).property_id).filter(Boolean))];
    const properties: Record<string, unknown> = {};
    if (propertyIds.length) {
      const { data: props } = await supabase
        .from("properties")
        .select("id, address")
        .in("id", propertyIds as string[]);
      (props ?? []).forEach((p) => {
        properties[(p as { id: string }).id] = p;
      });
    }

    const tenants: Record<string, unknown> = {};
    if (key === "leases") {
      const tenantIds = [...new Set(items.map((r) => (r as { tenant_id?: string }).tenant_id).filter(Boolean))];
      if (tenantIds.length) {
        const { data: ts } = await supabase
          .from("tenants")
          .select("id, first_name, last_name, email")
          // Scoped to the caller here too: a lease row must never be able to
          // pull in another agent's tenant record.
          .eq("agent_id", auth.userId)
          .in("id", tenantIds as string[]);
        (ts ?? []).forEach((t) => {
          tenants[(t as { id: string }).id] = t;
        });
      }
    }

    return NextResponse.json(
      { items, properties, tenants },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load records" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
