import { createClient } from "@supabase/supabase-js";

// Configuração simplificada sem SSR
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zghneimasvhimrzbwtrv.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0";

export const createSimpleClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};
