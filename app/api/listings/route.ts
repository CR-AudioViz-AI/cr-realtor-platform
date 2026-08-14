// app/api/listings/route.ts — property search
//
// 2026-08-14: this route authenticated to SimplyRETS with the PUBLIC DEMO
// credentials (simplyrets:simplyrets) and served fictional Houston properties —
// a "$20,714,261" townhouse on East Sweet Bottom Br. Zoyzy was showing fake
// listings at fake prices to every visitor.
//
// Now backed by RentCast, which returns real nationwide sale listings without a
// per-market MLS agreement. Verified before this change: Fort Myers returned
// 5529/5531 10th Ave at $325,000 and 11810 Timbermarsh Ct at $499,900.
//
// The response shape is unchanged so every existing consumer keeps working.
//
// COST: the Developer plan allows 50 requests a month. Results are cached for
// an hour and quota exhaustion serves stale rather than nothing — a search page
// that burns the monthly quota in an afternoon is worse than slightly old data.
//
// CR AudioViz AI, LLC · EIN 39-3646201
import { NextRequest, NextResponse } from 'next/server'
import { propertyPhoto } from '@/lib/property-photo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const RENTCAST_BASE = 'https://api.rentcast.io/v1'
const CACHE_TTL_MS = 60 * 60 * 1000

interface CacheEntry { at: number; body: unknown }
const cache = new Map<string, CacheEntry>()

interface RentCastListing {
  id?: string
  formattedAddress?: string
  addressLine1?: string
  city?: string
  state?: string
  zipCode?: string
  county?: string
  latitude?: number
  longitude?: number
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  lotSize?: number
  yearBuilt?: number
  status?: string
  price?: number
  listedDate?: string
  daysOnMarket?: number
  listingAgent?: { name?: string }
  listingOffice?: { name?: string }
}

/** Map RentCast's shape onto the one this app already consumes. */
function normalise(l: RentCastListing) {
  const sqft = l.squareFootage ?? 0
  const price = l.price ?? 0
  return {
    id: l.id ?? l.formattedAddress ?? '',
    mlsId: l.id ?? '',
    address: l.formattedAddress ?? l.addressLine1 ?? 'Address not available',
    city: l.city ?? '',
    state: l.state ?? '',
    zip: l.zipCode ?? '',
    county: l.county ?? '',
    price,
    beds: l.bedrooms ?? 0,
    baths: l.bathrooms ?? 0,
    sqft,
    lotSize: l.lotSize ?? null,
    yearBuilt: l.yearBuilt ?? null,
    propertyType: l.propertyType ?? 'Residential',
    status: (l.status ?? 'active').toLowerCase(),
    daysOnMarket: l.daysOnMarket ?? 0,
    // RentCast does not return photos here. An empty array is honest; a
    // placeholder pretending to be the property is not.
    photos: [] as string[],
    description: '',
    features: [] as string[],
    lat: l.latitude ?? null,
    lng: l.longitude ?? null,
    agent: l.listingAgent?.name ? { name: l.listingAgent.name, id: null } : null,
    office: l.listingOffice?.name ?? null,
    listDate: l.listedDate ?? null,
    pricePerSqft: sqft > 0 ? Math.round(price / sqft) : null,
    source: 'RentCast',
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.RENTCAST_API_KEY
  if (!apiKey) {
    // Loud, not a silent fallback to fake data. That is how demo listings
    // survived in production for months.
    return NextResponse.json(
      { success: false, error: 'Property search is not configured', message: 'RENTCAST_API_KEY is not set' },
      { status: 503 },
    )
  }

  const sp = request.nextUrl.searchParams
  const params = new URLSearchParams()

  const limit = Math.min(parseInt(sp.get('limit') ?? '20', 10) || 20, 50)
  params.set('limit', String(limit))
  params.set('offset', String(parseInt(sp.get('offset') ?? '0', 10) || 0))
  params.set('status', 'Active')

  const city = sp.get('city')
  const state = sp.get('state')
  const zip = sp.get('zip') ?? sp.get('postalCode')
  const lat = sp.get('lat')
  const lng = sp.get('lng')

  if (zip) {
    params.set('zipCode', zip)
  } else if (city && state) {
    params.set('city', city)
    params.set('state', state)
  } else if (lat && lng) {
    params.set('latitude', lat)
    params.set('longitude', lng)
    params.set('radius', sp.get('radius') ?? '5')
  } else {
    return NextResponse.json(
      { success: false, error: 'Location required', message: 'Provide city and state, a zip code, or lat and lng.' },
      { status: 400 },
    )
  }

  if (sp.get('minprice')) params.set('minPrice', sp.get('minprice')!)
  if (sp.get('maxprice')) params.set('maxPrice', sp.get('maxprice')!)
  if (sp.get('minbeds')) params.set('bedrooms', sp.get('minbeds')!)
  if (sp.get('type')) params.set('propertyType', sp.get('type')!)

  const url = `${RENTCAST_BASE}/listings/sale?${params.toString()}`

  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...(hit.body as object), cached: true })
  }

  try {
    const res = await fetch(url, {
      headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    })

    if (res.status === 429 || res.status === 403) {
      if (hit) {
        return NextResponse.json({ ...(hit.body as object), cached: true, stale: true })
      }
      return NextResponse.json(
        { success: false, error: 'Property search is temporarily unavailable', message: 'Data provider quota reached' },
        { status: 503 },
      )
    }

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch listings', status: res.status },
        { status: 502 },
      )
    }

    const raw = (await res.json()) as RentCastListing[] | { error?: string }
    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { success: false, error: 'Unexpected response from data provider' },
        { status: 502 },
      )
    }

    // Attach a real exterior photo where Street View has coverage. Coverage
    // checks are free; only listings with imagery cost an image request.
    const listings = await Promise.all(
      raw.map(normalise).map(async (l) => {
        const photo = await propertyPhoto(l.lat, l.lng)
        return photo.url
          ? { ...l, photos: [photo.url], photoCaptured: photo.captured ?? null,
              photoAttribution: photo.attribution }
          : l
      }),
    )

    const body = { success: true, count: listings.length, listings, source: 'RentCast' }
    cache.set(url, { at: Date.now(), body })
    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 },
    )
  }
}
