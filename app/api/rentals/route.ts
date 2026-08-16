// app/api/rentals/route.ts — long-term rental search
//
// An entire vertical Zoyzy did not have. Zillow, Realtor.com and Trulia all
// carry rentals; a property portal without them loses every renter, and renters
// become buyers.
//
// Same lesson as the sale route: RentCast accepts filter parameters and
// silently ignores several of them, so filtering happens here on a wide page.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { propertyPhoto } from '@/lib/property-photo'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BASE = 'https://api.rentcast.io/v1'
const CACHE_TTL_MS = 60 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

interface Rental {
  id?: string
  formattedAddress?: string
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
  yearBuilt?: number
  price?: number
  status?: string
  daysOnMarket?: number
  listedDate?: string
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const key = process.env.RENTCAST_API_KEY
  if (!key) {
    return NextResponse.json({ success: false, error: 'Rental search is not configured' }, { status: 503 })
  }

  const sp = request.nextUrl.searchParams
  const pick = (...names: string[]): string | null => {
    for (const n of names) {
      const v = sp.get(n)
      if (v) return v
    }
    return null
  }

  const params = new URLSearchParams()
  const limit = Math.min(parseInt(sp.get('limit') ?? '20', 10) || 20, 50)
  params.set('limit', String(Math.min(Math.max(limit * 5, 100), 500)))
  params.set('status', 'Active')

  const city = sp.get('city')
  const state = sp.get('state')
  const zip = pick('zip', 'zipCode')
  if (zip) params.set('zipCode', zip)
  else if (city && state) {
    params.set('city', city)
    params.set('state', state)
  } else {
    return NextResponse.json(
      { success: false, error: 'Provide city and state, or a zip code' },
      { status: 400 },
    )
  }

  const num = (v: string | null): number | null => {
    if (!v) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const minRent = num(pick('minRent', 'minPrice'))
  const maxRent = num(pick('maxRent', 'maxPrice'))
  const beds = num(pick('beds', 'bedrooms'))
  const baths = num(pick('baths', 'bathrooms'))
  const type = pick('propertyType', 'type')

  const url = `${BASE}/listings/rental/long-term?${params.toString()}`
  const hit = cache.get(url + sp.toString())
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...(hit.body as object), cached: true })
  }

  try {
    const res = await fetch(url, {
      headers: { 'X-Api-Key': key, Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Rental search unavailable', status: res.status }, { status: 502 })
    }
    const raw = (await res.json()) as Rental[]
    if (!Array.isArray(raw)) {
      return NextResponse.json({ success: false, error: 'Unexpected response' }, { status: 502 })
    }

    const all = raw.map((r) => ({
      id: r.id ?? r.formattedAddress ?? '',
      address: r.formattedAddress ?? 'Address not available',
      city: r.city ?? '',
      state: r.state ?? '',
      zip: r.zipCode ?? '',
      county: r.county ?? '',
      rent: r.price ?? 0,
      beds: r.bedrooms ?? 0,
      baths: r.bathrooms ?? 0,
      sqft: r.squareFootage ?? 0,
      yearBuilt: r.yearBuilt ?? null,
      propertyType: r.propertyType ?? 'Residential',
      daysOnMarket: r.daysOnMarket ?? 0,
      listDate: r.listedDate ?? null,
      lat: r.latitude ?? null,
      lng: r.longitude ?? null,
      rentPerSqft: r.squareFootage && r.price ? Math.round((r.price / r.squareFootage) * 100) / 100 : null,
      photos: [] as string[],
    }))

    const filtered = all.filter((l) => {
      if (minRent !== null && l.rent < minRent) return false
      if (maxRent !== null && l.rent > maxRent) return false
      if (beds !== null && l.beds < beds) return false
      if (baths !== null && l.baths < baths) return false
      if (type && !l.propertyType.toLowerCase().includes(type.toLowerCase())) return false
      return true
    })

    const sort = sp.get('sort') ?? ''
    if (sort === 'rent_asc') filtered.sort((a, b) => a.rent - b.rent)
    else if (sort === 'rent_desc') filtered.sort((a, b) => b.rent - a.rent)
    else if (sort === 'newest') filtered.sort((a, b) => (b.listDate ?? '').localeCompare(a.listDate ?? ''))

    const page = filtered.slice(0, limit)
    const withPhotos = await Promise.all(
      page.map(async (l) => {
        const photo = await propertyPhoto(l.lat, l.lng)
        return photo.url ? { ...l, photos: [photo.url] } : l
      }),
    )

    const body = {
      success: true,
      count: withPhotos.length,
      matched: filtered.length,
      fetched: all.length,
      listings: withPhotos,
      source: 'RentCast',
    }
    cache.set(url + sp.toString(), { at: Date.now(), body })
    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Rental search failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 },
    )
  }
}
