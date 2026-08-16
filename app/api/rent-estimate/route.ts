// app/api/rent-estimate/route.ts — long-term rent estimate with comparables
//
// The investor view Zillow charges for and Zoyzy did not have. Combined with
// the valuation route this gives gross yield on any address, which is the one
// number a buy-to-let purchaser actually decides on.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BASE = 'https://api.rentcast.io/v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

export async function GET(request: NextRequest): Promise<NextResponse> {
  const key = process.env.RENTCAST_API_KEY
  if (!key) {
    return NextResponse.json({ success: false, error: 'Rent estimate is not configured' }, { status: 503 })
  }
  const sp = request.nextUrl.searchParams
  const address = sp.get('address')
  if (!address) {
    return NextResponse.json({ success: false, error: 'address is required' }, { status: 400 })
  }

  const url = `${BASE}/avm/rent/long-term?address=${encodeURIComponent(address)}`
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
        { success: false, error: 'Rent estimate unavailable', status: res.status },
        { status: res.status === 404 ? 404 : 502 },
      )
    }
    const d = (await res.json()) as {
      rent?: number
      rentRangeLow?: number
      rentRangeHigh?: number
      comparables?: { formattedAddress?: string; price?: number; bedrooms?: number; squareFootage?: number }[]
    }

    // Gross yield needs the sale value, so accept it as a parameter rather than
    // making a second billed call the caller may not want.
    const priceParam = Number(sp.get('price') ?? '')
    const grossYield =
      Number.isFinite(priceParam) && priceParam > 0 && d.rent
        ? Math.round(((d.rent * 12) / priceParam) * 1000) / 10
        : null

    const body = {
      success: true,
      rent: d.rent ?? null,
      rangeLow: d.rentRangeLow ?? null,
      rangeHigh: d.rentRangeHigh ?? null,
      grossYieldPercent: grossYield,
      comparables: (d.comparables ?? []).slice(0, 8).map((c) => ({
        address: c.formattedAddress ?? '',
        rent: c.price ?? null,
        beds: c.bedrooms ?? null,
        sqft: c.squareFootage ?? null,
      })),
      source: 'RentCast AVM',
    }
    cache.set(url, { at: Date.now(), body })
    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Rent estimate failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 },
    )
  }
}
