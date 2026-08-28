import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
// scripts/seed-properties.ts

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}
// Seeds database with 1,000 realistic Florida properties


const SUPABASE_URL = supabaseUrl()
const supabaseKey = secretKey()