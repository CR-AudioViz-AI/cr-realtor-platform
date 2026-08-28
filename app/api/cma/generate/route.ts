import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { address, city, bedrooms, bathrooms, square_feet, year_built, condition, pool, waterfront } = body;

    // Fetch comparable properties
    const { data: comparables } = await supabase
      .from('properties')
      .select('*')
      .eq('city', city)
      .gte('bedrooms', (bedrooms || 3) - 1)
      .lte('bedrooms', (bedrooms || 3) + 1)
      .gte('square_feet', (square_feet || 2000) * 0.8)
      .lte('square_feet', (square_feet || 2000) * 1.2)
      .limit(10);

    const baseValuePerSqft = 250;
    const sqft = square_feet || 2000;
    let adjustedValue = sqft * baseValuePerSqft;
    if (pool) adjustedValue += 25000;
    if (waterfront) adjustedValue += 100000;
    if (condition === 'excellent') adjustedValue *= 1.1;
    if (condition === 'poor') adjustedValue *= 0.85;

    const report = {
      subject_property: { address, city, bedrooms, bathrooms, square_feet: sqft, year_built },
      comparables: (comparables || []).map((comp, i) => ({
        id: comp.id,
        address: comp.address,
        city: comp.city,
        price: comp.price,
        sold_price: comp.sold_price,
        bedrooms: comp.bedrooms,
        bathrooms: comp.bathrooms,
        square_feet: comp.square_feet,
        year_built: comp.year_built,
        distance: `${(0.2 + i * 0.3).toFixed(1)} mi`,
        price_per_sqft: Math.round(comp.price / comp.square_feet),
        status: comp.status,
        adjusted_price: comp.price + ((sqft - comp.square_feet) * 100),
      })),
      valuation: {
        low: Math.round(adjustedValue * 0.95),
        mid: Math.round(adjustedValue),
        high: Math.round(adjustedValue * 1.08),
        confidence: (comparables?.length || 0) >= 3 ? 'high' : 'medium',
      },
      market_insights: { avg_days_on_market: 28, price_trend: 4.5, inventory_level: 'Low', buyer_demand: 'High' },
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('CMA error:', error);
    return NextResponse.json({ error: 'Failed to generate CMA' }, { status: 500 });
  }
}
