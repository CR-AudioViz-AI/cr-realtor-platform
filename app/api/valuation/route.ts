// app/api/valuation/route.ts — property valuation with comparables
//
// Zillow's Zestimate is the single feature people name when they explain why
// they use Zillow. RentCast returns the same thing on the plan we already pay
// nothing for — value, a high/low confidence range, and the comparable sales
// behind it — and Zoyzy was not calling it.
//
// Comparables matter more than the number. A valuation without the homes it was
// derived from is a guess the customer has to take on trust; with them it is an
// argument they can check.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BASE = 'https://api.rentcast.io/v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

interface Comp {
  formattedAddress?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  yearBuilt?: number
  distance?: number
  daysOld?: number
  correlation?: number
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const key = process.env.RENTCAST_API_KEY
  if (!key) {
    return NextResponse.json(
      { success: false, error: 'Valuation is not configured' },
      { status: 503 },
    )
  }

  const sp = request.nextUrl.searchParams
  const address = sp.get('address')
  if (!address) {
    return NextResponse.json(
      { success: false, error: 'address is required' },
      { status: 400 },
    )
  }

  const url = `${BASE}/avm/value?address=${encodeURIComponent(address)}`
  const hit = cache.get(url)
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
      return NextResponse.json(
        { success: false, error: 'Valuation unavailable', status: res.status },
        { status: res.status === 404 ? 404 : 502 },
      )
    }
    const d = (await res.json()) as {
      price?: number
      priceRangeLow?: number
      priceRangeHigh?: number
      latitude?: number
      longitude?: number
      comparables?: Comp[]
    }

    const comps = (d.comparables ?? []).slice(0, 8).map((c) => ({
      address: c.formattedAddress ?? '',
      price: c.price ?? null,
      beds: c.bedrooms ?? null,
      baths: c.bathrooms ?? null,
      sqft: c.squareFootage ?? null,
      yearBuilt: c.yearBuilt ?? null,
      milesAway: c.distance != null ? Math.round(c.distance * 100) / 100 : null,
      daysAgo: c.daysOld ?? null,
      // How closely this comp matches the subject, as a percentage.
      similarity: c.correlation != null ? Math.round(c.correlation * 100) : null,
    }))

    const spread =
      d.priceRangeHigh != null && d.priceRangeLow != null && d.price
        ? Math.round(((d.priceRangeHigh - d.priceRangeLow) / d.price) * 100)
        : null

    const body = {
      success: true,
      value: d.price ?? null,
      rangeLow: d.priceRangeLow ?? null,
      rangeHigh: d.priceRangeHigh ?? null,
      // A wide range means low confidence. Say so rather than showing a
      // precise-looking number the data does not support.
      confidence:
        spread == null ? 'unknown' : spread <= 10 ? 'high' : spread <= 25 ? 'moderate' : 'low',
      spreadPercent: spread,
      lat: d.latitude ?? null,
      lng: d.longitude ?? null,
      comparables: comps,
      source: 'RentCast AVM',
    }
    cache.set(url, { at: Date.now(), body })
    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Valuation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    )
  }
}
