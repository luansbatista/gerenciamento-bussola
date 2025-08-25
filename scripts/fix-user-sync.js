const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserSync() {
  console.log('🔧 Corrigindo sincronização do usuário...\n');

  try {
    // 1. Verificar o perfil existente
    console.log('1️⃣ Verificando perfil existente...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'luansalescontact@gmail.com')
      .single();

    if (profileError) {
      console.log('❌ Erro ao buscar perfil:', profileError.message);
    } else {
      console.log('✅ Perfil encontrado:', {
        id: existingProfile.id,
        email: existingProfile.email,
        role: existingProfile.role,
        is_admin: existingProfile.is_admin
      });
    }

    // 2. Tentar fazer login para obter o ID correto do auth.user
    console.log('\n2️⃣ Tentando fazer login para obter ID correto...');
    
    // Simular login (você precisará fornecer a senha real)
    console.log('⚠️  Para testar completamente, você precisa fazer login no sistema');
    console.log('📧 Email: luansalescontact@gmail.com');
    
    // 3. Verificar se o ID do perfil corresponde ao ID do auth.user
    if (existingProfile) {
      console.log('\n3️⃣ Verificando se o ID do perfil está correto...');
      console.log('🆔 ID do perfil:', existingProfile.id);
      console.log('📧 Email do perfil:', existingProfile.email);
      
      // 4. Atualizar o perfil para garantir que está correto
      console.log('\n4️⃣ Atualizando perfil...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          is_admin: true,
          full_name: 'Luan Sales',
          updated_at: new Date().toISOString()
        })
        .eq('email', 'luansalescontact@gmail.com')
        .select()
        .single();

      if (updateError) {
        console.log('❌ Erro ao atualizar perfil:', updateError.message);
      } else {
        console.log('✅ Perfil atualizado com sucesso:', {
          id: updatedProfile.id,
          email: updatedProfile.email,
          role: updatedProfile.role,
          is_admin: updatedProfile.is_admin
        });
      }
    }

    // 5. Criar um trigger para sincronizar automaticamente
    console.log('\n5️⃣ Verificando se há trigger de sincronização...');
    
    // Verificar se existe um trigger para criar perfil automaticamente
    const { data: triggers, error: triggerError } = await supabase
      .rpc('get_triggers', { table_name: 'profiles' })
      .catch(() => ({ data: null, error: { message: 'Função não existe' } }));

    if (triggerError) {
      console.log('ℹ️  Não foi possível verificar triggers:', triggerError.message);
      console.log('💡 Recomendação: Verificar se existe um trigger para criar perfil automaticamente');
    }

    console.log('\n✅ Processo concluído!');
    console.log('📋 Próximos passos:');
    console.log('   1. Faça login no sistema com luansalescontact@gmail.com');
    console.log('   2. Verifique se o erro de perfil foi resolvido');
    console.log('   3. Se ainda houver erro, o ID do auth.user pode ser diferente');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixUserSync().catch(console.error);




