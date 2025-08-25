const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular a função convertQuestion do frontend
function convertQuestion(question) {
  console.log('🔄 Convertendo questão:', question);
  
  // Mapear dificuldade baseado no nível
  const difficulty = question.nivel?.toLowerCase() === 'fácil' ? 'easy' : 
                   question.nivel?.toLowerCase() === 'médio' ? 'medium' : 
                   question.nivel?.toLowerCase() === 'difícil' ? 'hard' : 'medium';
  
  // Mapear alternativa correta para número (A=0, B=1, C=2, D=3, E=4)
  const correctAnswerNumber = question.alternativaCorreta === 'A' ? 0 : 
                             question.alternativaCorreta === 'B' ? 1 : 
                             question.alternativaCorreta === 'C' ? 2 : 
                             question.alternativaCorreta === 'D' ? 3 : 
                             question.alternativaCorreta === 'E' ? 4 : 0;
  
  const convertedQuestion = {
    disciplina: question.disciplina,
    subject: question.disciplina,
    assunto: question.assunto,
    question: question.enunciado,
    enunciado: question.enunciado,
    opcao_a: question.opcaoA,
    opcao_b: question.opcaoB,
    opcao_c: question.opcaoC,
    opcao_d: question.opcaoD,
    opcao_e: question.opcaoE,
    correct_answer: correctAnswerNumber,
    difficulty: difficulty,
    nivel: question.nivel
  };

  console.log('✅ Questão convertida:', convertedQuestion);
  return convertedQuestion;
}

// Simular a função addQuestion do frontend
async function addQuestion(question) {
  console.log('=== INÍCIO addQuestion ===');
  console.log('addQuestion chamada com:', JSON.stringify(question, null, 2));
  try {
    console.log('Inserindo questão no Supabase...');
    
    // Calcular correct_answer de forma robusta (0 é válido)
    let computedCorrectAnswer = 0;
    if (typeof question.correct_answer === 'number') {
      computedCorrectAnswer = question.correct_answer;
    } else if (typeof question.alternativa_correta === 'string') {
      const alt = question.alternativa_correta.toUpperCase();
      computedCorrectAnswer = alt === 'A' ? 0 : alt === 'B' ? 1 : alt === 'C' ? 2 : alt === 'D' ? 3 : alt === 'E' ? 4 : 0;
    }

    // Preparar dados para inserção - apenas colunas que existem na tabela
    const questionData = {
      disciplina: question.disciplina || '',
      subject: question.disciplina || question.subject || '',
      assunto: question.assunto || '',
      question: question.question || question.enunciado || '',
      enunciado: question.enunciado || question.question || '',
      opcao_a: question.opcao_a || '',
      opcao_b: question.opcao_b || '',
      opcao_c: question.opcao_c || '',
      opcao_d: question.opcao_d || '',
      opcao_e: question.opcao_e || '',
      correct_answer: computedCorrectAnswer,
      difficulty: question.difficulty || 'medium',
      nivel: question.nivel || 'médio'
    };

    console.log('Dados preparados para inserção:', JSON.stringify(questionData, null, 2));
    console.log('Tentando inserir no Supabase...');

    // Verificar se todos os campos obrigatórios estão presentes
    if (!questionData.disciplina || !questionData.question) {
      throw new Error('Campos obrigatórios (disciplina e question) não podem estar vazios');
    }

    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single();

    console.log('Resposta do Supabase - data:', data);
    console.log('Resposta do Supabase - error:', error);

    if (error) {
      console.error('=== ERRO DO SUPABASE ===');
      console.error('Erro do Supabase:', error);
      console.error('Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      console.error('Dados que tentaram ser inseridos:', JSON.stringify(questionData, null, 2));
      throw error;
    }

    console.log('Questão inserida no Supabase:', data);
    console.log('=== FIM addQuestion - SUCESSO ===');
    return { success: true, data };
  } catch (error) {
    console.error('=== ERRO EM addQuestion ===');
    console.error('Erro ao adicionar questão:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Tipo do erro:', typeof error);
    console.error('Erro como string:', String(error));
    console.error('=== FIM addQuestion - ERRO ===');
    return { success: false, error };
  }
}

async function simulateFrontendImport() {
  console.log('🧪 Simulando importação do frontend...\n');

  try {
    // Simular dados de entrada (como viriam do CSV)
    const inputQuestion = {
      disciplina: 'Português',
      assunto: 'Compreensão de Texto',
      enunciado: 'Qual é a função do texto acima?',
      opcaoA: 'Informar',
      opcaoB: 'Persuadir',
      opcaoC: 'Narrar',
      opcaoD: 'Descrever',
      opcaoE: '',
      alternativaCorreta: 'A',
      nivel: 'médio'
    };

    console.log('📝 Dados de entrada:', inputQuestion);

    // Simular conversão
    const convertedQuestion = convertQuestion(inputQuestion);
    console.log('📝 Questão convertida:', convertedQuestion);

    // Simular inserção
    const result = await addQuestion(convertedQuestion);
    console.log('📝 Resultado da inserção:', result);

    if (result.success) {
      console.log('✅ Importação simulada com sucesso!');
    } else {
      console.log('❌ Erro na importação simulada:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

simulateFrontendImport().catch(console.error);




