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
    showJavari KeysBranding: false,
    isConsumerFacing: true,
  },
  'www.zoyzy.com': {
    brand: 'zoyzy',
    name: 'Zoyzy',
    tagline: 'Find Your Perfect Home',
    primaryColor: '#06B6D4',
    logoText: 'Zoyzy',
    showJavari KeysBranding: false,
    isConsumerFacing: true,
  },
  'javarikeys.com': {
    brand: 'javarikeys',
    name: 'Javari Keys',
    tagline: 'AI-Powered Realtor Platform',
    primaryColor: '#10B981', // emerald
    logoText: 'Javari Keys',
    showJavari KeysBranding: true,
    isConsumerFacing: false,
  },
  'www.javarikeys.com': {
    brand: 'javarikeys',
    name: 'Javari Keys',
    tagline: 'AI-Powered Realtor Platform',
    primaryColor: '#10B981',
    logoText: 'Javari Keys',
    showJavari KeysBranding: true,
    isConsumerFacing: false,
  },
  'realtor.craudiovizai.com': {
    brand: 'javarikeys',
    name: 'Javari Keys',
    tagline: 'AI-Powered Realtor Platform',
    primaryColor: '#10B981',
    logoText: 'Javari Keys',
    showJavari KeysBranding: true,
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
  showJavari KeysBranding: true,
  isConsumerFacing: false,
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const cleanHostname = hostname.split(':')[0] // Remove port if present
  
  // Get brand config based on hostname
  const brandConfig = BRAND_CONFIG[cleanHostname as keyof typeof BRAND_CONFIG] || DEFAULT_CONFIG
  
  // Clone the response
  const response = NextResponse.next()
  
  // Set brand info in headers for use by components
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
