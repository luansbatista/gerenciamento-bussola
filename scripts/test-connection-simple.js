const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro na conexão básica:', testError.message);
      return;
    }
    console.log('✅ Conexão básica OK\n');

    // 2. Verificar tabela profiles
    console.log('2️⃣ Verificando tabela profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, is_admin')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Erro ao buscar profiles:', profilesError.message);
    } else {
      console.log('✅ Profiles encontrados:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        console.log('📋 Primeiro usuário:', {
          id: profiles[0].id,
          name: profiles[0].full_name,
          email: profiles[0].email,
          role: profiles[0].role,
          isAdmin: profiles[0].is_admin
        });
      }
    }
    console.log('');

    // 3. Verificar tabela subjects
    console.log('3️⃣ Verificando tabela subjects...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, color');
    
    if (subjectsError) {
      console.log('❌ Erro ao buscar subjects:', subjectsError.message);
    } else {
      console.log('✅ Subjects encontrados:', subjects?.length || 0);
      if (subjects && subjects.length > 0) {
        console.log('📚 Primeiras disciplinas:', subjects.slice(0, 3).map(s => s.name));
      }
    }
    console.log('');

    // 4. Verificar RLS
    console.log('4️⃣ Verificando status do RLS...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_rls_status');
    
    if (rlsError) {
      console.log('⚠️ Não foi possível verificar RLS (normal se RLS estiver desabilitado)');
    } else {
      console.log('✅ RLS status:', rlsStatus);
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testConnection().catch(console.error);



