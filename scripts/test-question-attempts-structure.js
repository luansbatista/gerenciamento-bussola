const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuestionAttemptsStructure() {
  console.log('🧪 Testando estrutura da tabela question_attempts...')
  
  try {
    // 1. Verificar se a tabela existe e sua estrutura
    console.log('\n1️⃣ Verificando estrutura da tabela...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('question_attempts')
      .select('*')
      .limit(0)
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela question_attempts:', {
        code: tableError.code,
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint
      })
      return
    }
    
    console.log('✅ Tabela question_attempts acessível')
    
    // 2. Verificar se existem questões
    console.log('\n2️⃣ Verificando questões disponíveis...')
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question')
      .limit(5)
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError)
      return
    }
    
    console.log('✅ Questões encontradas:', questions?.length || 0)
    if (questions && questions.length > 0) {
      console.log('📋 Primeira questão:', {
        id: questions[0].id,
        question: questions[0].question.substring(0, 50) + '...'
      })
    }
    
    // 3. Verificar se existem tentativas
    console.log('\n3️⃣ Verificando tentativas existentes...')
    const { data: attempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('*')
      .limit(5)
    
    if (attemptsError) {
      console.error('❌ Erro ao buscar tentativas:', attemptsError)
      return
    }
    
    console.log('✅ Tentativas encontradas:', attempts?.length || 0)
    if (attempts && attempts.length > 0) {
      console.log('📋 Primeira tentativa:', attempts[0])
    }
    
    // 4. Verificar se existem usuários
    console.log('\n4️⃣ Verificando usuários...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, is_admin')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError)
      return
    }
    
    console.log('✅ Perfis encontrados:', profiles?.length || 0)
    if (profiles && profiles.length > 0) {
      console.log('📋 Primeiro perfil:', {
        id: profiles[0].id,
        email: profiles[0].email,
        role: profiles[0].role,
        is_admin: profiles[0].is_admin
      })
    }
    
    // 5. Testar inserção com dados fictícios (deve falhar por RLS)
    console.log('\n5️⃣ Testando inserção com dados fictícios...')
    const testData = {
      question_id: questions?.[0]?.id || '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      selected_answer: 'A',
      is_correct: false,
      attempted_at: new Date().toISOString(),
      time_spent: 0
    }
    
    console.log('📝 Dados para teste:', JSON.stringify(testData, null, 2))
    
    const { data: insertData, error: insertError } = await supabase
      .from('question_attempts')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.error('❌ Erro na inserção (esperado):', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      
      if (insertError.code === '42501') {
        console.log('✅ RLS está funcionando - acesso negado como esperado')
      } else if (insertError.code === '23503') {
        console.log('✅ Foreign key constraint funcionando - usuário não existe')
      }
    } else {
      console.log('⚠️ Inserção funcionou (RLS pode estar desabilitado):', insertData)
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testQuestionAttemptsStructure()




