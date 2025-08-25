const { createBrowserClient } = require('@supabase/ssr');

// Simular as variáveis de ambiente do frontend
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://zghneimasvhimrzbwtrv.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

async function testFrontendClient() {
  console.log('🧪 Testando cliente Supabase do frontend...\n');

  try {
    // Criar cliente como no frontend
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('🔧 Configurações:');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Presente' : 'Ausente');
    console.log('');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL e Key são obrigatórios');
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase criado com sucesso');
    console.log('');

    // Testar acesso básico
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

    // Testar busca por ID
    console.log('\n2️⃣ Testando busca por ID...');
    const testId = '03e6e0e7-34cf-40c1-9a9d-a7192dbdcd16';
    const { data: profileById, error: idError } = await supabase
      .from('profiles')
      .select('role, is_admin, avatar_url, full_name, study_goal, current_streak, total_study_hours')
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

    // Testar busca por email
    console.log('\n3️⃣ Testando busca por email...');
    const testEmail = 'luansalescontact@gmail.com';
    const { data: profileByEmail, error: emailError } = await supabase
      .from('profiles')
      .select('role, is_admin, avatar_url, full_name, study_goal, current_streak, total_study_hours')
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

    // Testar autenticação
    console.log('\n4️⃣ Testando autenticação...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('❌ Erro na autenticação:', authError.message);
    } else {
      console.log('✅ Autenticação funcionando');
      console.log('Sessão:', session ? 'Presente' : 'Ausente');
      if (session?.user) {
        console.log('Usuário logado:', session.user.email);
        console.log('ID do usuário:', session.user.id);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFrontendClient().catch(console.error);
