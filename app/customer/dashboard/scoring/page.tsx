'use client';

import { createClient } from '@/lib/supabase/client';

import React, { useState, useEffect } from 'react';
import { ScoringMatrix } from '@/components/ScoringMatrix';
import { PropertyComparison } from '@/components/PropertyComparison';
import { 

  ScoringPreferences, 
  PropertyWithScore, 
  DEFAULT_SCORING_FACTORS 
} from '@/types/scoring';

// 2026-08-30: `supabase` was NEVER DECLARED in this file. createClient is imported
// and was called by nothing, so every database statement referenced a bare
// `supabase` that does not exist and threw ReferenceError at runtime. Same defect as
// /api/auth in core and three routes in javari-admin.
const supabase = createClient();


export default function ScoringDashboard() {
  const [preferences, setPreferences] = useState<ScoringPreferences | null>(null);
  const [properties, setProperties] = useState<PropertyWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'compare'>('preferences');
  const [userContext, setUserContext] = useState({
    budget_max: 500000,
    budget_min: 200000,
    work_address: '',
    min_beds: 3,
    min_baths: 2,
    min_sqft: 1500,
  });

  

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Use defaults for non-authenticated users
        setPreferences({
          id: 'temp',
          user_id: 'anonymous',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          factors: DEFAULT_SCORING_FACTORS,
          preset: 'custom',
        });
        setLoading(false);
        return;
      }

      // Load preferences
      const { data: prefsData } = await supabase
        .from('scoring_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefsData) {
        setPreferences({
          ...prefsData,
          factors: prefsData.factors || DEFAULT_SCORING_FACTORS,
        });
      } else {
        // Create default preferences
        const defaultPrefs: ScoringPreferences = {
          id: `pref_${Date.now()}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          factors: DEFAULT_SCORING_FACTORS,
          preset: 'custom',
        };
        setPreferences(defaultPrefs);
      }

      // Load saved properties with scores
      const { data: savedProps } = await supabase
        .from('saved_properties')
        .select(`
          *,
          properties (*)
        `)
        .eq('user_id', user.id);

      if (savedProps && savedProps.length > 0) {
        // Calculate scores for each property
        const scoredProperties = await Promise.all(
          savedProps.map(async (sp) => {
            const response = await fetch('/api/scoring/calculate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                property: sp.properties,
                preferences: prefsData || { factors: DEFAULT_SCORING_FACTORS },
                userContext,
              }),
            });
            const { score } = await response.json();
            return {
              property: sp.properties,
              score,
            };
          })
        );
        setProperties(scoredProperties);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save your preferences');
        return;
      }

      const { error } = await supabase
        .from('scoring_preferences')
        .upsert({
          user_id: user.id,
          factors: preferences.factors,
          preset: preferences.preset,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Recalculate scores for all saved properties
      await recalculateScores();
      
      alert('Preferences saved! Property scores updated.');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const recalculateScores = async () => {
    if (!preferences || properties.length === 0) return;

    const updatedProperties = await Promise.all(
      properties.map(async (p) => {
        const response = await fetch('/api/scoring/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property: p.property,
            preferences,
            userContext,
          }),
        });
        const { score } = await response.json();
        return { ...p, score };
      })
    );

    setProperties(updatedProperties.sort((a, b) => b.score.total_score - a.score.total_score));
  };

  const removeFromComparison = (propertyId: string) => {
    setProperties(properties.filter(p => p.property.id !== propertyId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Property Scoring</h1>
          <p className="text-gray-600 mt-1">
            Define what matters to you and see how properties stack up
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'preferences'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ My Preferences
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'compare'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Compare Properties ({properties.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'preferences' && preferences && (
          <div className="space-y-8">
            {/* User Context (Budget, Work Address, etc.) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Criteria</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={userContext.budget_min}
                      onChange={(e) => setUserContext({
                        ...userContext,
                        budget_min: parseInt(e.target.value) || 0,
                      })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={userContext.budget_max}
                      onChange={(e) => setUserContext({
                        ...userContext,
                        budget_max: parseInt(e.target.value) || 0,
                      })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Address (for commute)
                  </label>
                  <input
                    type="text"
                    value={userContext.work_address}
                    onChange={(e) => setUserContext({
                      ...userContext,
                      work_address: e.target.value,
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Requirements
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={userContext.min_beds}
                      onChange={(e) => setUserContext({
                        ...userContext,
                        min_beds: parseInt(e.target.value) || 0,
                      })}
                      className="w-20 border rounded-lg px-3 py-2"
                      placeholder="Beds"
                    />
                    <span className="text-gray-500">beds</span>
                    <input
                      type="number"
                      value={userContext.min_baths}
                      onChange={(e) => setUserContext({
                        ...userContext,
                        min_baths: parseFloat(e.target.value) || 0,
                      })}
                      className="w-20 border rounded-lg px-3 py-2"
                      placeholder="Baths"
                    />
                    <span className="text-gray-500">baths</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring Matrix */}
            <ScoringMatrix
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onSave={savePreferences}
            />
          </div>
        )}

        {activeTab === 'compare' && (
          <PropertyComparison
            properties={properties}
            onRemoveProperty={removeFromComparison}
            maxProperties={6}
          />
        )}
      </div>
    </div>
  );
}
