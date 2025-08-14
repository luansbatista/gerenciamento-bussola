import { createBrowserClient } from "@supabase/ssr";

// Configuração com fallback para desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://stiphfmiuxhygwlutwxm.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aXBoZm1pdXhoeWd3bHV0d3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDgwMTAsImV4cCI6MjA3MDYyNDAxMH0.Ft7phh4Ef592U7IqeXCYSsgK94i1S6wnzJ15fkkmB4Y";

// Verificar se as configurações estão presentes
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuração Supabase incompleta:', {
    url: supabaseUrl ? 'PRESENTE' : 'AUSENTE',
    key: supabaseKey ? 'PRESENTE' : 'AUSENTE'
  });
}

export const createClient = () => {
  try {
    const client = createBrowserClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase criado:', {
      url: supabaseUrl,
      keyPresent: !!supabaseKey,
      keyLength: supabaseKey?.length || 0
    });
    return client;
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error);
    throw error;
  }
};
