import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";

export async function createClient() {
  const cookieStore = await cookies()

  // Removing Database type to allow flexible queries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(
    supabaseUrl(),
    publishableKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component cookie set - ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component cookie remove - ignore
          }
        },
      },
    }
  )
}
