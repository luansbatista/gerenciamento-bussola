const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAnswerInsertion() {
  console.log('🧪 Testando inserção de respostas...')
  
  try {
    // 1. Verificar se o usuário existe
    console.log('\n1️⃣ Verificando usuário...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Erro ao obter usuário:', authError)
      return
    }
    
    if (!user) {
      console.error('❌ Usuário não autenticado')
      return
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email
    })
    
    // 2. Verificar se existe uma questão para testar
    console.log('\n2️⃣ Buscando questões disponíveis...')
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .limit(1)
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError)
      return
    }
    
    if (!questions || questions.length === 0) {
      console.error('❌ Nenhuma questão encontrada')
      return
    }
    
    const testQuestion = questions[0]
    console.log('✅ Questão encontrada:', {
      id: testQuestion.id,
      question: testQuestion.question.substring(0, 50) + '...',
      correct_answer: testQuestion.correct_answer
    })
    
    // 3. Verificar se já existe uma tentativa para esta questão
    console.log('\n3️⃣ Verificando tentativas existentes...')
    const { data: existingAttempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('question_id', testQuestion.id)
      .eq('user_id', user.id)
    
    if (attemptsError) {
      console.error('❌ Erro ao verificar tentativas:', attemptsError)
      return
    }
    
    console.log('📊 Tentativas existentes:', existingAttempts?.length || 0)
    
    // 4. Tentar inserir uma nova resposta
    console.log('\n4️⃣ Tentando inserir nova resposta...')
    const now = new Date()
    const testData = {
      question_id: testQuestion.id,
      user_id: user.id,
      selected_answer: 'A',
      is_correct: false,
      attempted_at: now.toISOString(),
      time_spent: 0
    }
    
    console.log('📝 Dados para inserção:', JSON.stringify(testData, null, 2))
    
    const { data: insertData, error: insertError } = await supabase
      .from('question_attempts')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.error('❌ Erro na inserção:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      
      // Se for erro de duplicata, tentar atualizar
      if (insertError.code === '23505' || insertError.code === '409') {
        console.log('🔄 Tentando atualizar resposta existente...')
        
        const { error: updateError } = await supabase
          .from('question_attempts')
          .update({
            selected_answer: 'B',
            is_correct: true,
            attempted_at: now.toISOString(),
            time_spent: 0
          })
          .eq('question_id', testQuestion.id)
          .eq('user_id', user.id)
        
        if (updateError) {
          console.error('❌ Erro na atualização:', updateError)
        } else {
          console.log('✅ Resposta atualizada com sucesso')
        }
      }
    } else {
      console.log('✅ Resposta inserida com sucesso:', insertData)
    }
    
    // 5. Verificar resultado final
    console.log('\n5️⃣ Verificando resultado final...')
    const { data: finalAttempts, error: finalError } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('question_id', testQuestion.id)
      .eq('user_id', user.id)
    
    if (finalError) {
      console.error('❌ Erro ao verificar resultado:', finalError)
    } else {
      console.log('📊 Tentativas finais:', finalAttempts?.length || 0)
      if (finalAttempts && finalAttempts.length > 0) {
        console.log('📋 Última tentativa:', finalAttempts[finalAttempts.length - 1])
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testAnswerInsertion()
