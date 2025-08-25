const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuestionMapping() {
  console.log('🧪 Testando mapeamento das questões...')
  
  try {
    // Buscar algumas questões do banco
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(10)
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError)
      return
    }
    
    console.log('✅ Questões encontradas:', questionsData?.length || 0)
    
    // Simular o mapeamento que o frontend faz
    const mappedQuestions = questionsData.map((q) => {
      // O banco já armazena números (0, 1, 2, 3, 4), não letras
      let correctAnswerNumber = 0
      
      if (q.correct_answer !== null && q.correct_answer !== undefined) {
        if (typeof q.correct_answer === 'string') {
          // Se for string, tentar converter para número
          const parsed = parseInt(q.correct_answer, 10)
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 4) {
            correctAnswerNumber = parsed
          }
        } else if (typeof q.correct_answer === 'number') {
          // Se já for número, usar diretamente
          if (q.correct_answer >= 0 && q.correct_answer <= 4) {
            correctAnswerNumber = q.correct_answer
          }
        }
      }

      const correctLetter = String.fromCharCode(97 + correctAnswerNumber).toUpperCase()
      
      return {
        id: q.id,
        question: q.question.substring(0, 50) + '...',
        correct_answer_original: q.correct_answer,
        tipo_original: typeof q.correct_answer,
        correctAnswerNumber,
        correctLetter
      }
    })
    
    console.log('\n📋 Resultado do mapeamento:')
    mappedQuestions.forEach((q, index) => {
      console.log(`${index + 1}. ID: ${q.id}`)
      console.log(`   Questão: ${q.question}`)
      console.log(`   correct_answer (DB): ${q.correct_answer_original} (${q.tipo_original})`)
      console.log(`   correctAnswerNumber: ${q.correctAnswerNumber}`)
      console.log(`   Letra correta: ${q.correctLetter}`)
      console.log('')
    })
    
    // Verificar distribuição
    const distribution = {}
    mappedQuestions.forEach(q => {
      const letter = q.correctLetter
      distribution[letter] = (distribution[letter] || 0) + 1
    })
    
    console.log('📊 Distribuição das respostas corretas:')
    Object.entries(distribution).forEach(([letter, count]) => {
      console.log(`   ${letter}: ${count} questões`)
    })
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testQuestionMapping()



