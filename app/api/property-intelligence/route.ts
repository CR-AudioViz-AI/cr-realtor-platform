export const dynamic = 'force-dynamic'
export const revalidate = 0
// app/api/property-intelligence/route.ts
// Main API endpoint for Property Intelligence Card data
// Aggregates data from FEMA, EPA, USGS, NWS, Walk Score, Google Places APIs
// Updated: December 25, 2025 - Removed Yelp (paid), using Google Places for amenities

import { NextRequest, NextResponse } from 'next/server'
import { getFloodZone } from '@/lib/apis/fema-flood'
import { getDisasterHistory } from '@/lib/apis/fema-disasters'
import { getEnvironmentalData } from '@/lib/apis/epa-environment'
import { getEarthquakeHistory } from '@/lib/apis/usgs-earthquakes'
import { getWeatherData } from '@/lib/apis/nws-weather'
import { getWalkScore, WalkScoreData } from '@/lib/apis/walk-score'
import { searchNearbyPlaces, GooglePlace } from '@/lib/apis/google-places'

export interface PropertyIntelligenceRequest {
  lat: number
  lng: number
  address?: string
  toggles: string[]
  fipsCode?: string
  censusTract?: string
  radius?: number
}

interface NearbyCategory {
  count: number
  places: GooglePlace[]
}

export interface PropertyIntelligenceResponse {
  success: boolean
  data: {
    flood?: any
    disasters?: any
    environment?: any
    earthquakes?: any
    weather?: any
    walkScore?: WalkScoreData
    nearbyAmenities?: Record<string, NearbyCategory>
  }
  propertyScore: {
    score: number
    grade: string
    summary: string
    factors: { name: string; impact: number; reason: string }[]
  }
  errors?: Record<string, string>
  queriedAt: string
}

// Fetch nearby places by category using Google Places
async function fetchNearbyAmenities(
  lat: number,
  lng: number,
  radius: number
): Promise<Record<string, NearbyCategory>> {
  const categories = [
    { key: 'restaurants', type: 'restaurant' },
    { key: 'grocery', type: 'supermarket' },
    { key: 'gyms', type: 'gym' },
    { key: 'coffee', type: 'cafe' },
    { key: 'banks', type: 'bank' },
    { key: 'pharmacy', type: 'pharmacy' },
    { key: 'schools', type: 'school' },
    { key: 'parks', type: 'park' },
    { key: 'gas_stations', type: 'gas_station' },
    { key: 'transit', type: 'transit_station' },
  ]

  const results: Record<string, NearbyCategory> = {}

  // Fetch all categories in parallel
  const promises = categories.map(async ({ key, type }) => {
    try {
      const response = await searchNearbyPlaces(lat, lng, {
        type,
        radius,
      })
      return {
        key,
        data: {
          count: response.results.length,
          places: response.results.slice(0, 5), // Top 5 for each category
        },
      }
    } catch (error) {
      return {
        key,
        data: { count: 0, places: [] },
      }
    }
  })

  const responses = await Promise.all(promises)

  for (const { key, data } of responses) {
    results[key] = data
  }

  return results
}

function calculatePropertyScore(
  data: PropertyIntelligenceResponse['data']
): PropertyIntelligenceResponse['propertyScore'] {
  const factors: { name: string; impact: number; reason: string }[] = []
  let totalScore = 70

  // Walk Score impact
  if (data.walkScore) {
    const walkImpact = Math.round((data.walkScore.walkscore || 0) * 0.3)
    totalScore += walkImpact - 15
    factors.push({
      name: 'Walkability',
      impact: walkImpact - 15,
      reason: `Walk Score: ${data.walkScore.walkscore || 'N/A'} - ${data.walkScore.walkDescription}`,
    })

    if (data.walkScore.transitScore) {
      const transitImpact = Math.round(data.walkScore.transitScore * 0.1)
      totalScore += transitImpact - 5
      factors.push({
        name: 'Transit Access',
        impact: transitImpact - 5,
        reason: `Transit Score: ${data.walkScore.transitScore}`,
      })
    }

    if (data.walkScore.bikeScore) {
      const bikeImpact = Math.round(data.walkScore.bikeScore * 0.05)
      totalScore += bikeImpact - 2
      factors.push({
        name: 'Bikeability',
        impact: bikeImpact - 2,
        reason: `Bike Score: ${data.walkScore.bikeScore}`,
      })
    }
  }

  // Flood risk impact
  if (data.flood) {
    let floodImpact = 0
    const zone = data.flood.floodZone || ''
    if (zone.startsWith('A') || zone.startsWith('V')) {
      floodImpact = -20
    } else if (zone.startsWith('B') || zone === 'X500') {
      floodImpact = -5
    } else if (zone === 'X' || zone === 'C') {
      floodImpact = 10
    }
    totalScore += floodImpact
    factors.push({
      name: 'Flood Risk',
      impact: floodImpact,
      reason: `Zone ${zone || 'Unknown'} - ${data.flood.riskLevel || 'Unknown risk'}`,
    })
  }

  // Nearby amenities impact (Google Places)
  if (data.nearbyAmenities) {
    let amenityScore = 0
    const categories = Object.keys(data.nearbyAmenities)
    
    for (const cat of categories) {
      const count = data.nearbyAmenities[cat].count
      if (count >= 10) amenityScore += 1.5
      else if (count >= 5) amenityScore += 1
      else if (count > 0) amenityScore += 0.5
    }
    
    amenityScore = Math.min(Math.round(amenityScore), 15)
    totalScore += amenityScore
    
    const totalPlaces = Object.values(data.nearbyAmenities).reduce(
      (sum, cat) => sum + cat.count,
      0
    )
    
    factors.push({
      name: 'Nearby Amenities',
      impact: amenityScore,
      reason: `${totalPlaces} places across ${categories.length} categories within 1 mile`,
    })
  }

  // Environment impact
  if (data.environment?.airQuality) {
    const aqi = data.environment.airQuality.aqi || 50
    let envImpact = 5
    if (aqi > 150) envImpact = -10
    else if (aqi > 100) envImpact = -5
    else if (aqi > 50) envImpact = 0
    
    totalScore += envImpact
    factors.push({
      name: 'Air Quality',
      impact: envImpact,
      reason: `AQI: ${aqi} - ${data.environment.airQuality.category || 'Moderate'}`,
    })
  }

  // Normalize score
  totalScore = Math.max(0, Math.min(100, totalScore))

  // Determine grade
  let grade = 'C'
  if (totalScore >= 90) grade = 'A+'
  else if (totalScore >= 85) grade = 'A'
  else if (totalScore >= 80) grade = 'A-'
  else if (totalScore >= 75) grade = 'B+'
  else if (totalScore >= 70) grade = 'B'
  else if (totalScore >= 65) grade = 'B-'
  else if (totalScore >= 60) grade = 'C+'
  else if (totalScore >= 55) grade = 'C'
  else if (totalScore >= 50) grade = 'C-'
  else if (totalScore >= 45) grade = 'D+'
  else if (totalScore >= 40) grade = 'D'
  else grade = 'F'

  // Generate summary
  const positiveFactors = factors.filter((f) => f.impact > 0)
  const negativeFactors = factors.filter((f) => f.impact < 0)

  let summary = `This property scores ${Math.round(totalScore)}/100 (${grade}). `
  if (positiveFactors.length > 0) {
    summary += `Strengths: ${positiveFactors.map((f) => f.name.toLowerCase()).join(', ')}. `
  }
  if (negativeFactors.length > 0) {
    summary += `Concerns: ${negativeFactors.map((f) => f.name.toLowerCase()).join(', ')}.`
  }

  return { score: Math.round(totalScore), grade, summary, factors }
}

export async function POST(request: NextRequest) {
  try {
    const body: PropertyIntelligenceRequest = await request.json()
    const { lat, lng, address, toggles = ['flood'], fipsCode, radius = 1609 } = body

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Number.isFinite BEFORE the range comparison, because the range check
    // alone does not reject a non-number.
    //
    // `body` is JSON. Its TypeScript type is a compile-time claim, not a
    // runtime guarantee, so lat can arrive as a string or an object. Every
    // comparison against a non-numeric value yields NaN, and every comparison
    // WITH NaN is false — so `lat < -90 || lat > 90` waves it straight through.
    // Downstream it reaches the EPA URLs as `${lat - radiusDegrees}`, which is
    // arithmetic, so nothing injectable survives — that is why CodeQL's three
    // js/request-forgery findings in lib/apis/epa-environment.ts are false
    // positives and are being dismissed rather than papered over with
    // encodeURIComponent on a number.
    //
    // What DOES survive is the string "NaN" in the URL, so the request goes to
    // EPA malformed and comes back useless, and the caller is told nothing.
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude must be numbers' },
        { status: 400 }
      )
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    const results: PropertyIntelligenceResponse['data'] = {}
    const errors: Record<string, string> = {}
    const fetchPromises: Promise<void>[] = []

    // Walk Score
    if (toggles.includes('walkability') || toggles.includes('walkscore') || toggles.includes('all')) {
      fetchPromises.push(
        getWalkScore(lat, lng, address)
          .then((response) => {
            if (response.success && response.data) {
              results.walkScore = response.data
            } else {
              errors.walkScore = response.error || 'Failed to fetch Walk Score'
            }
          })
          .catch((err) => {
            errors.walkScore = err.message
          })
      )
    }

    // Nearby Amenities (Google Places - FREE)
    if (toggles.includes('amenities') || toggles.includes('places') || toggles.includes('all')) {
      fetchPromises.push(
        fetchNearbyAmenities(lat, lng, radius)
          .then((amenities) => {
            results.nearbyAmenities = amenities
          })
          .catch((err) => {
            errors.nearbyAmenities = err.message
          })
      )
    }

    // Flood Risk (FEMA - FREE)
    if (toggles.includes('flood') || toggles.includes('risk') || toggles.includes('all')) {
      fetchPromises.push(
        getFloodZone(lat, lng)
          .then((data) => {
            results.flood = data
          })
          .catch((err) => {
            errors.flood = err.message
          })
      )
    }

    // Disaster History (OpenFEMA - FREE)
    if ((toggles.includes('disasters') || toggles.includes('risk') || toggles.includes('all')) && fipsCode) {
      fetchPromises.push(
        getDisasterHistory(fipsCode)
          .then((data) => {
            results.disasters = data
          })
          .catch((err) => {
            errors.disasters = err.message
          })
      )
    }

    // Environmental (EPA - FREE)
    if (toggles.includes('environment') || toggles.includes('all')) {
      fetchPromises.push(
        getEnvironmentalData(lat, lng)
          .then((data) => {
            results.environment = data
          })
          .catch((err) => {
            errors.environment = err.message
          })
      )
    }

    // Earthquakes (USGS - FREE)
    if (toggles.includes('earthquakes') || toggles.includes('risk') || toggles.includes('all')) {
      fetchPromises.push(
        getEarthquakeHistory(lat, lng)
          .then((data) => {
            results.earthquakes = data
          })
          .catch((err) => {
            errors.earthquakes = err.message
          })
      )
    }

    // Weather (NWS - FREE)
    if (toggles.includes('weather') || toggles.includes('all')) {
      fetchPromises.push(
        getWeatherData(lat, lng)
          .then((data) => {
            results.weather = data
          })
          .catch((err) => {
            errors.weather = err.message
          })
      )
    }

    await Promise.allSettled(fetchPromises)

    const propertyScore = calculatePropertyScore(results)

    const response: PropertyIntelligenceResponse = {
      success: true,
      data: results,
      propertyScore,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      queriedAt: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Property Intelligence API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        queriedAt: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const address = searchParams.get('address') || undefined
  const toggles = searchParams.get('toggles')?.split(',') || ['all']
  const fipsCode = searchParams.get('fips') || undefined

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { success: false, error: 'Valid lat and lng query params required' },
      { status: 400 }
    )
  }

  const fakeRequest = {
    json: async () => ({ lat, lng, address, toggles, fipsCode }),
  } as NextRequest

  return POST(fakeRequest)
}
