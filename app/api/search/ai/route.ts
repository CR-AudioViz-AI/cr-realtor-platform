export const dynamic = 'force-dynamic'
export const revalidate = 0
// app/api/search/ai/route.ts
// AI-powered natural language property search
// Uses OpenAI to extract filters from natural language queries

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

let _openai: any = null;
function getOpenai() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

interface ExtractedFilters {
  cities?: string[];
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  propertyTypes?: string[];
  features?: string[];
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  maxHoa?: number;
  garageSpaces?: number;
  maxDaysOnMarket?: number;
}

const SYSTEM_PROMPT = `You are a real estate search assistant. Extract search filters from natural language queries about properties.

Available filter fields:
- cities: array of city names (e.g., ["Naples", "Fort Myers"])
- minPrice, maxPrice: numbers (e.g., 300000, 500000)
- minBeds, maxBeds: integers (e.g., 3, 5)
- minBaths, maxBaths: numbers (e.g., 2, 3.5)
- minSqft, maxSqft: integers (e.g., 1500, 3000)
- propertyTypes: array from ["single_family", "condo", "townhouse", "multi_family", "land", "mobile"]
- features: array from ["pool", "waterfront", "golf", "gated", "new_construction", "smart_home", "solar", "ev_charger", "home_office", "guest_house", "fireplace", "hardwood"]
- yearBuiltMin, yearBuiltMax: years (e.g., 2000, 2024)
- maxHoa: max monthly HOA fee
- garageSpaces: minimum garage spaces
- maxDaysOnMarket: filter for new listings (e.g., 7 for last week)

Price interpretation:
- "under 500k" = maxPrice: 500000
- "500k-700k" = minPrice: 500000, maxPrice: 700000
- "around 400k" = minPrice: 350000, maxPrice: 450000
- "affordable" = maxPrice: 300000
- "luxury" = minPrice: 1000000

Bedroom interpretation:
- "3 bedroom" or "3 bed" or "3br" = minBeds: 3, maxBeds: 3
- "3+ bedroom" = minBeds: 3
- "family home" = minBeds: 3

Feature interpretation:
- "with pool" = features: ["pool"]
- "on the water" or "waterfront" or "ocean view" = features: ["waterfront"]
- "in a gated community" = features: ["gated"]
- "new build" or "newly built" = features: ["new_construction"]

Property type interpretation:
- "house" or "home" = propertyTypes: ["single_family"]
- "condo" or "apartment" = propertyTypes: ["condo"]
- "townhome" or "townhouse" = propertyTypes: ["townhouse"]

Return ONLY valid JSON with the extracted filters. Include a "suggestion" field with a helpful message about the search.
If no filters can be extracted, return empty filters object with a suggestion asking for more details.`;

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // 2026-08-30: `openai` was never created. OpenAI is imported as a class and no
    // instance was ever made, so this route threw ReferenceError on every call — AI
    // search in this app has never run.
    //
    // Constructed HERE, not at module scope: a client built at import time needs a
    // live credential during `next build`, which is the same defect behind the seven
    // 'supabaseUrl is required' build failures across the fleet.
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `Extract search filters from this query: "${query}"
          
Return JSON in this exact format:
{
  "filters": { ...extracted filters... },
  "suggestion": "A helpful message about the search results or suggestions to refine"
}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json({
        filters: {},
        suggestion: "I couldn't understand that search. Try something like '3 bedroom house under $500k in Naples with pool'"
      });
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({
      filters: parsed.filters || {},
      suggestion: parsed.suggestion || null,
      query: query,
    });
  } catch (error) {
    console.error('AI Search error:', error);
    return NextResponse.json(
      { 
        filters: {},
        suggestion: "Search is temporarily unavailable. Please use the filters manually.",
        error: 'AI search failed' 
      },
      { status: 500 }
    );
  }
}
