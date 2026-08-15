// app/api/property-insight/route.ts — the data a buyer actually asks about
//
// The Zoyzy spec listed 25 property-detail features. Four existed: gallery,
// price history, tax history, schools. Missing were the ones people actually
// decide on — flood risk above all, in Florida.
//
// RentCast returns none of this. It gives address, beds, baths, sqft, lot,
// year built, price and coordinates. Everything here comes from public sources
// that need no key and no contract:
//
//   FEMA National Flood Hazard Layer — the authoritative flood zone. This is
//   the same data a lender uses to decide whether flood insurance is mandatory,
//   and in Southwest Florida it is the single most consequential fact about a
//   house. Verified against 5529 10th Ave, Fort Myers: zone X, "0.2 PCT ANNUAL
//   CHANCE FLOOD HAZARD IN COASTAL ZONE".
//
//   US Census geocoder — county, tract and place, which key everything else.
//
// Zillow charges nothing for flood risk either, but they got it by building a
// data team. This is one endpoint against a public API.
//
// CR AudioViz AI, LLC · EIN 39-3646201
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FEMA_NFHL =
  'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query'
const CENSUS_GEO =
  'https://geocoding.geo.census.gov/geocoder/geographies/coordinates'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
interface Entry { at: number; body: unknown }
const cache = new Map<string, Entry>()

/**
 * FEMA zone codes, in the words a buyer needs rather than the agency's.
 * A, AE, AO, AH, V, VE are Special Flood Hazard Areas: federally backed
 * mortgages REQUIRE flood insurance there. X is not, though "0.2 PCT" still
 * means a 500-year floodplain — worth saying plainly, because agents routinely
 * describe zone X as "not in a flood zone".
 */
function explainFloodZone(zone: string, subtype: string | null): {
  zone: string
  risk: 'high' | 'moderate' | 'minimal' | 'unknown'
  insuranceRequired: boolean
  plain: string
} {
  const z = (zone || '').toUpperCase()
  if (/^(A|AE|AO|AH|AR|A99)$/.test(z)) {
    return {
      zone: z, risk: 'high', insuranceRequired: true,
      plain: 'High risk. In a Special Flood Hazard Area — flood insurance is required with a federally backed mortgage.',
    }
  }
  if (/^(V|VE)$/.test(z)) {
    return {
      zone: z, risk: 'high', insuranceRequired: true,
      plain: 'High risk, coastal. Subject to storm surge and wave action; flood insurance is required with a federally backed mortgage.',
    }
  }
  if (z === 'X' || z === 'B' || z === 'C') {
    const shaded = (subtype || '').includes('0.2 PCT')
    return {
      zone: z, risk: shaded ? 'moderate' : 'minimal', insuranceRequired: false,
      plain: shaded
        ? 'Moderate risk. Outside the mandatory-insurance area, but inside the 500-year floodplain — insurance is optional and usually inexpensive.'
        : 'Minimal risk. Outside the mapped floodplain; flood insurance is not required.',
    }
  }
  return { zone: z || 'unknown', risk: 'unknown', insuranceRequired: false, plain: 'Flood zone could not be determined for this location.' }
}

async function floodZone(lat: number, lng: number) {
  const url = `${FEMA_NFHL}?geometry=${lng},${lat}&geometryType=esriGeometryPoint`
    + `&inSR=4326&spatialRel=esriSpatialRelIntersects`
    + `&outFields=FLD_ZONE,ZONE_SUBTY&returnGeometry=false&f=json`
  const res = await fetch(url, { signal: AbortSignal.timeout(12000), cache: 'no-store' })
  if (!res.ok) return null
  const d = (await res.json()) as { features?: { attributes?: Record<string, string> }[] }
  const a = d.features?.[0]?.attributes
  if (!a?.FLD_ZONE) return null
  return { ...explainFloodZone(a.FLD_ZONE, a.ZONE_SUBTY ?? null), subtype: a.ZONE_SUBTY ?? null }
}

async function geography(lat: number, lng: number) {
  const url = `${CENSUS_GEO}?x=${lng}&y=${lat}&benchmark=Public_AR_Current`
    + `&vintage=Current_Current&format=json`
  const res = await fetch(url, { signal: AbortSignal.timeout(12000), cache: 'no-store' })
  if (!res.ok) return null
  const d = (await res.json()) as {
    result?: { geographies?: Record<string, { NAME?: string; BASENAME?: string }[]> }
  }
  const g = d.result?.geographies ?? {}
  return {
    county: g['Counties']?.[0]?.NAME ?? null,
    state: g['States']?.[0]?.NAME ?? null,
    place: g['Census Designated Places']?.[0]?.NAME
      ?? g['County Subdivisions']?.[0]?.NAME ?? null,
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sp = request.nextUrl.searchParams
  const lat = Number(sp.get('lat'))
  const lng = Number(sp.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ success: false, message: 'lat and lng are required' }, { status: 400 })
  }

  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...(hit.body as object), cached: true })
  }

  // Both sources are independent: one failing must not lose the other.
  const [flood, geo] = await Promise.all([
    floodZone(lat, lng).catch(() => null),
    geography(lat, lng).catch(() => null),
  ])

  const body = {
    success: true,
    flood,
    geography: geo,
    sources: {
      flood: 'FEMA National Flood Hazard Layer',
      geography: 'US Census Bureau',
    },
  }
  cache.set(key, { at: Date.now(), body })
  return NextResponse.json(body)
}
