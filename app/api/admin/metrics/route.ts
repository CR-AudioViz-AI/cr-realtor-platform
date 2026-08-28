// app/api/admin/metrics/route.ts — platform-wide metrics, admins only
//
// 2026-08-20: app/dashboard/admin/page.tsx read these server-side with a COOKIE
// client, so getUser() always returned null and the page was blank for everyone.
//
// NOTE WHAT IT READS: every profile, every property, every lead on the platform -
// no agent filter anywhere. That is correct for an admin view and catastrophic
// for anyone else, so the role check is the whole point of this route rather
// than an afterthought. It is enforced server-side, where the caller cannot
// change it.
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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.res;

  try {
    const supabase = db();

    const { data: me } = await supabase
      .from("profiles")
      .select("first_name, last_name, role, is_admin")
      .eq("id", auth.userId)
      .maybeSingle();

    const p = me as { first_name?: string; last_name?: string; role?: string; is_admin?: boolean } | null;
    const isAdmin = p?.role === "admin" || p?.is_admin === true;
    if (!isAdmin) {
      // 403, not a redirect: the caller is authenticated and simply not permitted.
      return NextResponse.json(
        { error: "Forbidden", code: "ADMIN_REQUIRED" },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    const [{ data: profiles }, { data: properties }, { data: leads }] = await Promise.all([
      supabase.from("profiles").select("id, role, active"),
      supabase.from("properties").select("id, status"),
      supabase.from("realtor_leads").select("id, status"),
    ]);

    const pr = profiles ?? [];
    const props = properties ?? [];
    const ld = leads ?? [];

    return NextResponse.json(
      {
        displayName: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Admin",
        metrics: {
          totalUsers: pr.length,
          activeAgents: pr.filter(
            (x) => (x as { role?: string }).role === "agent" && (x as { active?: boolean }).active,
          ).length,
          totalProperties: props.length,
          activeListings: props.filter((x) => (x as { status?: string }).status === "active").length,
          totalLeads: ld.length,
          newLeads: ld.filter((x) => (x as { status?: string }).status === "new").length,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load metrics" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
