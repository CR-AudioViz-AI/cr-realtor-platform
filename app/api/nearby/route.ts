// app/api/nearby/route.ts — what is actually around a property
//
// "What's nearby" is a Redfin and Trulia feature and Zoyzy had nothing. Every
// key used here was already in the platform vault, tested live and working, and
// simply never connected to the property product:
//
//   Geoapify    groceries, schools, parks, restaurants, hospitals, gyms
//   AirNow      EPA air quality index, the same feed the government publishes
//   OpenWeather current conditions — relevant in a hurricane state
//   GraphHopper drive time to a destination the buyer names
//
// Commute time is the one competitors charge for and it is the one buyers with
// a job actually filter on.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 45

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const cache = new Map<string, { at: number; body: unknown }>()

/** Categories worth showing a buyer, in the order they ask about them. */
const CATEGORIES: { key: string; label: string; geoapify: string }[] = [
  { key: 'grocery', label: 'Groceries', geoapify: 'commercial.supermarket' },
  { key: 'school', label: 'Schools', geoapify: 'education.school' },
  { key: 'healthcare', label: 'Healthcare', geoapify: 'healthcare.hospital,healthcare.clinic_or_praxis' },
  { key: 'park', label: 'Parks', geoapify: 'leisure.park' },
  { key: 'dining', label: 'Restaurants', geoapify: 'catering.restaurant' },
  { key: 'fitness', label: 'Gyms', geoapify: 'sport.fitness' },
]

interface GeoFeature {
  properties?: {
    name?: string
    distance?: number
    address_line2?: string
    categories?: string[]
  }
}

async function json<T>(url: string, ms = 15_000): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(ms), cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** AQI bands, in the words the EPA uses publicly. */
function aqiLabel(v: number): string {
  if (v <= 50) return 'Good'
  if (v <= 100) return 'Moderate'
  if (v <= 150) return 'Unhealthy for sensitive groups'
  if (v <= 200) return 'Unhealthy'
  if (v <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sp = request.nextUrl.searchParams
  const lat = Number(sp.get('lat'))
  const lng = Number(sp.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ success: false, error: 'lat and lng are required' }, { status: 400 })
  }
  const radius = Math.min(Math.max(parseInt(sp.get('radius') ?? '3000', 10) || 3000, 500), 10_000)
  const commuteTo = sp.get('commuteTo')

  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)},${radius},${commuteTo ?? ''}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...(hit.body as object), cached: true })
  }

  const geoKey = process.env.GEOAPIFY_API_KEY ?? ''
  const airKey = process.env.AIRNOW_API_KEY ?? ''
  const owKey = process.env.OPENWEATHER_API_KEY ?? ''
  const ghKey = process.env.GRAPHHOPPER_API_KEY ?? ''

  const placeCalls = geoKey
    ? CATEGORIES.map(async (c) => {
        const d = await json<{ features?: GeoFeature[] }>(
          `https://api.geoapify.com/v2/places?categories=${c.geoapify}` +
            `&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}` +
            `&limit=5&apiKey=${geoKey}`,
        )
        return {
          key: c.key,
          label: c.label,
          places: (d?.features ?? []).map((f) => ({
            name: f.properties?.name ?? 'Unnamed',
            address: f.properties?.address_line2 ?? '',
            // Geoapify returns metres; buyers think in miles.
            milesAway:
              f.properties?.distance != null
                ? Math.round((f.properties.distance / 1609.34) * 100) / 100
                : null,
          })),
        }
      })
    : []

  const [places, air, weather, commute] = await Promise.all([
    Promise.all(placeCalls),
    airKey
      ? json<{ ParameterName?: string; AQI?: number; Category?: { Name?: string } }[]>(
          `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json` +
            `&latitude=${lat}&longitude=${lng}&distance=25&API_KEY=${airKey}`,
        )
      : Promise.resolve(null),
    owKey
      ? json<{ main?: { temp?: number; humidity?: number }; weather?: { main?: string; description?: string }[] }>(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${owKey}&units=imperial`,
        )
      : Promise.resolve(null),
    commuteTo && ghKey
      ? (async () => {
          // Geocode the destination the buyer typed, then route to it.
          const g = await json<{ features?: { geometry?: { coordinates?: number[] } }[] }>(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(commuteTo)}&limit=1&apiKey=${geoKey}`,
          )
          const c = g?.features?.[0]?.geometry?.coordinates
          if (!c || c.length < 2) return null
          const r = await json<{ paths?: { time?: number; distance?: number }[] }>(
            `https://graphhopper.com/api/1/route?point=${lat},${lng}&point=${c[1]},${c[0]}` +
              `&profile=car&key=${ghKey}`,
          )
          const path = r?.paths?.[0]
          if (!path?.time) return null
          return {
            destination: commuteTo,
            minutes: Math.round(path.time / 60000),
            miles: path.distance != null ? Math.round((path.distance / 1609.34) * 10) / 10 : null,
          }
        })()
      : Promise.resolve(null),
  ])

  const pm25 = (air ?? []).find((a) => a.ParameterName === 'PM2.5') ?? (air ?? [])[0]

  const body = {
    success: true,
    nearby: places.filter((p) => p.places.length > 0),
    airQuality:
      pm25?.AQI != null
        ? { aqi: pm25.AQI, label: pm25.Category?.Name ?? aqiLabel(pm25.AQI), parameter: pm25.ParameterName ?? null }
        : null,
    weather: weather?.main?.temp != null
      ? {
          tempF: Math.round(weather.main.temp),
          humidity: weather.main.humidity ?? null,
          conditions: weather.weather?.[0]?.description ?? weather.weather?.[0]?.main ?? null,
        }
      : null,
    commute,
    sources: {
      places: 'Geoapify',
      airQuality: 'US EPA AirNow',
      weather: 'OpenWeather',
      commute: 'GraphHopper',
    },
  }
  cache.set(cacheKey, { at: Date.now(), body })
  return NextResponse.json(body)
}
