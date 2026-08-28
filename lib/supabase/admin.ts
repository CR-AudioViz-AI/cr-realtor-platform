import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

let adminClient: SupabaseClient | null = null

/**
 * Get the Supabase admin client with service role key.
 * Uses lazy initialization to avoid build-time errors.
 * 
 * @returns Supabase client with admin privileges
 * @throws Error if credentials are missing at runtime
 */
export function getAdminClient(): SupabaseClient {
  if (adminClient) {
    return adminClient
  }

  const SUPABASE_URL = supabaseUrl()
  const supabaseServiceKey = secretKey()

  if (!SUPABASE_URL || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  }

  adminClient = createClient(SUPABASE_URL, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return adminClient
}

/**
 * Create a fresh admin client (for cases where you need a new instance)
 */
export function createAdminClient(): SupabaseClient {
  const SUPABASE_URL = supabaseUrl()
  const supabaseServiceKey = secretKey()

  if (!SUPABASE_URL || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(SUPABASE_URL, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
