// app/api/neighborhood/route.ts — the neighbourhood layer competitors charge for
//
// Zillow shows schools and a walk score. Realtor.com shows schools and
// "neighborhood insights". Trulia built its brand on crime and local data. All
// of it is public information behind a paywall.
//
// Everything here is free and needs no key:
//   NCES EDGE public school directory — real enrolment, level, address
//   EPA National Walkability Index — the federal walkability measure
//   FEMA National Flood Hazard Layer — the zone a lender actually uses
//
// One thing learned the hard way while wiring this: NCES answers a where-clause
// query and returns zero for an envelope query on the same layer, so schools are
// looked up by ZIP rather than by radius. The layer id is 1, not 0.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const NCES =
  'https://nces.ed.gov/opengis/rest/services/K12_School_Locations/EDGE_ADMINDATA_PUBLICSCH_2223/MapServer/1/query'
const EPA =
  'https://geodata.epa.gov/arcgis/rest/services/OA/WalkabilityIndex/MapServer/0/query'
const FEMA =
  'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query'

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

const LEVELS: Record<string, string> = {
  '1': 'Elementary',
  '2': 'Middle',
  '3': 'High',
  '4': 'Other',
}

/** The EPA index runs 1–20. Translate it, because a bare number means nothing. */
function walkLabel(i: number): string {
  if (i >= 15.26) return "Walker's paradise — most errands on foot"
  if (i >= 10.51) return 'Very walkable — many errands on foot'
  if (i >= 5.76) return 'Somewhat walkable — some errands on foot'
  return 'Car dependent — most errands require a car'
}

async function schools(zip: string) {
  const url =
    `${NCES}?where=LZIP%3D%27${encodeURIComponent(zip)}%27` +
    `&outFields=SCH_NAME,LEA_NAME,LCITY,LZIP,LEVEL,ENROLLMENT,PHONE` +
    `&returnGeometry=false&resultRecordCount=25&f=json`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: 'no-store' })
  if (!res.ok) return []
  const d = (await res.json()) as {
    features?: { attributes?: Record<string, string | number | null> }[]
  }
  return (d.features ?? []).map((f) => {
    const a = f.attributes ?? {}
    return {
      name: String(a.SCH_NAME ?? '').trim(),
      district: String(a.LEA_NAME ?? '').trim(),
      level: LEVELS[String(a.LEVEL ?? '')] ?? 'Unknown',
      enrollment: typeof a.ENROLLMENT === 'number' ? a.ENROLLMENT : null,
      city: String(a.LCITY ?? '').trim(),
      zip: String(a.LZIP ?? '').trim(),
      phone: String(a.PHONE ?? '').trim() || null,
    }
  })
}

async function walkability(lat: number, lng: number) {
  const url =
    `${EPA}?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326` +
    `&spatialRel=esriSpatialRelIntersects&outFields=NatWalkInd&returnGeometry=false&f=json`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: 'no-store' })
  if (!res.ok) return null
  const d = (await res.json()) as { features?: { attributes?: { NatWalkInd?: number } }[] }
  const v = d.features?.[0]?.attributes?.NatWalkInd
  if (typeof v !== 'number') return null
  return {
    index: Math.round(v * 10) / 10,
    outOf: 20,
    label: walkLabel(v),
    source: 'EPA National Walkability Index',
  }
}

async function flood(lat: number, lng: number) {
  const url =
    `${FEMA}?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326` +
    `&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,ZONE_SUBTY&returnGeometry=false&f=json`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: 'no-store' })
  if (!res.ok) return null
  const d = (await res.json()) as { features?: { attributes?: Record<string, string> }[] }
  const a = d.features?.[0]?.attributes
  if (!a?.FLD_ZONE) return null
  const z = a.FLD_ZONE.toUpperCase()
  const high = /^(A|AE|AO|AH|AR|A99|V|VE)$/.test(z)
  const shaded = (a.ZONE_SUBTY ?? '').includes('0.2 PCT')
  return {
    zone: z,
    risk: high ? 'high' : shaded ? 'moderate' : 'minimal',
    insuranceRequired: high,
    plain: high
      ? 'In a Special Flood Hazard Area — flood insurance is required with a federally backed mortgage.'
      : shaded
        ? 'Outside the mandatory-insurance area but inside the 500-year floodplain — insurance is optional and usually inexpensive.'
        : 'Outside the mapped floodplain; flood insurance is not required.',
    source: 'FEMA National Flood Hazard Layer',
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sp = request.nextUrl.searchParams
  const lat = Number(sp.get('lat'))
  const lng = Number(sp.get('lng'))
  const zip = sp.get('zip') ?? sp.get('zipCode') ?? ''
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ success: false, error: 'lat and lng are required' }, { status: 400 })
  }

  const key = `${lat.toFixed(4)},${lng.toFixed(4)},${zip}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...(hit.body as object), cached: true })
  }

  // Each source is independent — one failing must not lose the others.
  const [sch, walk, fld] = await Promise.all([
    zip ? schools(zip).catch(() => []) : Promise.resolve([]),
    walkability(lat, lng).catch(() => null),
    flood(lat, lng).catch(() => null),
  ])

  const byLevel = {
    elementary: sch.filter((s) => s.level === 'Elementary').length,
    middle: sch.filter((s) => s.level === 'Middle').length,
    high: sch.filter((s) => s.level === 'High').length,
  }

  const body = {
    success: true,
    schools: { count: sch.length, byLevel, list: sch.slice(0, 12) },
    walkability: walk,
    flood: fld,
    sources: {
      schools: 'US Dept of Education, NCES EDGE',
      walkability: 'US EPA',
      flood: 'FEMA',
    },
  }
  cache.set(key, { at: Date.now(), body })
  return NextResponse.json(body)
}
