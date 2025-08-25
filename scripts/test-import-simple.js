const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImport() {
  console.log('🧪 Testando importação de questão...\n');

  try {
    // Questão de teste baseada na estrutura real da tabela
    const testQuestion = {
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
      correct_answer: 0, // A
      difficulty: 'medium',
      nivel: 'médio'
    };

    console.log('📝 Inserindo questão de teste:', testQuestion);

    const { data, error } = await supabase
      .from('questions')
      .insert([testQuestion])
      .select()
      .single();

    if (error) {
      console.log('❌ Erro ao inserir questão:', error.message);
      console.log('Detalhes:', {
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Questão inserida com sucesso!');
      console.log('📋 Questão inserida:', data);
    }

    // Verificar questões existentes
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('id, disciplina, assunto, question')
      .limit(5);
    
    if (fetchError) {
      console.log('❌ Erro ao buscar questões:', fetchError.message);
    } else {
      console.log('✅ Total de questões no banco:', questions?.length || 0);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testImport().catch(console.error);
