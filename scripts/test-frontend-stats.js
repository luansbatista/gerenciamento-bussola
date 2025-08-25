const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFrontendStats() {
  console.log('🧪 Testando exatamente o que o frontend faz...')
  
  const userId = '03e6e0e7-34cf-40c1-9a9d-a7192dbdcd16'
  
  try {
    // 1. Simular fetchStatsFromDB do frontend
    console.log('\n1️⃣ Simulando fetchStatsFromDB...')
    console.log('👤 User ID:', userId)
    
    console.log('📊 Fazendo query no banco...')
    console.log('🔍 Query: SELECT is_correct FROM question_attempts WHERE user_id =', userId)
    
    const { data, error } = await supabase
      .from('question_attempts')
      .select('is_correct')
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Erro na query:', error)
      console.error('📋 Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return
    }

    console.log('📊 Dados recebidos:', data?.length || 0, 'tentativas')
    console.log('📋 Dados brutos:', data)

    if (data && Array.isArray(data)) {
      const answeredCount = data.length
      const correctCount = data.filter(attempt => attempt.is_correct).length
      const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
      
      console.log('📊 Estatísticas calculadas:', {
        answeredCount,
        correctCount,
        accuracyRate
      })
      
      console.log('✅ Simulação do frontend funcionou corretamente')
    } else {
      console.log('📊 Nenhum dado encontrado')
      console.log('📋 Tipo de data:', typeof data)
      console.log('📋 É array?', Array.isArray(data))
    }
    
    // 2. Simular fetchUserAttempts do frontend
    console.log('\n2️⃣ Simulando fetchUserAttempts...')
    
    const { data: attemptsData, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('question_id, selected_answer, is_correct')
      .eq('user_id', userId)

    if (attemptsError) {
      console.error('❌ Erro ao buscar tentativas:', attemptsError)
      return
    }

    console.log('📊 Tentativas encontradas:', attemptsData?.length || 0)
    
    if (attemptsData && Array.isArray(attemptsData)) {
      const attemptsMap = {}
      attemptsData.forEach(attempt => {
        // Converter selected_answer de string para número (a=0, b=1, c=2, d=3, e=4)
        const answerStr = String(attempt.selected_answer || '').toLowerCase()
        const answerNumber = answerStr === 'a' ? 0 : 
                            answerStr === 'b' ? 1 : 
                            answerStr === 'c' ? 2 : 
                            answerStr === 'd' ? 3 : 
                            answerStr === 'e' ? 4 : 
                            parseInt(answerStr) || 0
        attemptsMap[attempt.question_id] = answerNumber
      })
      
      console.log('📋 Mapa de tentativas:', attemptsMap)
      console.log('✅ Simulação do fetchUserAttempts funcionou corretamente')
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testFrontendStats()



