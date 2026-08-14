// lib/property-photo.ts — a real photo of a real address, or none at all
//
// RentCast returns no media on any endpoint — 20 fields of property data and
// not one image. Listing photography is shot by the listing agent and lives in
// the MLS, which is broker-gated. Street View is the honest alternative: an
// actual photograph of the actual building, licensed for this use.
//
// The trap, found by testing before wiring it in: when Google has no imagery
// for a location it returns HTTP 200 with a grey "no imagery" placeholder, not
// an error. 11810 Timbermarsh Ct in Fort Myers — a new-build — returned exactly
// the same bytes as a request for coordinates in the middle of the Atlantic.
// Wiring this in naively would have shown a grey rectangle captioned as
// somebody's home, which is worse than showing nothing.
//
// So coverage is checked first via the metadata endpoint, which is FREE, before
// spending a billed image request. Expect misses on new construction, gated
// developments and rural addresses.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026

const META = 'https://maps.googleapis.com/maps/api/streetview/metadata'
const IMAGE = 'https://maps.googleapis.com/maps/api/streetview'

/** Coverage answers are stable; cache them so a miss is never paid for twice. */
const coverage = new Map<string, boolean>()

export interface PropertyPhoto {
  /** Signed image URL, or null when Google has no imagery for this location. */
  url: string | null
  /** Month the imagery was captured, e.g. "2024-09". Useful to caption. */
  captured?: string
  attribution: string
}

function keyFor(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`
}

/**
 * Does Street View have imagery here? Metadata requests are free and are the
 * only reliable way to tell — an image request returns 200 either way.
 */
export async function hasCoverage(
  lat: number,
  lng: number,
): Promise<{ ok: boolean; captured?: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return { ok: false }

  const k = keyFor(lat, lng)
  const cached = coverage.get(k)
  if (cached === false) return { ok: false }

  try {
    const res = await fetch(
      `${META}?location=${lat},${lng}&key=${apiKey}`,
      { signal: AbortSignal.timeout(8000), cache: 'no-store' },
    )
    if (!res.ok) return { ok: false }
    const d = (await res.json()) as { status?: string; date?: string }
    const ok = d.status === 'OK'
    coverage.set(k, ok)
    return { ok, captured: d.date }
  } catch {
    // A failed coverage check must not produce a placeholder image.
    return { ok: false }
  }
}

/**
 * A photo URL for a property, or null. Never returns a URL that would render
 * Google's grey "no imagery" placeholder.
 */
export async function propertyPhoto(
  lat: number | null | undefined,
  lng: number | null | undefined,
  opts: { width?: number; height?: number } = {},
): Promise<PropertyPhoto> {
  const attribution = 'Imagery © Google'
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey || lat == null || lng == null) {
    return { url: null, attribution }
  }

  const { ok, captured } = await hasCoverage(lat, lng)
  if (!ok) return { url: null, attribution }

  const w = Math.min(opts.width ?? 640, 640)
  const h = Math.min(opts.height ?? 400, 640)
  return {
    url: `${IMAGE}?size=${w}x${h}&location=${lat},${lng}&key=${apiKey}`,
    captured,
    attribution,
  }
}
