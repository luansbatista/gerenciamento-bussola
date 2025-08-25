const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAnswerLogic() {
  console.log('🧪 Testando lógica de comparação de respostas...')
  
  try {
    // 1. Buscar algumas questões para testar
    console.log('\n1️⃣ Buscando questões para teste...')
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question, correct_answer, opcao_a, opcao_b, opcao_c, opcao_d, opcao_e')
      .limit(5)
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError)
      return
    }
    
    console.log('✅ Questões encontradas:', questions?.length || 0)
    
    // 2. Testar a lógica de comparação para cada questão
    questions.forEach((question, index) => {
      console.log(`\n📝 Testando questão ${index + 1}:`)
      console.log(`   ID: ${question.id}`)
      console.log(`   Pergunta: ${question.question.substring(0, 50)}...`)
      console.log(`   Resposta correta (DB): ${question.correct_answer}`)
      console.log(`   Opções: A) ${question.opcao_a}, B) ${question.opcao_b}, C) ${question.opcao_c}, D) ${question.opcao_d}, E) ${question.opcao_e}`)
      
      // Simular a lógica do frontend
      let correctAnswerIndex = -1;
      
      if (question.correct_answer !== null && question.correct_answer !== undefined) {
        if (typeof question.correct_answer === 'string') {
          correctAnswerIndex = parseInt(question.correct_answer, 10);
        } else {
          correctAnswerIndex = question.correct_answer;
        }
      }
      
      // Garantir que correctAnswerIndex seja um número válido
      if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex > 4) {
        console.log(`   ❌ Resposta correta inválida: ${correctAnswerIndex}`)
        correctAnswerIndex = 0; // Fallback para A
      }
      
      console.log(`   Resposta correta (parsed): ${correctAnswerIndex}`)
      console.log(`   Letra correta: ${String.fromCharCode(97 + correctAnswerIndex).toUpperCase()}`)
      
      // Testar todas as respostas possíveis
      for (let selectedAnswer = 0; selectedAnswer <= 4; selectedAnswer++) {
        const isCorrect = selectedAnswer === correctAnswerIndex;
        const answerLetter = String.fromCharCode(97 + selectedAnswer).toUpperCase();
        console.log(`   Resposta ${answerLetter} (${selectedAnswer}): ${isCorrect ? '✅ CORRETA' : '❌ INCORRETA'}`)
      }
    })
    
    // 3. Verificar tentativas existentes
    console.log('\n2️⃣ Verificando tentativas existentes...')
    const userId = '03e6e0e7-34cf-40c1-9a9d-a7192dbdcd16'
    
    const { data: attempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('question_id, selected_answer, is_correct')
      .eq('user_id', userId)
      .limit(5)
    
    if (attemptsError) {
      console.error('❌ Erro ao buscar tentativas:', attemptsError)
      return
    }
    
    console.log('📊 Tentativas encontradas:', attempts?.length || 0)
    
    attempts.forEach((attempt, index) => {
      console.log(`\n📋 Tentativa ${index + 1}:`)
      console.log(`   Questão ID: ${attempt.question_id}`)
      console.log(`   Resposta selecionada: ${attempt.selected_answer}`)
      console.log(`   Está correta: ${attempt.is_correct}`)
      
      // Buscar a questão correspondente
      const question = questions.find(q => q.id === attempt.question_id)
      if (question) {
        console.log(`   Questão: ${question.question.substring(0, 50)}...`)
        console.log(`   Resposta correta (DB): ${question.correct_answer}`)
        
        // Verificar se a lógica está correta
        let correctAnswerIndex = -1;
        if (question.correct_answer !== null && question.correct_answer !== undefined) {
          if (typeof question.correct_answer === 'string') {
            correctAnswerIndex = parseInt(question.correct_answer, 10);
          } else {
            correctAnswerIndex = question.correct_answer;
          }
        }
        
        if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex > 4) {
          correctAnswerIndex = 0;
        }
        
        const correctLetter = String.fromCharCode(97 + correctAnswerIndex).toUpperCase();
        console.log(`   Resposta correta (calculada): ${correctLetter} (${correctAnswerIndex})`)
        console.log(`   Resposta selecionada: ${attempt.selected_answer}`)
        console.log(`   Deveria estar correta: ${attempt.selected_answer === correctLetter}`)
        console.log(`   Está correta no DB: ${attempt.is_correct}`)
        
        if ((attempt.selected_answer === correctLetter) !== attempt.is_correct) {
          console.log(`   ⚠️ INCONSISTÊNCIA DETECTADA!`)
        }
      }
    })
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testAnswerLogic()



