"use client";
// app/page.tsx — one engine, five branded front doors
//
// This page shipped eight agent tools to every domain including zoyzy.com, the
// CONSUMER product. Six of the eight returned 404: /client-emails,
// /mortgage-calc, /neighborhood, /offer-analyzer, /open-house, /social-posts.
// A buyer landing on the Zillow alternative was shown a realtor CRM whose
// buttons mostly did not work.
//
// Now the surface follows the domain, and every link is verified to exist:
//
//   zoyzy.com / javariproperty.com   consumers — search, valuation, rentals
//   javarikeys.com / realtor.*       agents — the two tools that actually work
//   javarimanage.com                 landlords
//   javarimortgage.com               rates and affordability
//
// The cross-links to the sibling apps were a roadmap item: a consumer on Zoyzy
// should be able to reach the mortgage tool, the landlord tool and the lender
// comparison without hunting for them.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { useEffect, useState } from "react";

interface Tile {
  href: string;
  icon: string;
  label: string;
  desc: string;
  external?: boolean;
}

// Consumer surface. Every route verified live before being listed here.
const CONSUMER: Tile[] = [
  { href: "/search", icon: "🔎", label: "Search Homes", desc: "Nationwide listings with photos, flood risk and schools" },
  { href: "/homefinder", icon: "🏡", label: "Home Finder", desc: "Tell us what matters and we narrow it down" },
  { href: "/market-report", icon: "📊", label: "Market Report", desc: "What homes are really selling for near you" },
  { href: "https://javarimortgage.com", icon: "💰", label: "Mortgage & Payments", desc: "Live rates and what you can afford", external: true },
  { href: "https://rateunlock.com", icon: "🔓", label: "Compare Lenders", desc: "Side-by-side lender comparison", external: true },
  { href: "https://javarimanage.com", icon: "🔑", label: "Renting or Landlord", desc: "Tenant and property management tools", external: true },
];

// Agent surface. Only the two tools that exist — the other six were 404s.
const AGENT: Tile[] = [
  { href: "/listing-writer", icon: "✍️", label: "Listing Writer", desc: "MLS-ready listing copy in seconds" },
  { href: "/market-report", icon: "📊", label: "Market Report", desc: "Instant CMA and neighbourhood analysis" },
  { href: "/agent/dashboard", icon: "👤", label: "Agent Dashboard", desc: "Your listings, leads and clients" },
  { href: "https://javarimortgage.com", icon: "💰", label: "Mortgage Tools", desc: "Rates and affordability for your buyers", external: true },
  { href: "https://javarimanage.com", icon: "🏘️", label: "Property Management", desc: "For your landlord clients", external: true },
];

const C = {
  bg: "#040912",
  navy: "#1E3A5F",
  red: "#FF0800",
  teal: "#00B4D8",
  text: "#F9FAFB",
  muted: "rgba(255,255,255,0.68)",
};

function cookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

export default function Home() {
  // Brand comes from middleware via cookie, with a hostname fallback so the
  // page is never wrong on first paint.
  const [consumer, setConsumer] = useState(true);
  const [brandName, setBrandName] = useState("Zoyzy");

  useEffect(() => {
    const host = window.location.hostname;
    if (host.includes("javarikeys") || host.startsWith("realtor.")) {
      setConsumer(false);
      setBrandName("Javari Keys");
    } else if (host.includes("javarimanage")) {
      setConsumer(false);
      setBrandName("Javari Manage");
    } else if (host.includes("javarimortgage")) {
      setBrandName("Javari Mortgage");
    } else if (host.includes("javariproperty")) {
      setBrandName("Javari Property");
    } else {
      setBrandName(cookie("brandName") ?? "Zoyzy");
      setConsumer(cookie("isConsumer") !== "false");
    }
  }, []);

  const tiles = consumer ? CONSUMER : AGENT;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ background: C.navy, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏠</span>
          <span style={{ fontWeight: 800, color: C.teal, fontSize: 16 }}>{brandName}</span>
        </div>
        <a href="https://craudiovizai.com/auth/signup" style={{ background: C.red, color: "#fff", borderRadius: 7, padding: "6px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          Sign Up Free
        </a>
      </nav>

      <section style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.bg})`, padding: "56px 24px 44px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(24px,4.5vw,44px)", fontWeight: 900, margin: "0 0 12px", lineHeight: 1.08 }}>
          {consumer ? (
            <>Find your home.<br /><span style={{ color: C.teal }}>Keep your agent&apos;s commission.</span></>
          ) : (
            <>Your listings.<br /><span style={{ color: C.teal }}>Your leads. No referral fee.</span></>
          )}
        </h1>
        <p style={{ color: C.muted, fontSize: 16, margin: "0 auto", maxWidth: 620 }}>
          {consumer
            ? "Real listings with flood risk, schools, walkability and what the home is actually worth — and we never sell your enquiry."
            : "Every lead from your listing comes straight to you. We never resell it, and we never take a percentage."}
        </p>
        <div style={{ marginTop: 26, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={consumer ? "/search" : "/listing-writer"} style={{ background: C.red, color: "#fff", borderRadius: 12, padding: "14px 28px", fontWeight: 800, textDecoration: "none" }}>
            {consumer ? "Search Homes" : "Write a Listing"}
          </a>
          <a href="/market-report" style={{ background: "rgba(0,180,216,0.15)", color: C.teal, border: `1px solid ${C.teal}`, borderRadius: 12, padding: "14px 28px", fontWeight: 700, textDecoration: "none" }}>
            Market Report
          </a>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 20px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {tiles.map((t) => (
            <a
              key={t.href}
              href={t.href}
              {...(t.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: 20, textDecoration: "none", color: C.text, display: "block" }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                {t.label}
                {t.external && <span style={{ color: C.teal, fontSize: 12, fontWeight: 600 }}> ↗</span>}
              </div>
              <div style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.45 }}>{t.desc}</div>
            </a>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 20px", textAlign: "center", color: C.muted, fontSize: 12.5 }}>
        <div style={{ marginBottom: 6 }}>
          <a href="https://craudiovizai.com" style={{ color: C.teal, textDecoration: "none" }}>CR AudioViz AI</a>
          {" · EIN 39-3646201"}
        </div>
        <div>Listing data from RentCast · Flood data from FEMA · Schools from the US Dept of Education</div>
      </footer>
    </div>
  );
}
