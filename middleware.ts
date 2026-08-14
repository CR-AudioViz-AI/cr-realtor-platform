import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Domain-based branding configuration
const BRAND_CONFIG = {
  'zoyzy.com': {
    brand: 'zoyzy',
    name: 'Zoyzy',
    tagline: 'Find Your Perfect Home',
    primaryColor: '#06B6D4', // cyan
    logoText: 'Zoyzy',
    showJavariKeysBranding: false,
    isConsumerFacing: true,
  },
  'www.zoyzy.com': {
    brand: 'zoyzy',
    name: 'Zoyzy',
    tagline: 'Find Your Perfect Home',
    primaryColor: '#06B6D4',
    logoText: 'Zoyzy',
    showJavariKeysBranding: false,
    isConsumerFacing: true,
  },
  'javarikeys.com': {
    brand: 'javarikeys',
    name: 'Javari Keys',
    tagline: 'AI-Powered Realtor Platform',
    primaryColor: '#10B981', // emerald
    logoText: 'Javari Keys',
    showJavariKeysBranding: true,
    isConsumerFacing: false,
  },
  'www.javarikeys.com': {
    brand: 'javarikeys',
    name: 'Javari Keys',
    tagline: 'AI-Powered Realtor Platform',
    primaryColor: '#10B981',
    logoText: 'Javari Keys',
    showJavariKeysBranding: true,
    isConsumerFacing: false,
  },
  'realtor.craudiovizai.com': {
    brand: 'javarikeys',
    name: 'Javari Keys',
    tagline: 'AI-Powered Realtor Platform',
    primaryColor: '#10B981',
    logoText: 'Javari Keys',
    showJavariKeysBranding: true,
    isConsumerFacing: false,
  },

  // 2026-08-14: the rest of the property family. These four domains were
  // pointed at small tools on the core platform — javarikeys.com served the
  // PASSWORD GENERATOR, javarimanage.com a generic project manager — while this
  // 166-page app sat on another project. Javari Property is the hub; Zoyzy is
  // the consumer front door, Keys the agent CRM, Manage the landlord tools,
  // Mortgage the rates surface that feeds rateunlock.com.
  'javariproperty.com': {
    brand: 'javariproperty',
    name: 'Javari Property',
    tagline: 'Property, end to end',
    primaryColor: '#6366F1', // indigo
    logoText: 'Javari Property',
    showJavariKeysBranding: false,
    isConsumerFacing: true,
  },
  'www.javariproperty.com': {
    brand: 'javariproperty',
    name: 'Javari Property',
    tagline: 'Property, end to end',
    primaryColor: '#6366F1',
    logoText: 'Javari Property',
    showJavariKeysBranding: false,
    isConsumerFacing: true,
  },
  'javarimanage.com': {
    brand: 'javarimanage',
    name: 'Javari Manage',
    tagline: 'Landlord and property management',
    primaryColor: '#F59E0B', // amber
    logoText: 'Javari Manage',
    showJavariKeysBranding: false,
    isConsumerFacing: false,
  },
  'www.javarimanage.com': {
    brand: 'javarimanage',
    name: 'Javari Manage',
    tagline: 'Landlord and property management',
    primaryColor: '#F59E0B',
    logoText: 'Javari Manage',
    showJavariKeysBranding: false,
    isConsumerFacing: false,
  },
  'javarimortgage.com': {
    brand: 'javarimortgage',
    name: 'Javari Mortgage',
    tagline: 'Rates, affordability and lender comparison',
    primaryColor: '#0EA5E9', // sky
    logoText: 'Javari Mortgage',
    showJavariKeysBranding: false,
    isConsumerFacing: true,
  },
  'www.javarimortgage.com': {
    brand: 'javarimortgage',
    name: 'Javari Mortgage',
    tagline: 'Rates, affordability and lender comparison',
    primaryColor: '#0EA5E9',
    logoText: 'Javari Mortgage',
    showJavariKeysBranding: false,
    isConsumerFacing: true,
  },
}

// Default config for preview/dev deployments
const DEFAULT_CONFIG = {
  brand: 'javarikeys',
  name: 'Javari Keys',
  tagline: 'AI-Powered Realtor Platform',
  primaryColor: '#10B981',
  logoText: 'Javari Keys',
  showJavariKeysBranding: true,
  isConsumerFacing: false,
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const cleanHostname = hostname.split(':')[0] // Remove port if present
  
  // Get brand config based on hostname
  const brandConfig = BRAND_CONFIG[cleanHostname as keyof typeof BRAND_CONFIG] || DEFAULT_CONFIG
  
  // 2026-08-14: this used to be NextResponse.next() with the brand set on the
  // RESPONSE only. A response header reaches the browser but never reaches the
  // app, so generateMetadata and every server component were blind to it — which
  // is why zoyzy.com served a page titled "Javari Realty" with realtor tools on
  // it. Exactly the same defect as x-entry-domain on the core platform.
  //
  // Forwarding on the REQUEST is what lets one engine serve two branded front
  // doors: Zoyzy for consumers, Javari Keys for agents.
  const forwarded = new Headers(request.headers)
  forwarded.set('x-brand', brandConfig.brand)
  forwarded.set('x-brand-name', brandConfig.name)
  forwarded.set('x-brand-tagline', brandConfig.tagline)
  forwarded.set('x-brand-color', brandConfig.primaryColor)
  forwarded.set('x-brand-logo', brandConfig.logoText)
  forwarded.set('x-is-consumer', brandConfig.isConsumerFacing ? 'true' : 'false')

  const response = NextResponse.next({ request: { headers: forwarded } })

  // ── AGENT ATTRIBUTION ──────────────────────────────────────────────────────
  // 2026-08-14: the ?ref= capture did not exist. /api/attribution was written
  // in December but nothing ever called it, and nothing set a session, so not
  // one attribution event has ever been recorded. This is the piece that starts
  // the chain — an agent shares zoyzy.com/search?ref=tony-harvey and the
  // attribution survives for 30 days.
  //
  // Invisible to the consumer by design: no banner, no redirect, no parameter
  // left in the URL bar beyond the first page. They are looking at homes, not
  // at a tracking mechanism.
  const ref = request.nextUrl.searchParams.get('ref')

  let sessionId = request.cookies.get('zsid')?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    response.cookies.set('zsid', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 400,
      sameSite: 'lax',
      httpOnly: false, // the client reads it to send attribution events
      secure: true,
    })
  }

  if (ref) {
    // First touch wins. An agent whose link brought the visitor keeps the
    // credit even if a second agent's link is clicked later — overwriting here
    // would let anyone steal a lead by getting the last click.
    if (!request.cookies.get('zref')) {
      response.cookies.set('zref', ref, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // the 30-day attribution window
        sameSite: 'lax',
        httpOnly: false,
        secure: true,
      })
    }
    // Always record the touch, even when it is not the first — multi-touch
    // history is what settles a dispute between two agents.
    response.cookies.set('zref_last', ref, {
      path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', httpOnly: false, secure: true,
    })
  }

  
  // Kept on the response too: the client BrandContext reads these.
  response.headers.set('x-brand', brandConfig.brand)
  response.headers.set('x-brand-name', brandConfig.name)
  response.headers.set('x-brand-tagline', brandConfig.tagline)
  response.headers.set('x-brand-color', brandConfig.primaryColor)
  response.headers.set('x-brand-logo', brandConfig.logoText)
  response.headers.set('x-is-consumer', brandConfig.isConsumerFacing ? 'true' : 'false')
  
  // Set cookies for client-side access
  response.cookies.set('brand', brandConfig.brand, { path: '/' })
  response.cookies.set('brandName', brandConfig.name, { path: '/' })
  response.cookies.set('isConsumer', brandConfig.isConsumerFacing ? 'true' : 'false', { path: '/' })
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
