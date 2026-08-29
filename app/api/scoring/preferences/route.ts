import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { DEFAULT_SCORING_FACTORS, SCORING_PRESETS } from '@/types/scoring';

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

// GET - Retrieve user's scoring preferences
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return defaults for anonymous users
      return NextResponse.json({
        success: true,
        preferences: {
          id: 'anonymous',
          user_id: 'anonymous',
          factors: DEFAULT_SCORING_FACTORS,
          preset: 'custom',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }

    // Check if user has saved preferences
    const { data: existingPrefs, error } = await supabase
      .from('scoring_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (existingPrefs) {
      return NextResponse.json({
        success: true,
        preferences: existingPrefs,
      });
    }

    // Create default preferences for new user
    const defaultPrefs = {
      user_id: user.id,
      factors: DEFAULT_SCORING_FACTORS,
      preset: 'custom',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newPrefs, error: insertError } = await supabase
      .from('scoring_preferences')
      .insert(defaultPrefs)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      preferences: newPrefs,
      created: true,
    });

  } catch (error) {
    console.error('Error getting preferences:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve preferences' },
      { status: 500 }
    );
  }
}

// POST - Save/Update user's scoring preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { factors, preset, userContext } = body;

    // Validate factors
    if (factors && !Array.isArray(factors)) {
      return NextResponse.json(
        { error: 'Invalid factors format' },
        { status: 400 }
      );
    }

    const updateData = {
      user_id: user.id,
      factors: factors || DEFAULT_SCORING_FACTORS,
      preset: preset || 'custom',
      user_context: userContext || null,
      updated_at: new Date().toISOString(),
    };

    // Upsert preferences
    const { data, error } = await supabase
      .from('scoring_preferences')
      .upsert(updateData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      preferences: data,
    });

  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

// PUT - Apply a preset to user's preferences
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { presetName } = body;

    if (!presetName || !SCORING_PRESETS[presetName]) {
      return NextResponse.json(
        { error: 'Invalid preset name' },
        { status: 400 }
      );
    }

    // Get current preferences
    const { data: currentPrefs } = await supabase
      .from('scoring_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const baseFatcors = currentPrefs?.factors || DEFAULT_SCORING_FACTORS;
    const presetOverrides = SCORING_PRESETS[presetName];

    // Apply preset overrides
    const updatedFactors = baseFatcors.map((factor: any) => {
      const override = presetOverrides.find((p: any) => p.id === factor.id);
      if (override) {
        return {
          ...factor,
          weight: override.weight ?? factor.weight,
          enabled: override.enabled ?? factor.enabled,
        };
      }
      return factor;
    });

    // Save updated preferences
    const { data, error } = await supabase
      .from('scoring_preferences')
      .upsert({
        user_id: user.id,
        factors: updatedFactors,
        preset: presetName,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      preferences: data,
      appliedPreset: presetName,
    });

  } catch (error) {
    console.error('Error applying preset:', error);
    return NextResponse.json(
      { error: 'Failed to apply preset' },
      { status: 500 }
    );
  }
}

// DELETE - Reset to defaults
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Reset to defaults
    const { data, error } = await supabase
      .from('scoring_preferences')
      .upsert({
        user_id: user.id,
        factors: DEFAULT_SCORING_FACTORS,
        preset: 'custom',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      preferences: data,
      reset: true,
    });

  } catch (error) {
    console.error('Error resetting preferences:', error);
    return NextResponse.json(
      { error: 'Failed to reset preferences' },
      { status: 500 }
    );
  }
}
