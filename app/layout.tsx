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

function brand(): Brand {
  try {
    const h = headers()
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
  const b = brand()
  const description = b.consumer
    ? `${b.name} — ${b.tagline}. Search homes, track value, and work with an agent who is actually yours.`
    : `${b.name} — ${b.tagline}. Listings, market reports, client follow-up and closings in one place.`
  return {
    title: b.name,
    description,
    openGraph: { title: `${b.name} — CR AudioViz AI`, description, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${b.name} — CR AudioViz AI`, description },
  }
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui,sans-serif' }}>
        <AttributionTracker />
        <div style={{ background: 'rgba(7,8,15,0.95)', backdropFilter: 'blur(8px)', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
          <a href="https://craudiovizai.com" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏠</span>
            <span style={{ color: '#10b981' }}>{brand().name}</span>
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
