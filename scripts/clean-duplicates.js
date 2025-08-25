const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicates() {
  console.log('🧹 Limpando questões duplicadas...\n');

  try {
    // 1. Buscar todas as questões
    console.log('1️⃣ Buscando todas as questões...');
    const { data: allQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.log('❌ Erro ao buscar questões:', fetchError.message);
      return;
    }

    console.log(`✅ Encontradas ${allQuestions.length} questões`);

    // 2. Identificar duplicatas
    console.log('\n2️⃣ Identificando duplicatas...');
    const duplicates = [];
    const seen = new Set();
    const toDelete = [];

    allQuestions.forEach(q => {
      const key = `${q.disciplina}|${q.question}`;
      if (seen.has(key)) {
        duplicates.push(q);
        toDelete.push(q.id);
      } else {
        seen.add(key);
      }
    });

    console.log(`⚠️  Encontradas ${duplicates.length} questões duplicadas`);

    if (duplicates.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada');
      return;
    }

    // 3. Mostrar duplicatas
    console.log('\n3️⃣ Questões duplicadas encontradas:');
    duplicates.forEach((dup, index) => {
      console.log(`   ${index + 1}. ID: ${dup.id}`);
      console.log(`      Disciplina: ${dup.disciplina}`);
      console.log(`      Questão: ${dup.question?.substring(0, 50)}...`);
      console.log(`      Criada em: ${dup.created_at}`);
      console.log('');
    });

    // 4. Confirmar exclusão
    console.log(`4️⃣ Excluindo ${toDelete.length} questões duplicadas...`);
    
    let deletedCount = 0;
    for (const id of toDelete) {
      try {
        console.log(`🗑️  Excluindo questão ${id}...`);
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.log(`❌ Erro ao excluir questão ${id}:`, deleteError.message);
        } else {
          console.log(`✅ Questão ${id} excluída com sucesso`);
          deletedCount++;
        }

        // Pequeno delay entre exclusões
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`💥 Exceção ao excluir questão ${id}:`, error.message);
      }
    }

    console.log(`\n📊 Resultado: ${deletedCount}/${toDelete.length} questões excluídas`);

    // 5. Verificar resultado
    console.log('\n5️⃣ Verificando resultado...');
    const { count: finalCount, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erro ao contar questões finais:', countError.message);
    } else {
      console.log(`✅ Total final de questões: ${finalCount}`);
      console.log(`📉 Questões removidas: ${allQuestions.length - finalCount}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

cleanDuplicates().catch(console.error);



