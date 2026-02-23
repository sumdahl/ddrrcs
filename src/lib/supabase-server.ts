import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function getEnv(key: string): string {
  const value = import.meta.env[key] || process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export function createServiceClient() {
  const url = getEnv('VITE_SUPABASE_URL')
  const serviceKey = getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY')

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function createServerSupabaseClient(_request: Request) {
  const url = getEnv('VITE_SUPABASE_URL')
  const anonKey = getEnv('VITE_SUPABASE_ANON_KEY')

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
