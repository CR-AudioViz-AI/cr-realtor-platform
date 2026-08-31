// =============================================================================
// PROPERTY DATA ORCHESTRATOR SERVICE
// CR AudioViz AI - Realtor Platform
// Created: Monday, December 30, 2025 | 2:14 PM EST
// Aggregates data from multiple sources with trust layers
// =============================================================================

import {
  PropertyIntelligence,
  PropertyIntelligenceRequest,
  PropertyIntelligenceResponse,
  TrustLayer,
  TrustedData,
  DataSource,
  ConfidenceLevel,
  DataFreshness,
  OrchestratorConfig,
} from '@/types/property-intelligence';

// Default configuration
const DEFAULT_CONFIG: OrchestratorConfig = {
  cache_ttl_seconds: 3600, // 1 hour
  parallel_requests: true,
  include_fallbacks: true,
  min_confidence_threshold: 30,
  timeout_ms: 10000,
  retry_attempts: 2,
};

// Source metadata registry
const SOURCE_REGISTRY: Record<DataSource, {
  name: string;
  url?: string;
  default_confidence: number;
  freshness: DataFreshness;
}> = {
  mls: {
    name: 'Multiple Listing Service',
    default_confidence: 95,
    freshness: 'real_time',
  },
  public_records: {
    name: 'County Public Records',
    default_confidence: 90,
    freshness: 'monthly',
  },
  fema: {
    name: 'FEMA Flood Map Service',
    url: 'https://msc.fema.gov',
    default_confidence: 95,
    freshness: 'annual',
  },
  epa: {
    name: 'Environmental Protection Agency',
    url: 'https://www.epa.gov',
    default_confidence: 90,
    freshness: 'daily',
  },
  census: {
    name: 'U.S. Census Bureau',
    url: 'https://www.census.gov',
    default_confidence: 95,
    freshness: 'annual',
  },
  fcc: {
    name: 'Federal Communications Commission',
    url: 'https://www.fcc.gov',
    default_confidence: 85,
    freshness: 'quarterly',
  },
  hud: {
    name: 'Dept. of Housing & Urban Development',
    url: 'https://www.hud.gov',
    default_confidence: 90,
    freshness: 'annual',
  },
  nces: {
    name: 'National Center for Education Statistics',
    url: 'https://nces.ed.gov',
    default_confidence: 90,
    freshness: 'annual',
  },
  nws: {
    name: 'National Weather Service',
    url: 'https://www.weather.gov',
    default_confidence: 85,
    freshness: 'real_time',
  },
  usgs: {
    name: 'U.S. Geological Survey',
    url: 'https://www.usgs.gov',
    default_confidence: 90,
    freshness: 'weekly',
  },
  walk_score: {
    name: 'Walk Score',
    url: 'https://www.walkscore.com',
    default_confidence: 80,
    freshness: 'monthly',
  },
  google_places: {
    name: 'Google Places',
    url: 'https://maps.google.com',
    default_confidence: 85,
    freshness: 'weekly',
  },
  user_input: {
    name: 'User Provided',
    default_confidence: 50,
    freshness: 'unknown',
  },
  agent_verified: {
    name: 'Agent Verified',
    default_confidence: 85,
    freshness: 'weekly',
  },
  ai_estimated: {
    name: 'AI Estimation',
    default_confidence: 60,
    freshness: 'real_time',
  },
  third_party: {
    name: 'Third Party Provider',
    default_confidence: 70,
    freshness: 'weekly',
  },
};

/**
 * Create a trust layer for a data point
 */
export function createTrustLayer(
  source: DataSource,
  overrides?: Partial<TrustLayer>
): TrustLayer {
  const sourceInfo = SOURCE_REGISTRY[source];
  
  return {
    source,
    source_name: sourceInfo.name,
    source_url: sourceInfo.url,
    retrieved_at: new Date().toISOString(),
    freshness: sourceInfo.freshness,
    confidence: getConfidenceLevel(overrides?.confidence_score ?? sourceInfo.default_confidence),
    confidence_score: overrides?.confidence_score ?? sourceInfo.default_confidence,
    verification_status: 'verified',
    ...overrides,
  };
}

/**
 * Wrap a value with trust metadata
 */
export function wrapWithTrust<T>(
  value: T,
  source: DataSource,
  overrides?: Partial<TrustLayer>
): TrustedData<T> {
  return {
    value,
    trust: createTrustLayer(source, overrides),
  };
}

/**
 * Convert numeric confidence to level
 */
function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'unverified';
}

/**
 * Calculate average confidence across all data points
 */
export function calculateAverageConfidence(data: PropertyIntelligence): number {
  const scores: number[] = [];
  
  function extractScores(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;
    
    if ('trust' in obj && typeof (obj as TrustedData<unknown>).trust === 'object') {
      const trusted = obj as TrustedData<unknown>;
      if (trusted.trust?.confidence_score) {
        scores.push(trusted.trust.confidence_score);
      }
    }
    
    for (const value of Object.values(obj)) {
      extractScores(value);
    }
  }
  
  extractScores(data);
  
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Calculate data completeness percentage
 */
export function calculateCompleteness(data: PropertyIntelligence): number {
  let totalFields = 0;
  let populatedFields = 0;
  
  function countFields(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;
    
    if ('value' in obj && 'trust' in obj) {
      totalFields++;
      const trusted = obj as TrustedData<unknown>;
      if (trusted.value !== null && trusted.value !== undefined) {
        populatedFields++;
      }
      return;
    }
    
    for (const value of Object.values(obj)) {
      countFields(value);
    }
  }
  
  countFields(data);
  
  if (totalFields === 0) return 0;
  return Math.round((populatedFields / totalFields) * 100);
}

/**
 * Count total data points
 */
export function countDataPoints(data: PropertyIntelligence): number {
  let count = 0;
  
  function countTrusted(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;
    
    if ('value' in obj && 'trust' in obj) {
      count++;
      return;
    }
    
    for (const value of Object.values(obj)) {
      countTrusted(value);
    }
  }
  
  countTrusted(data);
  return count;
}

/**
 * Main orchestrator class
 */
export class PropertyDataOrchestrator {
  private config: OrchestratorConfig;
  private cache: Map<string, { data: PropertyIntelligence; timestamp: number }>;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
  }

  /**
   * Get comprehensive property intelligence
   */
  async getPropertyIntelligence(
    request: PropertyIntelligenceRequest
  ): Promise<PropertyIntelligenceResponse> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errors: PropertyIntelligenceResponse['errors'] = [];
    const sourcesQueried: DataSource[] = [];
    const sourcesSucceeded: DataSource[] = [];

    // Check cache
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.cache_ttl_seconds * 1000) {
      return {
        success: true,
        data: cached.data,
        metadata: {
          request_id: requestId,
          processing_time_ms: Date.now() - startTime,
          cache_hit: true,
          sources_queried: [],
          sources_succeeded: [],
        },
      };
    }

    try {
      // Get coordinates if only address provided
      let lat = request.lat;
      let lng = request.lng;
      
      if (!lat || !lng) {
        if (request.address) {
          const geocoded = await this.geocodeAddress(request.address);
          lat = geocoded.lat;
          lng = geocoded.lng;
        } else {
          throw new Error('Either address or coordinates required');
        }
      }

      // Fetch data from all sources in parallel
      const fetchPromises = this.config.parallel_requests
        ? this.fetchAllSourcesParallel(lat, lng, request.address || '')
        : this.fetchAllSourcesSequential(lat, lng, request.address || '');

      const results = await fetchPromises;

      // Aggregate results
      const intelligence = this.aggregateResults(
        request.property_id || `prop_${lat}_${lng}`,
        request.address || `${lat}, ${lng}`,
        lat,
        lng,
        results,
        sourcesQueried,
        sourcesSucceeded,
        errors
      );

      // Calculate metadata
      intelligence.total_data_points = countDataPoints(intelligence);
      intelligence.average_confidence = calculateAverageConfidence(intelligence);
      intelligence.data_completeness = calculateCompleteness(intelligence);

      // Cache results
      this.cache.set(cacheKey, { data: intelligence, timestamp: Date.now() });

      return {
        success: true,
        data: intelligence,
        errors: errors.length > 0 ? errors : undefined,
        metadata: {
          request_id: requestId,
          processing_time_ms: Date.now() - startTime,
          cache_hit: false,
          sources_queried: sourcesQueried,
          sources_succeeded: sourcesSucceeded,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          section: 'orchestrator',
          source: 'third_party',
          error: error instanceof Error ? error.message : 'Unknown error',
        }],
        metadata: {
          request_id: requestId,
          processing_time_ms: Date.now() - startTime,
          cache_hit: false,
          sources_queried: sourcesQueried,
          sources_succeeded: sourcesSucceeded,
        },
      };
    }
  }

  private getCacheKey(request: PropertyIntelligenceRequest): string {
    return `${request.address || ''}_${request.lat}_${request.lng}_${request.property_id || ''}`;
  }

  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    // Use Nominatim (free) for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'CR-AudioViz-AI-Realtor-Platform' } }
    );
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Address not found');
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }

  private async fetchAllSourcesParallel(
    lat: number,
    lng: number,
    address: string
  ): Promise<Map<string, unknown>> {
    const results = new Map<string, unknown>();
    
    const fetchers = [
      this.fetchFloodData(lat, lng).then(r => results.set('flood', r)).catch(() => null),
      this.fetchAirQuality(lat, lng).then(r => results.set('air', r)).catch(() => null),
      this.fetchSchools(lat, lng).then(r => results.set('schools', r)).catch(() => null),
      this.fetchDemographics(lat, lng).then(r => results.set('demographics', r)).catch(() => null),
      this.fetchBroadband(lat, lng).then(r => results.set('broadband', r)).catch(() => null),
      this.fetchWalkScore(lat, lng, address).then(r => results.set('walkability', r)).catch(() => null),
      this.fetchWeather(lat, lng).then(r => results.set('weather', r)).catch(() => null),
      this.fetchNearbyAmenities(lat, lng).then(r => results.set('amenities', r)).catch(() => null),
      this.fetchFairMarketRent(lat, lng).then(r => results.set('fmr', r)).catch(() => null),
      this.fetchEarthquakeData(lat, lng).then(r => results.set('earthquake', r)).catch(() => null),
    ];

    await Promise.allSettled(fetchers);
    return results;
  }

  private async fetchAllSourcesSequential(
    lat: number,
    lng: number,
    address: string
  ): Promise<Map<string, unknown>> {
    const results = new Map<string, unknown>();
    
    try { results.set('flood', await this.fetchFloodData(lat, lng)); } catch {}
    try { results.set('air', await this.fetchAirQuality(lat, lng)); } catch {}
    try { results.set('schools', await this.fetchSchools(lat, lng)); } catch {}
    try { results.set('demographics', await this.fetchDemographics(lat, lng)); } catch {}
    try { results.set('broadband', await this.fetchBroadband(lat, lng)); } catch {}
    try { results.set('walkability', await this.fetchWalkScore(lat, lng, address)); } catch {}
    try { results.set('weather', await this.fetchWeather(lat, lng)); } catch {}
    try { results.set('amenities', await this.fetchNearbyAmenities(lat, lng)); } catch {}
    try { results.set('fmr', await this.fetchFairMarketRent(lat, lng)); } catch {}
    try { results.set('earthquake', await this.fetchEarthquakeData(lat, lng)); } catch {}
    
    return results;
  }

  // Individual data fetchers - these call the existing API modules
  private async fetchFloodData(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/flood?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private async fetchAirQuality(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/air-quality?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private async fetchSchools(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/schools?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private async fetchDemographics(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/demographics?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private async fetchBroadband(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/broadband?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private async fetchWalkScore(lat: number, lng: number, address: string) {
    const response = await fetch(`/api/property-intelligence/walk-score?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`);
    return response.json();
  }

  private async fetchWeather(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/weather?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private async fetchNearbyAmenities(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/amenities?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private async fetchFairMarketRent(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/fmr?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private async fetchEarthquakeData(lat: number, lng: number) {
    const response = await fetch(`/api/property-intelligence/earthquake?lat=${lat}&lng=${lng}`);
    return response.json();
  }

  private aggregateResults(
    propertyId: string,
    address: string,
    lat: number,
    lng: number,
    results: Map<string, unknown>,
    sourcesQueried: DataSource[],
    sourcesSucceeded: DataSource[],
    errors: NonNullable<PropertyIntelligenceResponse['errors']>
  ): PropertyIntelligence {
    // Build the intelligence object with trust layers
    const intelligence: PropertyIntelligence = {
      property_id: propertyId,
      address: wrapWithTrust(address, 'user_input'),
      coordinates: wrapWithTrust({ lat, lng }, 'user_input'),
      
      details: {
        bedrooms: wrapWithTrust(0, 'user_input', { confidence_score: 0, verification_status: 'unverified' }),
        bathrooms: wrapWithTrust(0, 'user_input', { confidence_score: 0, verification_status: 'unverified' }),
        square_feet: wrapWithTrust(0, 'user_input', { confidence_score: 0, verification_status: 'unverified' }),
        lot_size: wrapWithTrust(0, 'user_input', { confidence_score: 0, verification_status: 'unverified' }),
        year_built: wrapWithTrust(0, 'user_input', { confidence_score: 0, verification_status: 'unverified' }),
        property_type: wrapWithTrust('Unknown', 'user_input', { confidence_score: 0, verification_status: 'unverified' }),
        stories: wrapWithTrust(0, 'user_input', { confidence_score: 0, verification_status: 'unverified' }),
        garage_spaces: wrapWithTrust(0, 'user_input', { confidence_score: 0, verification_status: 'unverified' }),
      },
      
      environmental: {
        flood_zone: this.processFloodData(results.get('flood'), sourcesQueried, sourcesSucceeded, errors),
        air_quality: this.processAirQuality(results.get('air'), sourcesQueried, sourcesSucceeded, errors),
        earthquake_risk: this.processEarthquake(results.get('earthquake'), sourcesQueried, sourcesSucceeded, errors),
      },
      
      location: {
        walkability: this.processWalkability(results.get('walkability'), sourcesQueried, sourcesSucceeded, errors),
        schools: this.processSchools(results.get('schools'), sourcesQueried, sourcesSucceeded, errors),
        demographics: this.processDemographics(results.get('demographics'), sourcesQueried, sourcesSucceeded, errors),
        broadband: this.processBroadband(results.get('broadband'), sourcesQueried, sourcesSucceeded, errors),
        fair_market_rent: this.processFMR(results.get('fmr'), sourcesQueried, sourcesSucceeded, errors),
        weather: this.processWeather(results.get('weather'), sourcesQueried, sourcesSucceeded, errors),
      },
      
      amenities: this.processAmenities(results.get('amenities'), sourcesQueried, sourcesSucceeded, errors),
      
      generated_at: new Date().toISOString(),
      total_data_points: 0,
      average_confidence: 0,
      data_completeness: 0,
    };
    
    return intelligence;
  }

  // Process individual data sections with trust layers
  private processFloodData(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('fema');
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'flood', source: 'fema', error: 'No data available' });
      return wrapWithTrust({
        zone: 'Unknown',
        zone_description: 'Data not available',
        flood_risk: 'low' as const,
        insurance_required: false,
      }, 'fema', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('fema');
    const floodData = data as Record<string, unknown>;
    return wrapWithTrust({
      zone: String(floodData.zone || 'X'),
      zone_description: String(floodData.description || 'Minimal flood risk'),
      flood_risk: (floodData.risk as 'high' | 'moderate' | 'low' | 'minimal') || 'low',
      insurance_required: Boolean(floodData.insurance_required),
      panel_number: floodData.panel ? String(floodData.panel) : undefined,
    }, 'fema', { data_date: floodData.effective_date ? String(floodData.effective_date) : undefined });
  }

  private processAirQuality(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('epa');
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'air_quality', source: 'epa', error: 'No data available' });
      return wrapWithTrust({
        aqi: 0,
        category: 'Unknown',
        pollutant: 'Unknown',
        health_concern: 'Data not available',
      }, 'epa', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('epa');
    const airData = data as Record<string, unknown>;
    return wrapWithTrust({
      aqi: Number(airData.aqi) || 0,
      category: String(airData.category || 'Good'),
      pollutant: String(airData.pollutant || 'PM2.5'),
      health_concern: String(airData.health_concern || 'None'),
    }, 'epa');
  }

  private processEarthquake(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('usgs');
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'earthquake', source: 'usgs', error: 'No data available' });
      return wrapWithTrust({
        risk_level: 'low' as const,
        recent_events: 0,
      }, 'usgs', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('usgs');
    const eqData = data as Record<string, unknown>;
    return wrapWithTrust({
      risk_level: (eqData.risk_level as 'high' | 'moderate' | 'low') || 'low',
      recent_events: Number(eqData.count) || 0,
      magnitude_avg: eqData.avg_magnitude ? Number(eqData.avg_magnitude) : undefined,
    }, 'usgs');
  }

  private processWalkability(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('walk_score');
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'walkability', source: 'walk_score', error: 'No data available' });
      return wrapWithTrust({
        walk_score: 0,
        walk_description: 'Data not available',
      }, 'walk_score', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('walk_score');
    const wsData = data as Record<string, unknown>;
    return wrapWithTrust({
      walk_score: Number(wsData.walkscore) || 0,
      walk_description: String(wsData.description || ''),
      bike_score: wsData.bike ? Number((wsData.bike as Record<string, unknown>).score) : undefined,
      bike_description: wsData.bike ? String((wsData.bike as Record<string, unknown>).description) : undefined,
      transit_score: wsData.transit ? Number((wsData.transit as Record<string, unknown>).score) : undefined,
      transit_description: wsData.transit ? String((wsData.transit as Record<string, unknown>).description) : undefined,
    }, 'walk_score');
  }

  private processSchools(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('nces');
    if (!data || !Array.isArray(data)) {
      errors.push({ section: 'schools', source: 'nces', error: 'No data available' });
      return wrapWithTrust([], 'nces', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('nces');
    return wrapWithTrust(
      data.map((s: Record<string, unknown>) => ({
        name: String(s.name || ''),
        type: (s.type as 'elementary' | 'middle' | 'high' | 'private') || 'elementary',
        rating: s.rating ? Number(s.rating) : undefined,
        distance_miles: Number(s.distance) || 0,
        enrollment: s.enrollment ? Number(s.enrollment) : undefined,
        grades: String(s.grades || ''),
      })),
      'nces'
    );
  }

  private processDemographics(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('census');
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'demographics', source: 'census', error: 'No data available' });
      return wrapWithTrust({
        population: 0,
        median_age: 0,
        median_income: 0,
        owner_occupied_pct: 0,
        education_bachelors_pct: 0,
      }, 'census', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('census');
    const demoData = data as Record<string, unknown>;
    return wrapWithTrust({
      population: Number(demoData.population) || 0,
      median_age: Number(demoData.median_age) || 0,
      median_income: Number(demoData.median_income) || 0,
      owner_occupied_pct: Number(demoData.owner_occupied_pct) || 0,
      education_bachelors_pct: Number(demoData.bachelors_pct) || 0,
    }, 'census');
  }

  private processBroadband(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('fcc');
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'broadband', source: 'fcc', error: 'No data available' });
      return wrapWithTrust({
        max_download_speed: 0,
        providers: 0,
        fiber_available: false,
        technology_types: [],
      }, 'fcc', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('fcc');
    const bbData = data as Record<string, unknown>;
    return wrapWithTrust({
      max_download_speed: Number(bbData.max_download) || 0,
      providers: Number(bbData.providers) || 0,
      fiber_available: Boolean(bbData.fiber),
      technology_types: Array.isArray(bbData.technologies) ? bbData.technologies.map(String) : [],
    }, 'fcc');
  }

  private processFMR(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('hud');
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'fmr', source: 'hud', error: 'No data available' });
      return wrapWithTrust({
        efficiency: 0,
        one_bedroom: 0,
        two_bedroom: 0,
        three_bedroom: 0,
        four_bedroom: 0,
        year: new Date().getFullYear(),
      }, 'hud', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('hud');
    const fmrData = data as Record<string, unknown>;
    return wrapWithTrust({
      efficiency: Number(fmrData.efficiency) || 0,
      one_bedroom: Number(fmrData.one_bedroom) || 0,
      two_bedroom: Number(fmrData.two_bedroom) || 0,
      three_bedroom: Number(fmrData.three_bedroom) || 0,
      four_bedroom: Number(fmrData.four_bedroom) || 0,
      year: Number(fmrData.year) || new Date().getFullYear(),
    }, 'hud');
  }

  private processWeather(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('nws');
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'weather', source: 'nws', error: 'No data available' });
      return wrapWithTrust({
        current_temp: 0,
        condition: 'Unknown',
        humidity: 0,
        forecast_high: 0,
        forecast_low: 0,
      }, 'nws', { confidence_score: 0, verification_status: 'unverified' });
    }
    succeeded.push('nws');
    const wxData = data as Record<string, unknown>;
    return wrapWithTrust({
      current_temp: Number(wxData.temperature) || 0,
      condition: String(wxData.condition || 'Unknown'),
      humidity: Number(wxData.humidity) || 0,
      forecast_high: Number(wxData.high) || 0,
      forecast_low: Number(wxData.low) || 0,
    }, 'nws');
  }

  private processAmenities(data: unknown, queried: DataSource[], succeeded: DataSource[], errors: NonNullable<PropertyIntelligenceResponse['errors']>) {
    queried.push('google_places');
    
    const emptyAmenities = {
      restaurants: wrapWithTrust([], 'google_places', { confidence_score: 0, verification_status: 'unverified' }),
      grocery: wrapWithTrust([], 'google_places', { confidence_score: 0, verification_status: 'unverified' }),
      healthcare: wrapWithTrust([], 'google_places', { confidence_score: 0, verification_status: 'unverified' }),
      parks: wrapWithTrust([], 'google_places', { confidence_score: 0, verification_status: 'unverified' }),
      transit: wrapWithTrust([], 'google_places', { confidence_score: 0, verification_status: 'unverified' }),
    };
    
    if (!data || typeof data !== 'object') {
      errors.push({ section: 'amenities', source: 'google_places', error: 'No data available' });
      return emptyAmenities;
    }
    
    succeeded.push('google_places');
    const amenityData = data as Record<string, unknown[]>;
    
    // 2026-08-30: `value: unknown` on the boundary, narrowed on the next line.
  //
  // amenityData.* is unknown[], so Array.map passes `unknown`. A Record parameter is
  // NARROWER than the callback signature permits, which is what TS2345 refused. But
  // widening alone produces TS18046 on every field read, so the cast has to happen
  // inside — not in the signature.
  const mapAmenity = (value: unknown) => {
    const a = (value ?? {}) as Record<string, unknown>;
    return ({
      name: String(a.name || ''),
      category: String(a.category || ''),
      distance_miles: Number(a.distance) || 0,
      rating: a.rating ? Number(a.rating) : undefined,
      review_count: a.reviews ? Number(a.reviews) : undefined,
      address: a.address ? String(a.address) : undefined,
      price_level: a.price ? String(a.price) : undefined,
    });
  };
    
    return {
      restaurants: wrapWithTrust(
        Array.isArray(amenityData.restaurants) ? amenityData.restaurants.map(mapAmenity) : [],
        'google_places'
      ),
      grocery: wrapWithTrust(
        Array.isArray(amenityData.grocery) ? amenityData.grocery.map(mapAmenity) : [],
        'google_places'
      ),
      healthcare: wrapWithTrust(
        Array.isArray(amenityData.healthcare) ? amenityData.healthcare.map(mapAmenity) : [],
        'google_places'
      ),
      parks: wrapWithTrust(
        Array.isArray(amenityData.parks) ? amenityData.parks.map(mapAmenity) : [],
        'google_places'
      ),
      transit: wrapWithTrust(
        Array.isArray(amenityData.transit) ? amenityData.transit.map(mapAmenity) : [],
        'google_places'
      ),
    };
  }
}

// Export singleton instance
export const propertyOrchestrator = new PropertyDataOrchestrator();
