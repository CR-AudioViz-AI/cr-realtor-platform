/**
 * Supabase Type Helpers for TypeScript Strict Mode
 * Provides utilities to handle type assertions safely
 * 
 * Updated: 2025-12-01 - Added createAdminClient for customer invitation system
 */

import { Database } from '@/types/database.complete'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

// Extract table types
export type Tables = Database['public']['Tables']
export type TableName = keyof Tables

// Helper to get Row type for a table
export type Row<T extends TableName> = Tables[T]['Row']

// Helper to get Insert type (with fallback)
export type Insert<T extends TableName> = Tables[T] extends { Insert: infer I }
  ? I
  : Partial<Row<T>>

// Helper to get Update type (with fallback)
export type Update<T extends TableName> = Tables[T] extends { Update: infer U }
  ? U
  : Partial<Row<T>>

/**
 * Create Supabase Admin Client with Service Role
 * Used for privileged operations like:
 * - Creating users
 * - Bypassing RLS
 * - Admin dashboard operations
 * 
 * SECURITY: Only use server-side, never expose to client
 */
export function createAdminClient() {
  const SUPABASE_URL = supabaseUrl()
  const serviceRoleKey = secretKey()

  if (!SUPABASE_URL || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Type-safe query builder for Supabase
 * Handles TypeScript strict mode issues
 */
export class TypedSupabaseQuery<T extends TableName> {
  constructor(
    private client: SupabaseClient<Database>,
    private table: T
  ) {}

  /**
   * Select with automatic type inference
   */
  async select<Columns extends string = '*'>(
    columns: Columns = '*' as Columns
  ) {
    const { data, error } = await this.client
      .from(this.table)
      .select(columns)
    
    return { data: data as Row<T>[] | null, error }
  }

  /**
   * Insert with proper typing
   */
  async insert(values: Insert<T> | Insert<T>[]) {
    const { data, error } = await this.client
      .from(this.table)
      .insert(values as any)
      .select()
    
    return { data: data as Row<T>[] | null, error }
  }

  /**
   * Update with proper typing
   */
  async update(values: Update<T>) {
    const { data, error } = await this.client
      .from(this.table)
      .update(values as any)
      .select()
    
    return { data: data as Row<T>[] | null, error }
  }

  /**
   * Delete with proper return type
   */
  async delete() {
    const { data, error } = await this.client
      .from(this.table)
      .delete()
      .select()
    
    return { data: data as Row<T>[] | null, error }
  }
}

/**
 * Create a typed query builder
 */
export function typed<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T
) {
  return new TypedSupabaseQuery(client, table)
}

/**
 * Type guard for checking if data exists
 */
export function hasData<T>(
  result: { data: T | null; error: any }
): result is { data: T; error: null } {
  return result.data !== null && result.error === null
}

/**
 * Usage Examples:
 * 
 * // Admin operations (server-side only):
 * const adminClient = createAdminClient()
 * await adminClient.auth.admin.createUser({ email, password })
 * 
 * // Instead of:
 * const { data } = await supabase.from('profiles').select('*')
 * 
 * // Use:
 * const { data } = await typed(supabase, 'profiles').select()
 * // data is automatically typed as Row<'profiles'>[]
 * 
 * // For updates:
 * const update: Update<'profiles'> = {
 *   full_name: 'New Name'
 * }
 * await typed(supabase, 'profiles').update(update)
 * 
 * // With type guard:
 * const result = await typed(supabase, 'profiles').select()
 * if (hasData(result)) {
 *   // TypeScript knows result.data is Profile[] here
 *   result.data.forEach(profile => {
 *     console.log(profile.full_name)
 *   })
 * }
 */
