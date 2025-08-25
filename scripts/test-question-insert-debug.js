const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuestionInsert() {
  console.log('🧪 Testando inserção de questão com debug...\n');

  try {
    // Simular os dados que estão sendo enviados pelo frontend
    const questionData = {
      disciplina: 'Português',
      subject: 'Português',
      assunto: 'Compreensão de Texto',
      question: 'Qual é a função do texto acima?',
      enunciado: 'Qual é a função do texto acima?',
      opcao_a: 'Informar',
      opcao_b: 'Persuadir',
      opcao_c: 'Narrar',
      opcao_d: 'Descrever',
      opcao_e: '',
      correct_answer: 0,
      difficulty: 'medium',
      nivel: 'médio'
    };

    console.log('📝 Dados que serão inseridos:', JSON.stringify(questionData, null, 2));

    // Verificar estrutura da tabela primeiro
    console.log('\n1️⃣ Verificando estrutura da tabela questions...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('questions')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao verificar tabela:', tableError.message);
      console.log('Detalhes:', {
        code: tableError.code,
        details: tableError.details,
        hint: tableError.hint
      });
    } else {
      console.log('✅ Tabela acessível');
      if (tableInfo && tableInfo.length > 0) {
        console.log('📋 Exemplo de dados na tabela:', Object.keys(tableInfo[0]));
      }
    }

    // Tentar inserção
    console.log('\n2️⃣ Tentando inserir questão...');
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single();

    if (error) {
      console.log('❌ Erro na inserção:', error.message);
      console.log('Detalhes completos:', {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message
      });
      
      // Tentar inserção com menos campos para identificar o problema
      console.log('\n3️⃣ Tentando inserção mínima...');
      const minimalData = {
        disciplina: 'Português',
        question: 'Teste simples',
        opcao_a: 'A',
        opcao_b: 'B',
        opcao_c: 'C',
        opcao_d: 'D',
        correct_answer: 0
      };
      
      const { data: minData, error: minError } = await supabase
        .from('questions')
        .insert([minimalData])
        .select()
        .single();

      if (minError) {
        console.log('❌ Erro na inserção mínima:', minError.message);
        console.log('Detalhes:', {
          code: minError.code,
          details: minError.details,
          hint: minError.hint
        });
      } else {
        console.log('✅ Inserção mínima funcionou:', minData);
      }
    } else {
      console.log('✅ Questão inserida com sucesso:', data);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

testQuestionInsert().catch(console.error);




