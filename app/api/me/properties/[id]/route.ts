// app/api/me/properties/[id]/route.ts — one property the caller is entitled to see
//
// 2026-08-20: app/dashboard/properties/[id]/page.tsx read this server-side with a
// COOKIE client, so getUser() returned null on every request and the page
// "redirected" to login - which renders a blank page rather than a 307. No agent
// has ever opened a property detail page.
//
// AND IT HAD NO OWNERSHIP CHECK. It selected the property by id alone, so once the
// auth was repaired ANY signed-in agent could read ANY property on the platform by
// changing the id in the URL - a competitor's listings, their pricing, their
// notes. Fixing the auth without adding this check would have converted a blank
// page into a data leak, which is the third time that pattern has appeared in this
// repo alone.
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
    global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.res;

  try {
    const supabase = db();

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, role, is_admin")
      .eq("id", auth.userId)
      .maybeSingle();

    const p = profile as { role?: string; is_admin?: boolean } | null;
    const isAdmin = p?.role === "admin" || p?.is_admin === true;

    // The ownership filter is part of the QUERY, not a check afterwards. A row
    // the caller may not see is never fetched, so it cannot leak through an
    // error message or a partially-rendered response.
    let q = supabase.from("properties").select("*").eq("id", params.id);
    if (!isAdmin) q = q.eq("agent_id", auth.userId);

    const { data: property } = await q.maybeSingle();

    if (!property) {
      // 404 rather than 403: "not yours" and "does not exist" must look
      // identical, or the id becomes an oracle for which listings exist.
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { property, profile: profile ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load property" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
