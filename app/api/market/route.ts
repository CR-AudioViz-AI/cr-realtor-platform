// app/api/market/route.ts — ZIP-level sale and rental market data
//
// The neighbourhood intelligence layer. Zillow shows a market temperature;
// this returns the underlying numbers — median price, price per square foot,
// days on market, inventory — for both sale and rental sides of a ZIP.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BASE = 'https://api.rentcast.io/v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

interface Side {
  averagePrice?: number
  medianPrice?: number
  averagePricePerSquareFoot?: number
  averageDaysOnMarket?: number
  newListings?: number
  totalListings?: number
  averageRent?: number
  medianRent?: number
}

function shape(s: Side | undefined) {
  if (!s) return null
  return {
    median: s.medianPrice ?? s.medianRent ?? null,
    average: s.averagePrice ?? s.averageRent ?? null,
    pricePerSqft: s.averagePricePerSquareFoot ?? null,
    daysOnMarket: s.averageDaysOnMarket ?? null,
    newListings: s.newListings ?? null,
    totalListings: s.totalListings ?? null,
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const key = process.env.RENTCAST_API_KEY
  if (!key) {
    return NextResponse.json({ success: false, error: 'Market data is not configured' }, { status: 503 })
  }
  const zip = request.nextUrl.searchParams.get('zipCode') ?? request.nextUrl.searchParams.get('zip')
  if (!zip) {
    return NextResponse.json({ success: false, error: 'zipCode is required' }, { status: 400 })
  }

  const url = `${BASE}/markets?zipCode=${encodeURIComponent(zip)}`
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
      return NextResponse.json({ success: false, error: 'Market data unavailable', status: res.status }, { status: 502 })
    }
    const d = (await res.json()) as { zipCode?: string; saleData?: Side; rentalData?: Side }
    const body = {
      success: true,
      zipCode: d.zipCode ?? zip,
      sale: shape(d.saleData),
      rental: shape(d.rentalData),
      source: 'RentCast Markets',
    }
    cache.set(url, { at: Date.now(), body })
    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Market data failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 },
    )
  }
}
