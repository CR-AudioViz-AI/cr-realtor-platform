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
  hoa?: { fee?: number }
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
    hoaFee: l.hoa?.fee ?? null,
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

  // Filtering happens in this route, not upstream, so fetch a wide page and
  // narrow it here rather than returning 20 unfiltered rows.
  const limit = Math.min(parseInt(sp.get('limit') ?? '20', 10) || 20, 50)
  params.set('limit', String(Math.min(Math.max(limit * 5, 100), 500)))
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

  // 2026-08-15: the search page sends minPrice/maxPrice/beds/baths in camelCase
  // and this route only read lowercase, so every filter was silently ignored —
  // a search for homes over $9,000,000 returned $325,000 listings. Accept both
  // spellings rather than making the caller guess.
  const pick = (...names: string[]): string | null => {
    for (const n of names) {
      const v = sp.get(n)
      if (v) return v
    }
    return null
  }
  const minP = pick('minPrice', 'minprice')
  const maxP = pick('maxPrice', 'maxprice')
  const bedsQ = pick('beds', 'minbeds', 'bedrooms')
  const bathsQ = pick('baths', 'minbaths', 'bathrooms')
  const typeQ = pick('propertyType', 'type')
  const sqftMin = pick('minSqft', 'minsqft')
  const yearMin = pick('minYear', 'yearBuilt')

  if (minP) params.set('minPrice', minP)
  if (maxP) params.set('maxPrice', maxP)
  if (bedsQ) params.set('bedrooms', bedsQ)
  if (bathsQ) params.set('bathrooms', bathsQ)
  if (typeQ) params.set('propertyType', typeQ)
  if (sqftMin) params.set('minSquareFootage', sqftMin)
  if (yearMin) params.set('minYearBuilt', yearMin)

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

    // 2026-08-15: RentCast ACCEPTS minPrice and bedrooms and silently ignores
    // them. Proven by calling it directly: with minPrice=900000 and without it,
    // the identical three listings came back — 325000, 339900, 899000. Every
    // filter has to be applied here or a buyer searching for a $900k home is
    // shown a $325k one.
    const num = (v: string | null): number | null => {
      if (!v) return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    const fMinPrice = num(minP)
    const fMaxPrice = num(maxP)
    const fBeds = num(bedsQ)
    const fBaths = num(bathsQ)
    const fSqft = num(sqftMin)
    const fYear = num(yearMin)
    const fMaxDom = num(pick('maxDaysOnMarket', 'maxdom'))
    const fMinLot = num(pick('minLotSize', 'minlot'))
    const fMaxHoa = num(pick('maxHoa', 'maxhoa'))
    const fType = typeQ ? typeQ.toLowerCase() : null

    const filtered = listings.filter((l) => {
      if (fMinPrice !== null && l.price < fMinPrice) return false
      if (fMaxPrice !== null && l.price > fMaxPrice) return false
      if (fBeds !== null && l.beds < fBeds) return false
      if (fBaths !== null && l.baths < fBaths) return false
      if (fSqft !== null && l.sqft < fSqft) return false
      if (fYear !== null && (l.yearBuilt ?? 0) < fYear) return false
      if (fMaxDom !== null && l.daysOnMarket > fMaxDom) return false
      if (fMinLot !== null && (l.lotSize ?? 0) < fMinLot) return false
      if (fMaxHoa !== null && (l.hoaFee ?? 0) > fMaxHoa) return false
      if (fType && !l.propertyType.toLowerCase().includes(fType)) return false
      return true
    })

    const sort = sp.get('sort') ?? ''
    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price)
    else if (sort === 'newest') filtered.sort((a, b) => (b.listDate ?? '').localeCompare(a.listDate ?? ''))
    else if (sort === 'sqft_desc') filtered.sort((a, b) => b.sqft - a.sqft)
    else if (sort === 'ppsf_asc') filtered.sort((a, b) => (a.pricePerSqft ?? 1e9) - (b.pricePerSqft ?? 1e9))

    const body = {
      success: true,
      count: filtered.length,
      fetched: listings.length,
      listings: filtered,
      source: 'RentCast',
    }
    cache.set(url, { at: Date.now(), body })
    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 },
    )
  }
}
