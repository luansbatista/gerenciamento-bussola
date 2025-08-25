const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProfileIssue() {
  console.log('🔍 Debug detalhado do problema de perfil...\n');

  try {
    // 1. Verificar se conseguimos acessar a tabela profiles
    console.log('1️⃣ Testando acesso básico à tabela profiles...');
    const { data: basicAccess, error: basicError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (basicError) {
      console.log('❌ Erro no acesso básico:', basicError.message);
      console.log('Detalhes:', {
        code: basicError.code,
        details: basicError.details,
        hint: basicError.hint
      });
    } else {
      console.log('✅ Acesso básico funcionando');
    }

    // 2. Tentar buscar todos os perfis
    console.log('\n2️⃣ Tentando buscar todos os perfis...');
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*');

    if (allError) {
      console.log('❌ Erro ao buscar todos os perfis:', allError.message);
      console.log('Detalhes:', {
        code: allError.code,
        details: allError.details,
        hint: allError.hint
      });
    } else {
      console.log(`✅ Encontrados ${allProfiles?.length || 0} perfis`);
      if (allProfiles && allProfiles.length > 0) {
        console.log('📋 Perfis encontrados:');
        allProfiles.forEach((profile, i) => {
          console.log(`   ${i + 1}. ID: ${profile.id}, Email: ${profile.email}, Role: ${profile.role}`);
        });
      }
    }

    // 3. Tentar buscar por ID específico
    console.log('\n3️⃣ Tentando buscar por ID específico...');
    const testId = '03e6e0e7-34cf-40c1-9a9d-a7192dbdcd16';
    const { data: profileById, error: idError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testId)
      .single();

    if (idError) {
      console.log('❌ Erro ao buscar por ID:', idError.message);
      console.log('Detalhes:', {
        code: idError.code,
        details: idError.details,
        hint: idError.hint
      });
    } else {
      console.log('✅ Perfil encontrado por ID:', profileById);
    }

    // 4. Tentar buscar por email específico
    console.log('\n4️⃣ Tentando buscar por email específico...');
    const testEmail = 'luansalescontact@gmail.com';
    const { data: profileByEmail, error: emailError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (emailError) {
      console.log('❌ Erro ao buscar por email:', emailError.message);
      console.log('Detalhes:', {
        code: emailError.code,
        details: emailError.details,
        hint: emailError.hint
      });
    } else {
      console.log('✅ Perfil encontrado por email:', profileByEmail);
    }

    // 5. Verificar se há políticas RLS ativas
    console.log('\n5️⃣ Verificando políticas RLS...');
    
    // Tentar uma operação que seria bloqueada por RLS
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (rlsError && rlsError.message.includes('policy')) {
      console.log('⚠️  Possível problema com políticas RLS:', rlsError.message);
    } else if (rlsError) {
      console.log('❌ Outro erro:', rlsError.message);
    } else {
      console.log('✅ Sem problemas aparentes de RLS');
    }

    // 6. Testar inserção de perfil de teste
    console.log('\n6️⃣ Testando inserção de perfil de teste...');
    const testProfile = {
      id: 'test-debug-id-' + Date.now(),
      email: 'test-debug@example.com',
      full_name: 'Test Debug',
      role: 'student',
      is_admin: false,
      study_goal: 4,
      current_streak: 0,
      total_study_hours: 0
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro ao inserir perfil de teste:', insertError.message);
      console.log('Detalhes:', {
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('✅ Perfil de teste inserido com sucesso:', insertTest);
      
      // Limpar o perfil de teste
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testProfile.id);
      console.log('🧹 Perfil de teste removido');
    }

    // 7. Verificar estrutura da tabela
    console.log('\n7️⃣ Verificando estrutura da tabela...');
    const { data: structure, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'profiles' })
      .catch(() => ({ data: null, error: { message: 'Função não disponível' } }));

    if (structureError) {
      console.log('ℹ️  Não foi possível verificar estrutura via RPC:', structureError.message);
    } else {
      console.log('📋 Estrutura da tabela:', structure);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugProfileIssue().catch(console.error);



