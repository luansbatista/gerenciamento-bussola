import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Configuração com fallback para desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://stiphfmiuxhygwlutwxm.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aXBoZm1pdXhoeWd3bHV0d3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDgwMTAsImV4cCI6MjA3MDYyNDAxMH0.Ft7phh4Ef592U7IqeXCYSsgK94i1S6wnJz15fkkmB4Y"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client for server-side operations
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// New SSR client for server components
export { createClient as createServerComponentClient } from '@/utils/supabase/server'
