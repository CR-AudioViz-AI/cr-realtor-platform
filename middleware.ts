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
