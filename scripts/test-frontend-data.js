const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFrontendData() {
  console.log('🧪 Testando dados que o frontend está recebendo...')
  
  try {
    // 1. Simular a query exata que o frontend faz
    console.log('\n1️⃣ Simulando query do frontend...')
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(10)
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError)
      return
    }
    
    console.log('✅ Questões encontradas:', questions?.length || 0)
    
    // 2. Simular a lógica exata do frontend
    console.log('\n2️⃣ Simulando lógica do frontend...')
    questions.forEach((question, index) => {
      console.log(`\n📝 Questão ${index + 1}:`)
      console.log(`   ID: ${question.id}`)
      console.log(`   Pergunta: ${question.question.substring(0, 50)}...`)
      console.log(`   correct_answer (DB): ${question.correct_answer}`)
      console.log(`   Tipo: ${typeof question.correct_answer}`)
      
      // Simular exatamente a lógica do frontend
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
      
      console.log(`   correctAnswerIndex (parsed): ${correctAnswerIndex}`)
      console.log(`   Letra correta: ${String.fromCharCode(97 + correctAnswerIndex).toUpperCase()}`)
      
      // Simular a lógica do QuestionCard
      const options = []
      if (question.opcao_a && question.opcao_a.trim()) options.push(question.opcao_a)
      if (question.opcao_b && question.opcao_b.trim()) options.push(question.opcao_b)
      if (question.opcao_c && question.opcao_c.trim()) options.push(question.opcao_c)
      if (question.opcao_d && question.opcao_d.trim()) options.push(question.opcao_d)
      if (question.opcao_e && question.opcao_e.trim()) options.push(question.opcao_e)
      
      console.log(`   Opções encontradas: ${options.length}`)
      
      // Testar cada opção
      options.forEach((option, optionIndex) => {
        const isCorrect = optionIndex === correctAnswerIndex
        const letter = String.fromCharCode(65 + optionIndex)
        console.log(`   ${letter}) ${option.substring(0, 30)}... - ${isCorrect ? '✅ CORRETA' : '❌ INCORRETA'}`)
      })
    })
    
    // 3. Verificar se há problemas com o cache
    console.log('\n3️⃣ Verificando se há problemas de cache...')
    
    // Fazer a mesma query novamente para ver se os dados mudam
    const { data: questions2, error: questionsError2 } = await supabase
      .from('questions')
      .select('*')
      .limit(5)
    
    if (questionsError2) {
      console.error('❌ Erro na segunda query:', questionsError2)
      return
    }
    
    console.log('✅ Segunda query realizada com sucesso')
    
    // Comparar os dados
    const hasChanged = JSON.stringify(questions.slice(0, 5)) !== JSON.stringify(questions2)
    console.log(`📊 Dados mudaram entre queries: ${hasChanged ? 'SIM' : 'NÃO'}`)
    
    if (!hasChanged) {
      console.log('⚠️ Dados idênticos - pode ser cache do Supabase')
    }
    
    // 4. Verificar se há problemas com RLS
    console.log('\n4️⃣ Verificando RLS...')
    
    // Tentar buscar uma questão específica
    const testQuestionId = questions[0]?.id
    if (testQuestionId) {
      const { data: singleQuestion, error: singleError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', testQuestionId)
        .single()
      
      if (singleError) {
        console.error('❌ Erro ao buscar questão única:', singleError)
      } else {
        console.log('✅ Questão única encontrada:', {
          id: singleQuestion.id,
          correct_answer: singleQuestion.correct_answer,
          parsed: parseInt(singleQuestion.correct_answer, 10)
        })
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testFrontendData()



