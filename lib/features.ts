import { createClient } from '@/lib/supabase/server'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Check if a feature is enabled for a specific user.
 * Checks hierarchical permissions: Platform → Broker → Office → Realtor
 * 
 * @param userId - The user's ID
 * @param featureName - The feature name to check
 * @returns boolean - Whether the feature is enabled
 */
export async function isFeatureEnabled(
  userId: string,
  featureName: string
): Promise<boolean> {
  const supabase = await createClient()

  // Get user profile with relationships
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, broker_id, office_id')
    .eq('id', userId)
    .single()

  if (!profile) return false

  // Get the feature
  const { data: feature } = await supabase
    .from('features')
    .select('id')
    .eq('name', featureName)
    .single()

  if (!feature) return false

  // 1. Check platform-level toggle (highest priority)
  const { data: platformToggle } = await supabase
    .from('platform_feature_toggles')
    .select('is_enabled')
    .eq('feature_id', feature.id)
    .single()

  if (!platformToggle?.is_enabled) return false

  // For brokers and above, platform enable is enough
  if (profile.role === 'broker_admin') return true

  // 2. Check broker-level toggle
  if (profile.broker_id) {
    const { data: brokerToggle } = await supabase
      .from('broker_feature_toggles')
      .select('is_enabled')
      .eq('feature_id', feature.id)
      .eq('broker_id', profile.broker_id)
      .single()

    if (brokerToggle && !brokerToggle.is_enabled) return false
  }

  // For office managers, broker enable is enough
  if (profile.role === 'office_manager') return true

  // 3. Check office-level toggle
  if (profile.office_id) {
    const { data: officeToggle } = await supabase
      .from('office_feature_toggles')
      .select('is_enabled')
      .eq('feature_id', feature.id)
      .eq('office_id', profile.office_id)
      .single()

    if (officeToggle && !officeToggle.is_enabled) return false
  }

  // 4. Check realtor-level toggle (most specific)
  const { data: realtorToggle } = await supabase
    .from('realtor_feature_toggles')
    .select('is_enabled')
    .eq('feature_id', feature.id)
    .eq('realtor_id', userId)
    .single()

  if (realtorToggle && !realtorToggle.is_enabled) return false

  return true
}

/**
 * Get all features with their status for a user
 */
export async function getUserFeatures(userId: string) {
  const supabase = await createClient()

  const { data: features } = await supabase
    .from('features')
    .select('*')
    .order('category')
    .order('name')

  if (!features) return []

  const featuresWithStatus = await Promise.all(
    features.map(async (feature: any) => ({
      ...feature,
      enabled: await isFeatureEnabled(userId, feature.name)
    }))
  )

  return featuresWithStatus
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  userId: string,
  featureName: string,
  action: string
) {
  const supabase = await createClient()

  // Get feature id
  const { data: feature } = await supabase
    .from('features')
    .select('id')
    .eq('name', featureName)
    .single()

  if (!feature) return

  await supabase.from('feature_usage_tracking').insert({
    feature_id: feature.id,
    user_id: userId,
    action,
    metadata: {}
  })
}
