const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImportBatches() {
  console.log('🧪 Testando importação em lotes controlados...\n');

  try {
    // Criar questões de teste
    const testQuestions = [];
    for (let i = 1; i <= 20; i++) {
      testQuestions.push({
        disciplina: 'Teste Lote',
        subject: 'Teste Lote',
        assunto: `Assunto ${i}`,
        question: `Questão de teste em lote ${i}`,
        enunciado: `Questão de teste em lote ${i}`,
        opcao_a: `Opção A ${i}`,
        opcao_b: `Opção B ${i}`,
        opcao_c: `Opção C ${i}`,
        opcao_d: `Opção D ${i}`,
        opcao_e: '',
        correct_answer: i % 4,
        difficulty: 'medium',
        nivel: 'médio'
      });
    }

    console.log(`📝 Criadas ${testQuestions.length} questões de teste`);

    // Processar em lotes de 5
    const batchSize = 5;
    const totalBatches = Math.ceil(testQuestions.length / batchSize);
    let totalImported = 0;

    console.log(`🔄 Processando ${totalBatches} lotes de ${batchSize} questões cada`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, testQuestions.length);
      const batchQuestions = testQuestions.slice(startIndex, endIndex);
      
      console.log(`\n📦 Processando lote ${batchIndex + 1}/${totalBatches} (questões ${startIndex + 1}-${endIndex})`);
      
      // Inserir lote
      try {
        const { data, error } = await supabase
          .from('questions')
          .insert(batchQuestions)
          .select();

        if (error) {
          console.log(`❌ Erro no lote ${batchIndex + 1}:`, error.message);
        } else {
          console.log(`✅ Lote ${batchIndex + 1} inserido: ${data.length} questões`);
          totalImported += data.length;
        }
      } catch (error) {
        console.log(`💥 Exceção no lote ${batchIndex + 1}:`, error.message);
      }

      // Delay entre lotes
      if (batchIndex < totalBatches - 1) {
        console.log('⏳ Aguardando 2 segundos entre lotes...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n📊 Resultado final: ${totalImported}/${testQuestions.length} questões importadas`);

    // Verificar total no banco
    const { count: finalCount, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erro ao contar questões finais:', countError.message);
    } else {
      console.log(`✅ Total de questões no banco: ${finalCount}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testImportBatches().catch(console.error);




