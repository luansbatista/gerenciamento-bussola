const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDashboardSync() {
  console.log('🔍 Testando sincronização do dashboard...')
  
  try {
    // 1. Verificar questões disponíveis
    console.log('\n1️⃣ Verificando questões disponíveis...')
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question, subject, disciplina')
      .limit(5)
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError)
      return
    }
    
    console.log(`📊 Questões encontradas: ${questions?.length || 0}`)
    if (questions && questions.length > 0) {
      console.log('📋 Primeiras questões:')
      questions.forEach((q, index) => {
        console.log(`   ${index + 1}. ${q.question.substring(0, 50)}... (${q.subject || q.disciplina})`)
      })
    }

    // 2. Verificar tentativas de questões
    console.log('\n2️⃣ Verificando tentativas de questões...')
    const { data: attempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('*')
      .order('attempted_at', { ascending: false })
      .limit(10)
    
    if (attemptsError) {
      console.error('❌ Erro ao buscar tentativas:', attemptsError)
      return
    }
    
    console.log(`📊 Tentativas encontradas: ${attempts?.length || 0}`)
    if (attempts && attempts.length > 0) {
      console.log('📋 Últimas tentativas:')
      attempts.slice(0, 3).forEach((attempt, index) => {
        console.log(`   ${index + 1}. User: ${attempt.user_id}, Correct: ${attempt.is_correct}, Time: ${attempt.attempted_at}`)
      })
    }

    // 3. Verificar usuários/profis
    console.log('\n3️⃣ Verificando usuários...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError)
      return
    }
    
    console.log(`📊 Perfis encontrados: ${profiles?.length || 0}`)
    if (profiles && profiles.length > 0) {
      console.log('📋 Perfis:')
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name || profile.email} (${profile.role})`)
      })
    }

    // 4. Calcular estatísticas semanais
    console.log('\n4️⃣ Calculando estatísticas semanais...')
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: weeklyAttempts, error: weeklyError } = await supabase
      .from('question_attempts')
      .select('*')
      .gte('attempted_at', oneWeekAgo)
    
    if (weeklyError) {
      console.error('❌ Erro ao buscar tentativas semanais:', weeklyError)
      return
    }
    
    const totalQuestions = weeklyAttempts?.length || 0
    const correctAnswers = weeklyAttempts?.filter(a => a.is_correct).length || 0
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    
    console.log('📊 Estatísticas semanais:')
    console.log(`   - Total de questões: ${totalQuestions}`)
    console.log(`   - Acertos: ${correctAnswers}`)
    console.log(`   - Taxa de acerto: ${Math.round(accuracy)}%`)

    // 5. Verificar materiais
    console.log('\n5️⃣ Verificando materiais...')
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .limit(5)
    
    if (materialsError) {
      console.error('❌ Erro ao buscar materiais:', materialsError)
      return
    }
    
    console.log(`📊 Materiais encontrados: ${materials?.length || 0}`)
    if (materials && materials.length > 0) {
      console.log('📋 Materiais:')
      materials.forEach((material, index) => {
        console.log(`   ${index + 1}. ${material.title} (${material.subject})`)
      })
    }

    console.log('\n✅ Teste de sincronização concluído!')
    console.log('💡 Se os dados estão aqui mas não aparecem no frontend, pode ser um problema de:')
    console.log('   - Autenticação do usuário')
    console.log('   - Contextos não sendo inicializados corretamente')
    console.log('   - Problemas de timing na carga dos dados')

  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testDashboardSync()
