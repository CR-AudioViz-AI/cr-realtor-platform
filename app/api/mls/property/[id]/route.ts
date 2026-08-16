// app/api/mls/property/[id]/route.ts — everything known about one property
//
// This route was built on RAPIDAPI_KEY, which this platform does not hold, so
// every property detail page returned 500. Rewritten on RentCast, the feed the
// rest of Zoyzy already uses.
//
// It returns the listing AND everything Zoyzy can learn about the address in a
// single call, because a detail page that fires six requests renders in pieces:
//
//   valuation with comparables   the Zestimate equivalent, plus the sales it
//                                came from so a buyer can check the number
//   rent estimate and yield      what a landlord would earn, and the gross yield
//   flood zone                   FEMA, in the words a lender uses
//   schools                      NCES public school directory
//   walkability                  EPA National Walkability Index
//   price history                from the feed's own history object
//
// RentCast ids are address slugs — "5529-5531-10th-Ave,-Fort-Myers,-FL-33907" —
// so the address is recoverable from the id without a second lookup.
//
// Every enrichment is optional and independent. A property page must render
// with whatever is available rather than failing because one source is down.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { propertyPhoto } from '@/lib/property-photo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const BASE = 'https://api.rentcast.io/v1'
const NCES =
  'https://nces.ed.gov/opengis/rest/services/K12_School_Locations/EDGE_ADMINDATA_PUBLICSCH_2223/MapServer/1/query'
const EPA = 'https://geodata.epa.gov/arcgis/rest/services/OA/WalkabilityIndex/MapServer/0/query'
const FEMA = 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

interface Listing {
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
  daysOnMarket?: number
  listedDate?: string
  mlsName?: string
  mlsNumber?: string
  hoa?: { fee?: number }
  listingAgent?: { name?: string; phone?: string; email?: string }
  listingOffice?: { name?: string; phone?: string }
  history?: Record<string, { event?: string; price?: number; listedDate?: string }>
}

/** "5529-5531-10th-Ave,-Fort-Myers,-FL-33907" -> a street address. */
function idToAddress(id: string): string {
  return decodeURIComponent(id).replace(/-/g, ' ').replace(/\s+,/g, ',').trim()
}

async function get<T>(url: string, headers: Record<string, string>, ms = 15_000): Promise<T | null> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(ms), cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function inferLevel(name: string): string {
  const n = name.toUpperCase()
  if (/\bELEMENTARY\b|\bPRIMARY\b/.test(n)) return 'Elementary'
  if (/\bMIDDLE\b|\bJUNIOR\b/.test(n)) return 'Middle'
  if (/\bHIGH\b|\bSENIOR\b/.test(n)) return 'High'
  return 'Other'
}

function walkLabel(i: number): string {
  if (i >= 15.26) return "Walker's paradise"
  if (i >= 10.51) return 'Very walkable'
  if (i >= 5.76) return 'Somewhat walkable'
  return 'Car dependent'
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
): Promise<NextResponse> {
  const key = process.env.RENTCAST_API_KEY
  if (!key) {
    return NextResponse.json(
      { success: false, error: 'Property data is not configured' },
      { status: 503 },
    )
  }

  const id = context.params.id
  if (!id) {
    return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
  }

  const hit = cache.get(id)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...(hit.body as object), cached: true })
  }

  const H = { 'X-Api-Key': key, Accept: 'application/json' }
  const address = idToAddress(id)

  // The property record. RentCast keys on address, so ask for it directly.
  const props = await get<Listing[]>(
    `${BASE}/properties?address=${encodeURIComponent(address)}`, H, 20_000)
  const record = Array.isArray(props) && props.length ? props[0] : null

  // The active listing, if there is one. A property can exist without being for
  // sale, and the page should still render.
  const sale = await get<Listing[]>(
    `${BASE}/listings/sale?address=${encodeURIComponent(address)}&limit=1`, H, 20_000)
  const listing = Array.isArray(sale) && sale.length ? sale[0] : null

  const p = listing ?? record
  if (!p) {
    return NextResponse.json(
      { success: false, error: 'Property not found', address },
      { status: 404 },
    )
  }

  const lat = p.latitude ?? null
  const lng = p.longitude ?? null
  const zip = p.zipCode ?? ''
  const city = p.city ?? ''
  const state = p.state ?? ''

  // Everything below is enrichment. Each is independent and each may be null.
  const [avm, rentAvm, femaRes, epaRes, schoolRes, photo] = await Promise.all([
    get<{ price?: number; priceRangeLow?: number; priceRangeHigh?: number;
          comparables?: { formattedAddress?: string; price?: number; bedrooms?: number;
                          bathrooms?: number; squareFootage?: number; distance?: number;
                          daysOld?: number; correlation?: number }[] }>(
      `${BASE}/avm/value?address=${encodeURIComponent(address)}`, H, 20_000),
    get<{ rent?: number; rentRangeLow?: number; rentRangeHigh?: number }>(
      `${BASE}/avm/rent/long-term?address=${encodeURIComponent(address)}`, H, 20_000),
    lat != null && lng != null
      ? get<{ features?: { attributes?: Record<string, string> }[] }>(
          `${FEMA}?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326` +
          `&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,ZONE_SUBTY&returnGeometry=false&f=json`, {})
      : Promise.resolve(null),
    lat != null && lng != null
      ? get<{ features?: { attributes?: { NatWalkInd?: number } }[] }>(
          `${EPA}?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326` +
          `&spatialRel=esriSpatialRelIntersects&outFields=NatWalkInd&returnGeometry=false&f=json`, {})
      : Promise.resolve(null),
    city && state
      ? get<{ features?: { attributes?: Record<string, string> }[] }>(
          `${NCES}?where=LCITY%3D%27${encodeURIComponent(city.toUpperCase())}%27` +
          `+AND+LSTATE%3D%27${encodeURIComponent(state.toUpperCase())}%27` +
          `&outFields=SCH_NAME,LEA_NAME,LSTREET1,LZIP&returnGeometry=false&resultRecordCount=12&f=json`, {})
      : Promise.resolve(null),
    propertyPhoto(lat, lng).catch(() => ({ url: null, attribution: '' })),
  ])

  // Price history comes from the feed's own history object, keyed by date.
  const priceHistory = Object.entries(p.history ?? {})
    .map(([date, h]) => ({
      date,
      price: h.price ?? 0,
      event: h.event ?? 'Listing',
    }))
    .filter((h) => h.price > 0)
    .sort((a, b) => b.date.localeCompare(a.date))

  const value = avm?.price ?? null
  const rangeLow = avm?.priceRangeLow ?? null
  const rangeHigh = avm?.priceRangeHigh ?? null
  const spread =
    value && rangeLow != null && rangeHigh != null
      ? Math.round(((rangeHigh - rangeLow) / value) * 100)
      : null

  const rent = rentAvm?.rent ?? null
  const askingPrice = p.price ?? value ?? 0

  const femaAttr = femaRes?.features?.[0]?.attributes
  const zone = femaAttr?.FLD_ZONE?.toUpperCase() ?? null
  const highFlood = zone ? /^(A|AE|AO|AH|AR|A99|V|VE)$/.test(zone) : false
  const shaded = (femaAttr?.ZONE_SUBTY ?? '').includes('0.2 PCT')

  const walkIdx = epaRes?.features?.[0]?.attributes?.NatWalkInd ?? null

  const schools = (schoolRes?.features ?? []).map((f) => {
    const a = f.attributes ?? {}
    return {
      name: String(a.SCH_NAME ?? '').trim(),
      type: inferLevel(String(a.SCH_NAME ?? '')),
      district: String(a.LEA_NAME ?? '').trim(),
      // No rating or distance is available from a free federal source. Say null
      // rather than inventing a number the way a rating would imply.
      rating: null,
      distance: null,
    }
  })

  const body = {
    success: true,
    property: {
      id,
      address: p.formattedAddress ?? p.addressLine1 ?? address,
      city,
      state,
      zip,
      county: p.county ?? '',
      price: askingPrice,
      beds: p.bedrooms ?? 0,
      baths: p.bathrooms ?? 0,
      sqft: p.squareFootage ?? 0,
      lotSize: p.lotSize ?? null,
      yearBuilt: p.yearBuilt ?? null,
      propertyType: p.propertyType ?? 'Residential',
      status: (p.status ?? (listing ? 'active' : 'off market')).toLowerCase(),
      daysOnMarket: p.daysOnMarket ?? null,
      listDate: p.listedDate ?? null,
      hoaFee: p.hoa?.fee ?? null,
      mlsName: p.mlsName ?? null,
      mlsNumber: p.mlsNumber ?? null,
      pricePerSqft:
        p.squareFootage && askingPrice ? Math.round(askingPrice / p.squareFootage) : null,
      coordinates: lat != null && lng != null ? { lat, lng } : null,
      // Real exterior photograph or nothing. No stock images.
      photos: photo.url ? [photo.url] : [],
      photoAttribution: photo.url ? photo.attribution : null,
      listingAgent: p.listingAgent?.name
        ? {
            name: p.listingAgent.name,
            phone: p.listingAgent.phone ?? null,
            email: p.listingAgent.email ?? null,
            brokerage: p.listingOffice?.name ?? null,
          }
        : null,
      priceHistory,
      source: 'RentCast',
    },
    valuation: value
      ? {
          value,
          rangeLow,
          rangeHigh,
          spreadPercent: spread,
          confidence: spread == null ? 'unknown' : spread <= 10 ? 'high' : spread <= 25 ? 'moderate' : 'low',
          vsAsking:
            askingPrice > 0 ? Math.round(((askingPrice - value) / value) * 1000) / 10 : null,
          comparables: (avm?.comparables ?? []).slice(0, 6).map((c) => ({
            address: c.formattedAddress ?? '',
            price: c.price ?? null,
            beds: c.bedrooms ?? null,
            baths: c.bathrooms ?? null,
            sqft: c.squareFootage ?? null,
            milesAway: c.distance != null ? Math.round(c.distance * 100) / 100 : null,
            daysAgo: c.daysOld ?? null,
            similarity: c.correlation != null ? Math.round(c.correlation * 100) : null,
          })),
        }
      : null,
    rental: rent
      ? {
          rent,
          rangeLow: rentAvm?.rentRangeLow ?? null,
          rangeHigh: rentAvm?.rentRangeHigh ?? null,
          grossYieldPercent:
            askingPrice > 0 ? Math.round(((rent * 12) / askingPrice) * 1000) / 10 : null,
        }
      : null,
    flood: zone
      ? {
          zone,
          risk: highFlood ? 'high' : shaded ? 'moderate' : 'minimal',
          insuranceRequired: highFlood,
          plain: highFlood
            ? 'In a Special Flood Hazard Area — flood insurance is required with a federally backed mortgage.'
            : shaded
              ? 'Outside the mandatory-insurance area but inside the 500-year floodplain.'
              : 'Outside the mapped floodplain; flood insurance is not required.',
        }
      : null,
    walkability:
      typeof walkIdx === 'number'
        ? { index: Math.round(walkIdx * 10) / 10, outOf: 20, label: walkLabel(walkIdx) }
        : null,
    schools,
    sources: {
      listing: 'RentCast',
      valuation: 'RentCast AVM',
      flood: 'FEMA National Flood Hazard Layer',
      walkability: 'US EPA',
      schools: 'US Dept of Education, NCES',
      photo: 'Google Street View',
    },
  }

  cache.set(id, { at: Date.now(), body })
  return NextResponse.json(body)
}
