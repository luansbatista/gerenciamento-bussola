const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuestionsDatabase() {
  console.log('🔍 Verificando estado da tabela questions...\n');

  try {
    // 1. Contar total de questões
    console.log('1️⃣ Contando total de questões...');
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erro ao contar questões:', countError.message);
    } else {
      console.log(`✅ Total de questões na tabela: ${count}`);
    }

    // 2. Buscar algumas questões para análise
    console.log('\n2️⃣ Buscando questões para análise...');
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.log('❌ Erro ao buscar questões:', fetchError.message);
    } else {
      console.log(`✅ Encontradas ${questions.length} questões mais recentes:`);
      questions.forEach((q, index) => {
        console.log(`   ${index + 1}. ID: ${q.id}`);
        console.log(`      Disciplina: ${q.disciplina}`);
        console.log(`      Questão: ${q.question?.substring(0, 50)}...`);
        console.log(`      Criada em: ${q.created_at}`);
        console.log('');
      });
    }

    // 3. Verificar duplicatas manualmente
    console.log('3️⃣ Verificando duplicatas...');
    const { data: allQuestions, error: allError } = await supabase
      .from('questions')
      .select('id, disciplina, question');

    if (allError) {
      console.log('❌ Erro ao buscar todas as questões:', allError.message);
    } else {
      const duplicates = [];
      const seen = new Set();
      
      allQuestions.forEach(q => {
        const key = `${q.disciplina}|${q.question}`;
        if (seen.has(key)) {
          duplicates.push(q);
        } else {
          seen.add(key);
        }
      });
      
      if (duplicates.length > 0) {
        console.log(`⚠️  Encontradas ${duplicates.length} questões duplicadas:`);
        duplicates.forEach((dup, index) => {
          console.log(`   ${index + 1}. ID: ${dup.id}`);
          console.log(`      Disciplina: ${dup.disciplina}`);
          console.log(`      Questão: ${dup.question?.substring(0, 50)}...`);
          console.log('');
        });
      } else {
        console.log('✅ Nenhuma duplicata encontrada');
      }
    }

    // 4. Testar exclusão de uma questão de teste
    console.log('4️⃣ Testando exclusão...');
    if (questions && questions.length > 0) {
      const testQuestion = questions[0];
      console.log(`Tentando excluir questão de teste: ${testQuestion.id}`);
      
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('id', testQuestion.id);

      if (deleteError) {
        console.log('❌ Erro ao excluir questão:', deleteError.message);
        console.log('Detalhes do erro:', {
          code: deleteError.code,
          details: deleteError.details,
          hint: deleteError.hint
        });
      } else {
        console.log('✅ Questão excluída com sucesso');
        
        // Verificar se foi realmente excluída
        const { data: checkDelete, error: checkError } = await supabase
          .from('questions')
          .select('*')
          .eq('id', testQuestion.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          console.log('✅ Confirmação: Questão não encontrada (excluída com sucesso)');
        } else if (checkDelete) {
          console.log('⚠️  Alerta: Questão ainda existe após tentativa de exclusão');
        }
      }
    }

    // 5. Verificar se RLS está ativo
    console.log('\n5️⃣ Verificando RLS...');
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('questions')
        .select('*')
        .limit(1);

      if (rlsError) {
        console.log('❌ Erro ao acessar questions (possível problema de RLS):', rlsError.message);
      } else {
        console.log('✅ Acesso à tabela questions funcionando');
      }
    } catch (error) {
      console.log('❌ Erro ao testar acesso:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkQuestionsDatabase().catch(console.error);
