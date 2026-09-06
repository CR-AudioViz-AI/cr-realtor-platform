// app/layout.tsx — javari-realty
// Universal brand shell — EIN, auth CTA, metadata
// CR AudioViz AI · EIN 39-3646201 · May 2026
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import AttributionTracker from '@/components/AttributionTracker'

export const dynamic = 'force-dynamic'

// 2026-08-14: the title was hardcoded 'Javari Realty', so zoyzy.com — the
// consumer product — served a page named after the agent product. One engine,
// two front doors: Zoyzy for buyers and sellers, Javari Keys for agents. The
// brand comes from middleware, which now forwards it on the request.
interface Brand { name: string; tagline: string; consumer: boolean }

// 2026-09-05: async for Next 16. headers() now returns a Promise, so every
// caller must await it and every function that reads it becomes async. That is
// the one genuine API change in this upgrade - the rest was a builder swap.
async function brand(): Promise<Brand> {
  try {
    const h = await headers()
    const name = h.get('x-brand-name')
    if (name) {
      return {
        name,
        tagline: h.get('x-brand-tagline') ?? '',
        consumer: h.get('x-is-consumer') === 'true',
      }
    }
  } catch {
    // headers() throws outside a request scope; fall through to the default.
  }
  return { name: 'Javari Keys', tagline: 'AI-Powered Realtor Platform', consumer: false }
}

export async function generateMetadata(): Promise<Metadata> {
  const b = await brand()
  const description = b.consumer
    ? `${b.name} — ${b.tagline}. Search homes, track value, and work with an agent who is actually yours.`
    : `${b.name} — ${b.tagline}. Listings, market reports, client follow-up and closings in one place.`
  // 2026-08-16: this app served no og:image, no icons and no canonical. The
  // assets existed in public/ and nothing pointed at them, so every share was a
  // blank grey rectangle and every tab a default globe.
  //
  // metadataBase is resolved from the request host rather than hardcoded,
  // because one engine serves zoyzy.com, javarikeys.com and javariproperty.com
  // — a fixed base would advertise the wrong domain on two of the three.
  // 2026-09-05: awaited. headers() returns a Promise in Next 16, so the
  // synchronous IIFE this replaced could not work - and it was called twice for
  // the same object, which as a Promise is two awaits for one value.
  let host = 'zoyzy.com'
  try {
    const hh = await headers()
    host = hh.get('x-forwarded-host') ?? hh.get('host') ?? 'zoyzy.com'
  } catch {
    // Outside a request scope. The default stands.
  }
  return {
    title: b.name,
    description,
    metadataBase: new URL(`https://${host}`),
    alternates: { canonical: '/' },
    icons: {
      icon: [{ url: '/favicon.png', sizes: '32x32' }, { url: '/icon-512.png', sizes: '512x512' }],
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: `${b.name} — CR AudioViz AI`,
      description,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${b.name} — CR AudioViz AI`,
      description,
      images: ['/og-image.png'],
    },
  }
}
// 2026-09-05: async because brand() now awaits headers(), which returns a Promise
// in Next 16. A server component may be async; this one had no reason to be until
// the framework made reading the request asynchronous.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const b = await brand()
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui,sans-serif' }}>
        {/* 2026-09-10: WCAG 2.4.1. Without this a keyboard user traverses the
            entire navigation on every page before reaching anything. Visually
            hidden until focused, which is the point - it is for people who are
            not using a mouse, and it appears the moment they tab. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline focus:outline-2"
        >
          Skip to main content
        </a>

        <AttributionTracker />
        <div style={{ background: 'rgba(7,8,15,0.95)', backdropFilter: 'blur(8px)', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
          <a href="https://craudiovizai.com" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏠</span>
            <span style={{ color: '#10b981' }}>{b.name}</span>
            <span style={{ color: '#374151', fontSize: 10 }}>· CR AudioViz AI · EIN 39-3646201</span>
          </a>
          <a href="https://craudiovizai.com/auth/signup" style={{ background: '#10b981', color: '#000', borderRadius: 6, padding: '5px 14px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>Sign Up Free →</a>
        </div>
        <div style={{ paddingTop: 48 }}>{children}</div>
        <footer style={{ background: '#050609', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '16px 20px', textAlign: 'center' }}>
          <p style={{ color: '#1f2937', fontSize: 11, margin: 0 }}>
            © 2026 CR AudioViz AI, LLC — EIN: 39-3646201 · Fort Myers, Florida ·{' '}
            <a href="https://craudiovizai.com" style={{ color: '#10b981', textDecoration: 'none' }}>craudiovizai.com</a>
          </p>
        </footer>
      </body>
    </html>
  )
}
