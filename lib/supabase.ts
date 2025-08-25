import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Configuração com fallback para desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zghneimasvhimrzbwtrv.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client for server-side operations
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// New SSR client for server components
export { createClient as createServerComponentClient } from '@/utils/supabase/server'

// Função para verificar conectividade com o Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Erro na conexão com Supabase:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao verificar conexão:', error)
    return false
  }
}

// Função para retry de operações
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      console.warn(`Tentativa ${i + 1} falhou:`, error)
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError
}
