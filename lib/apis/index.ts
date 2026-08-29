// lib/apis/index.ts
// Central export for all property intelligence APIs
// Updated: December 25, 2025 - Added Walk Score, Yelp Fusion, Google Places

// Free Government APIs
export * from './fema-flood'
export * from './fema-disasters'
export * from './epa-environment'
export * from './usgs-earthquakes'
export * from './nws-weather'

// Premium APIs (require API keys)
export * from './walk-score'
export * from './yelp-fusion'
export * from './google-places'

// Utility types
export interface PropertyLocation {
  lat: number
  lng: number
  address?: string
  fipsCode?: string
  censusTract?: string
}

// Batch fetch all intelligence data
export async function fetchAllPropertyIntelligence(location: PropertyLocation) {
  const { lat, lng, address, fipsCode } = location

  const results = await Promise.allSettled([
    // 2026-08-29: called m.getFloodRisk, which fema-flood does not export — it
    // exports getFloodZone. Every property-intelligence fetch rejected on this
    // one, so flood data never loaded.
    import('./fema-flood').then((m) => m.getFloodZone(lat, lng)),
    fipsCode
      ? import('./fema-disasters').then((m) => m.getDisasterHistory(fipsCode))
      : Promise.resolve(null),
    import('./epa-environment').then((m) => m.getEnvironmentalData(lat, lng)),
    import('./usgs-earthquakes').then((m) => m.getEarthquakeHistory(lat, lng)),
    import('./nws-weather').then((m) => m.getWeatherData(lat, lng)),
    import('./walk-score').then((m) => m.getWalkScore(lat, lng, address)),
    import('./yelp-fusion').then((m) => m.getNearbyAmenities(lat, lng)),
    import('./google-places').then((m) => m.getNearbyPlacesSummary(lat, lng)),
  ])

  return {
    flood: results[0].status === 'fulfilled' ? results[0].value : null,
    disasters: results[1].status === 'fulfilled' ? results[1].value : null,
    environment: results[2].status === 'fulfilled' ? results[2].value : null,
    earthquakes: results[3].status === 'fulfilled' ? results[3].value : null,
    weather: results[4].status === 'fulfilled' ? results[4].value : null,
    walkScore: results[5].status === 'fulfilled' ? results[5].value : null,
    nearbyAmenities: results[6].status === 'fulfilled' ? results[6].value : null,
    nearbyPlaces: results[7].status === 'fulfilled' ? results[7].value : null,
  }
}
