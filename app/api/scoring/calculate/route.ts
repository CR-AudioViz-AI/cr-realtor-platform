import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server';
import { calculatePropertyScore } from '@/lib/scoring-engine';
import { ScoringPreferences, DEFAULT_SCORING_FACTORS } from '@/types/scoring';

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property, preferences, userContext } = body;

    if (!property) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    // Use provided preferences or defaults
    const scoringPreferences: ScoringPreferences = preferences || {
      id: 'default',
      user_id: 'anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      factors: DEFAULT_SCORING_FACTORS,
      preset: 'custom',
    };

    // Default user context if not provided
    const context = userContext || {
      budget_max: property.price * 1.2, // 20% above listing price
      budget_min: property.price * 0.8,
      min_beds: 1,
      min_baths: 1,
      min_sqft: 500,
    };

    // Enrich property with API data if not already present
    const enrichedProperty = await enrichPropertyData(property);

    // Calculate score
    const score = calculatePropertyScore(
      enrichedProperty,
      scoringPreferences,
      context
    );

    return NextResponse.json({
      success: true,
      score,
      property: enrichedProperty,
    });

  } catch (error) {
    console.error('Error calculating score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate property score' },
      { status: 500 }
    );
  }
}

// Batch calculation for multiple properties
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { properties, preferences, userContext } = body;

    if (!properties || !Array.isArray(properties)) {
      return NextResponse.json(
        { error: 'Properties array is required' },
        { status: 400 }
      );
    }

    const scoringPreferences: ScoringPreferences = preferences || {
      id: 'default',
      user_id: 'anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      factors: DEFAULT_SCORING_FACTORS,
      preset: 'custom',
    };

    // Calculate scores for all properties
    const scores = await Promise.all(
      properties.map(async (property: any) => {
        const context = userContext || {
          budget_max: property.price * 1.2,
          budget_min: property.price * 0.8,
          min_beds: 1,
          min_baths: 1,
          min_sqft: 500,
        };

        const enrichedProperty = await enrichPropertyData(property);
        const score = calculatePropertyScore(enrichedProperty, scoringPreferences, context);

        return {
          property_id: property.id,
          score,
        };
      })
    );

    // Sort by total score descending and add ranks
    const rankedScores = scores
      .sort((a, b) => b.score.total_score - a.score.total_score)
      .map((item, index) => ({
        ...item,
        score: {
          ...item.score,
          rank: index + 1,
        },
      }));

    return NextResponse.json({
      success: true,
      scores: rankedScores,
      count: rankedScores.length,
    });

  } catch (error) {
    console.error('Error calculating batch scores:', error);
    return NextResponse.json(
      { error: 'Failed to calculate property scores' },
      { status: 500 }
    );
  }
}

// Enrich property with external API data
async function enrichPropertyData(property: any): Promise<any> {
  const enriched = { ...property };

  try {
    // Only fetch if data is missing
    const needsEnrichment = 
      !property.walk_score ||
      !property.school_rating ||
      !property.flood_zone ||
      !property.internet_speed;

    if (!needsEnrichment) {
      return enriched;
    }

    const lat = property.latitude;
    const lng = property.longitude;
    const zip = property.zip;

    // Fetch Walk Score (if we have coordinates)
    if (lat && lng && !property.walk_score) {
      try {
        const walkScoreResponse = await fetch(
          `https://api.walkscore.com/score?format=json&lat=${lat}&lon=${lng}&wsapikey=${process.env.WALKSCORE_API_KEY}`
        );
        if (walkScoreResponse.ok) {
          const walkData = await walkScoreResponse.json();
          enriched.walk_score = walkData.walkscore;
          enriched.transit_score = walkData.transit?.score;
          enriched.bike_score = walkData.bike?.score;
        }
      } catch (e) {
        console.error('Walk Score API error:', e);
      }
    }

    // Fetch School Rating (simplified - use local API)
    if (!property.school_rating) {
      try {
        const schoolResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/schools?zip=${zip}`
        );
        if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          enriched.school_rating = schoolData.average_rating || 5;
        }
      } catch (e) {
        enriched.school_rating = 5; // Default
      }
    }

    // Fetch Flood Zone (use FEMA API)
    if (!property.flood_zone && lat && lng) {
      try {
        const floodResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/flood-zone?lat=${lat}&lng=${lng}`
        );
        if (floodResponse.ok) {
          const floodData = await floodResponse.json();
          enriched.flood_zone = floodData.zone || 'X';
        }
      } catch (e) {
        enriched.flood_zone = 'Unknown';
      }
    }

    // Fetch Internet Speed (use FCC API)
    if (!property.internet_speed && zip) {
      try {
        const internetResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/internet-speed?zip=${zip}`
        );
        if (internetResponse.ok) {
          const internetData = await internetResponse.json();
          enriched.internet_speed = internetData.max_speed || 100;
        }
      } catch (e) {
        enriched.internet_speed = 100; // Default
      }
    }

    // Fetch Crime Score (simplified)
    if (!property.crime_score && zip) {
      try {
        const crimeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/crime?zip=${zip}`
        );
        if (crimeResponse.ok) {
          const crimeData = await crimeResponse.json();
          enriched.crime_score = crimeData.safety_score || 50;
        }
      } catch (e) {
        enriched.crime_score = 50; // Neutral default
      }
    }

  } catch (error) {
    console.error('Error enriching property data:', error);
  }

  return enriched;
}
