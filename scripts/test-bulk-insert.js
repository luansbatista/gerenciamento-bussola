const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBulkInsert() {
  console.log('🧪 Testando inserção em lote...\n');

  try {
    // Criar 10 questões de teste
    const testQuestions = [];
    for (let i = 1; i <= 10; i++) {
      testQuestions.push({
        disciplina: 'Teste',
        subject: 'Teste',
        assunto: `Assunto ${i}`,
        question: `Questão de teste ${i}`,
        enunciado: `Questão de teste ${i}`,
        opcao_a: `Opção A ${i}`,
        opcao_b: `Opção B ${i}`,
        opcao_c: `Opção C ${i}`,
        opcao_d: `Opção D ${i}`,
        opcao_e: '',
        correct_answer: i % 4, // 0, 1, 2, 3
        difficulty: 'medium',
        nivel: 'médio'
      });
    }

    console.log(`📝 Tentando inserir ${testQuestions.length} questões...`);

    // Teste 1: Inserção individual com delay
    console.log('\n1️⃣ Teste: Inserção individual com delay...');
    let successCount = 0;
    for (let i = 0; i < testQuestions.length; i++) {
      try {
        console.log(`Inserindo questão ${i + 1}...`);
        const { data, error } = await supabase
          .from('questions')
          .insert([testQuestions[i]])
          .select()
          .single();

        if (error) {
          console.log(`❌ Erro na questão ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Questão ${i + 1} inserida:`, data.id);
          successCount++;
        }

        // Delay de 1 segundo entre inserções
        if (i < testQuestions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.log(`💥 Exceção na questão ${i + 1}:`, error.message);
      }
    }

    console.log(`\n📊 Resultado: ${successCount}/${testQuestions.length} questões inseridas com sucesso`);

    // Teste 2: Inserção em lote
    console.log('\n2️⃣ Teste: Inserção em lote...');
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert(testQuestions)
        .select();

      if (error) {
        console.log('❌ Erro na inserção em lote:', error.message);
      } else {
        console.log(`✅ Inserção em lote bem-sucedida: ${data.length} questões inseridas`);
      }
    } catch (error) {
      console.log('💥 Exceção na inserção em lote:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testBulkInsert().catch(console.error);



