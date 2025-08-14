import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Configuração hardcoded para desenvolvimento
const supabaseUrl = "https://stiphfmiuxhygwlutwxm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aXBoZm1pdXhoeWd3bHV0d3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDgwMTAsImV4cCI6MjA3MDYyNDAxMH0.Ft7phh4Ef592U7IqeXCYSsgK94i1S6wnzJ15fkkmB4Y";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
