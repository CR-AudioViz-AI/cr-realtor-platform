// app/api/crm/contacts/route.ts — the agent's contacts, scoped correctly
//
// 2026-08-20: app/dashboard/crm/contacts/page.tsx read this itself, server-side,
// with a COOKIE client. Sessions live in localStorage on this platform, so
// getUser() returned null on every request and the page "redirected" to login -
// which renders a blank page rather than issuing a 307. The CRM contacts page
// has never displayed a single contact to anyone.
//
// The scoping rules move here rather than into the browser, because they are the
// SECURITY boundary: a non-admin sees only their own organisation's contacts, and
// that must be enforced where the caller cannot change it. The page will filter
// and count; it will not decide who it is allowed to see.
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

interface Profile {
  id: string;
  role?: string;
  is_admin?: boolean;
  organization_id?: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.res;

  try {
    const supabase = db();

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, role, is_admin, organization_id")
      .eq("id", auth.userId)
      .maybeSingle();

    const profile = profileRow as Profile | null;
    if (!profile) {
      // No profile is a denial, not a server error: the account exists in auth
      // but has no agent record, so it owns no contacts.
      return NextResponse.json(
        { contacts: [], isAdmin: false, reason: "no-profile" },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const isAdmin = profile.role === "admin" || profile.is_admin === true;

    // Non-admins see their own contacts plus their organisation's. Default to
    // JUST themselves when there is no organisation - the narrow answer is the
    // safe one.
    let teamMemberIds: string[] = [auth.userId];
    if (!isAdmin && profile.organization_id) {
      const { data: team } = await supabase
        .from("profiles")
        .select("id")
        .eq("organization_id", profile.organization_id);
      if (team?.length) teamMemberIds = (team as { id: string }[]).map((m) => m.id);
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");

    let q = supabase.from("contacts").select("*").order("updated_at", { ascending: false });
    // The scope is applied BEFORE the caller's filters, so no query parameter can
    // widen it.
    if (!isAdmin) q = q.in("agent_id", teamMemberIds);
    if (status && status !== "all") q = q.eq("status", status);
    if (type && type !== "all") q = q.eq("contact_type", type);

    const { data: contacts, error } = await q;
    if (error) {
      return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json(
      { contacts: contacts ?? [], isAdmin },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load contacts" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
