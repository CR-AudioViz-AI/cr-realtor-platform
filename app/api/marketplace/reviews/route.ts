import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const providerId = request.nextUrl.searchParams.get('provider_id');
    
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID required' }, { status: 400 });
    }

    const { data: reviews, error } = await supabase
      .from('provider_reviews')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { provider_id, rating, title, review_text } = body;

    if (!provider_id || !rating || !review_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's name
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const reviewerName = profile 
      ? `${profile.first_name} ${profile.last_name?.charAt(0) || ''}.`
      : 'Anonymous';

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('provider_reviews')
      .insert({
        provider_id,
        reviewer_id: user.id,
        reviewer_name: reviewerName,
        rating,
        title,
        review_text,
        is_verified_purchase: false,
        helpful_votes: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    // Update provider's rating
    const { data: allReviews } = await supabase
      .from('provider_reviews')
      .select('rating')
      .eq('provider_id', provider_id);

    if (allReviews) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from('service_providers')
        .update({ 
          rating: Math.round(avgRating * 10) / 10,
          review_count: allReviews.length,
        })
        .eq('id', provider_id);
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
