const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfileIssue() {
  console.log('🔍 Verificando problema com perfil...\n');

  try {
    // 1. Verificar se a tabela profiles existe
    console.log('1️⃣ Verificando se a tabela profiles existe...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');

    if (tablesError) {
      console.log('❌ Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('✅ Tabela profiles existe:', tables?.length > 0);
    }

    // 2. Verificar estrutura da tabela profiles
    console.log('\n2️⃣ Verificando estrutura da tabela profiles...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Erro ao verificar colunas:', columnsError.message);
    } else {
      console.log('📋 Colunas da tabela profiles:');
      columns?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 3. Verificar se há usuários na tabela profiles
    console.log('\n3️⃣ Verificando usuários na tabela profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, is_admin, full_name')
      .limit(10);

    if (profilesError) {
      console.log('❌ Erro ao buscar perfis:', profilesError.message);
      console.log('Detalhes:', {
        code: profilesError.code,
        details: profilesError.details,
        hint: profilesError.hint
      });
    } else {
      console.log(`✅ Total de perfis encontrados: ${profiles?.length || 0}`);
      if (profiles && profiles.length > 0) {
        console.log('📋 Primeiros perfis:');
        profiles.forEach(profile => {
          console.log(`   - ID: ${profile.id}, Email: ${profile.email}, Role: ${profile.role}, Admin: ${profile.is_admin}`);
        });
      }
    }

    // 4. Verificar se há usuários na tabela auth.users
    console.log('\n4️⃣ Verificando usuários na tabela auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('❌ Erro ao buscar usuários auth:', authError.message);
    } else {
      console.log(`✅ Total de usuários auth: ${authUsers?.users?.length || 0}`);
      if (authUsers?.users && authUsers.users.length > 0) {
        console.log('📋 Primeiros usuários auth:');
        authUsers.users.slice(0, 3).forEach(user => {
          console.log(`   - ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`);
        });
      }
    }

    // 5. Testar inserção de perfil para o email específico
    console.log('\n5️⃣ Testando inserção de perfil para luansalescontact@gmail.com...');
    const testProfile = {
      id: 'test-user-id',
      email: 'luansalescontact@gmail.com',
      full_name: 'Luan Sales',
      role: 'admin',
      is_admin: true,
      avatar_url: null,
      study_goal: 4,
      current_streak: 0,
      total_study_hours: 0
    };

    const { data: insertData, error: insertError } = await supabase
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
      console.log('✅ Perfil de teste inserido com sucesso:', insertData);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkProfileIssue().catch(console.error);



