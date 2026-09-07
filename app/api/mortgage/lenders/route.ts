// CR AudioViz AI - Mortgage Rate Monitor
// API: Get Lenders - ULTRA SIMPLE VERSION
// v5: Direct SQL approach - November 18, 2025 11:57 AM EST

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('[API v5] State param:', state);

    // SIMPLE APPROACH: Use raw SQL with RPC if needed
    if (!state) {
      // No state filter - just return all lenders
      const { data, error } = await supabase
        .from('lenders')
        .select('*')
        .eq('active', true)
        .limit(limit);

      if (error) {
        console.error('[API v5] Error fetching all lenders:', error);
        return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 });
      }

      return NextResponse.json({
        data: data || [],
        count: data?.length || 0,
        limit,
        filters: { state: null }
      });
    }

    // WITH state filter - fetch ALL lenders and filter in JavaScript
    const stateUpper = state.toUpperCase();
    console.log('[API v5] Filtering by state:', stateUpper);

    // Step 1: Get ALL active lenders
    const { data: allLenders, error: lenderError } = await supabase
      .from('lenders')
      .select('id, name, lender_type, headquarters_state, website, phone, nmls_id, rating, review_count, years_in_business')
      .eq('active', true);

    if (lenderError) {
      console.error('[API v5] Error fetching lenders:', lenderError);
      return NextResponse.json({ 
        error: 'Failed to fetch lenders', 
        details: lenderError.message 
      }, { status: 500 });
    }

    console.log('[API v5] Total lenders fetched:', allLenders?.length || 0);

    if (!allLenders || allLenders.length === 0) {
      return NextResponse.json({
        data: [],
        count: 0,
        limit,
        filters: { state: stateUpper }
      });
    }

    // Step 2: Get ALL service areas for this state
    const { data: serviceAreas, error: serviceError } = await supabase
      .from('lender_service_areas')
      .select('lender_id')
      .eq('state', stateUpper)
      .eq('active', true);

    if (serviceError) {
      console.error('[API v5] Error fetching service areas:', serviceError);
      return NextResponse.json({ 
        error: 'Failed to fetch service areas',
        details: serviceError.message,
        hint: 'Check RLS policies on lender_service_areas table'
      }, { status: 500 });
    }

    console.log('[API v5] Service areas for', stateUpper, ':', serviceAreas?.length || 0);

    // Step 3: Create set of lender IDs that serve this state
    const lenderIdsInState = new Set(
      (serviceAreas || []).map(sa => sa.lender_id)
    );

    console.log('[API v5] Unique lenders serving', stateUpper, ':', lenderIdsInState.size);

    // Step 4: Filter lenders
    const filtered = allLenders.filter(lender => {
      // Include if national (serves everywhere)
      if (lender.lender_type === 'national') {
        return true;
      }
      // Include if they serve this state
      return lenderIdsInState.has(lender.id);
    });

    console.log('[API v5] Filtered lenders:', filtered.length);

    // Step 5: Sort by rating (simple)
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Step 6: Paginate
    const paginated = filtered.slice(0, limit);

    console.log('[API v5] Returning', paginated.length, 'lenders');

    return NextResponse.json({
      data: paginated,
      count: filtered.length,
      limit,
      filters: { state: stateUpper }
    });

  } catch (error) {
    console.error('[API v5] Top-level exception:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
