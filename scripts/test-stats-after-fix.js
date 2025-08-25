const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStatsAfterFix() {
  console.log('🧪 Testando estatísticas após correção da foreign key...')
  
  try {
    // 1. Verificar todas as tentativas existentes
    console.log('\n1️⃣ Verificando todas as tentativas...')
    const { data: allAttempts, error: allAttemptsError } = await supabase
      .from('question_attempts')
      .select('*')
      .order('attempted_at', { ascending: false })
    
    if (allAttemptsError) {
      console.error('❌ Erro ao buscar tentativas:', allAttemptsError)
      return
    }
    
    console.log('📊 Total de tentativas no banco:', allAttempts?.length || 0)
    
    if (allAttempts && allAttempts.length > 0) {
      console.log('📋 Últimas 3 tentativas:')
      allAttempts.slice(0, 3).forEach((attempt, index) => {
        console.log(`  ${index + 1}. User: ${attempt.user_id}, Question: ${attempt.question_id}, Correct: ${attempt.is_correct}, Answer: ${attempt.selected_answer}`)
      })
    }
    
    // 2. Verificar tentativas do usuário específico
    console.log('\n2️⃣ Verificando tentativas do usuário luansalescontact@gmail.com...')
    const userId = '03e6e0e7-34cf-40c1-9a9d-a7192dbdcd16'
    
    const { data: userAttempts, error: userAttemptsError } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
    
    if (userAttemptsError) {
      console.error('❌ Erro ao buscar tentativas do usuário:', userAttemptsError)
      return
    }
    
    console.log('📊 Tentativas do usuário:', userAttempts?.length || 0)
    
    if (userAttempts && userAttempts.length > 0) {
      console.log('📋 Tentativas do usuário:')
      userAttempts.forEach((attempt, index) => {
        console.log(`  ${index + 1}. Question: ${attempt.question_id}, Correct: ${attempt.is_correct}, Answer: ${attempt.selected_answer}, Time: ${attempt.attempted_at}`)
      })
      
      // 3. Calcular estatísticas manualmente
      console.log('\n3️⃣ Calculando estatísticas...')
      const answeredCount = userAttempts.length
      const correctCount = userAttempts.filter(attempt => attempt.is_correct).length
      const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
      
      console.log('📊 Estatísticas calculadas:', {
        answeredCount,
        correctCount,
        accuracyRate: `${accuracyRate}%`
      })
    } else {
      console.log('❌ Nenhuma tentativa encontrada para o usuário')
    }
    
    // 4. Verificar se o usuário existe em auth.users
    console.log('\n4️⃣ Verificando se o usuário existe em auth.users...')
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError) {
      console.error('❌ Erro ao verificar usuário em auth.users:', authError)
    } else if (authUser) {
      console.log('✅ Usuário encontrado em auth.users:', {
        id: authUser.user.id,
        email: authUser.user.email
      })
    } else {
      console.log('❌ Usuário não encontrado em auth.users')
    }
    
    // 5. Verificar se o usuário existe em profiles
    console.log('\n5️⃣ Verificando se o usuário existe em profiles...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao verificar perfil:', profileError)
    } else if (profile) {
      console.log('✅ Perfil encontrado:', {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        is_admin: profile.is_admin
      })
    } else {
      console.log('❌ Perfil não encontrado')
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testStatsAfterFix()



