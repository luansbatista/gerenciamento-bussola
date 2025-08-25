const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCorrectAnswers() {
  console.log('🧪 Verificando respostas corretas no banco...')
  
  try {
    // 1. Buscar todas as questões
    console.log('\n1️⃣ Buscando todas as questões...')
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question, correct_answer, opcao_a, opcao_b, opcao_c, opcao_d, opcao_e')
      .order('created_at', { ascending: false })
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError)
      return
    }
    
    console.log('✅ Questões encontradas:', questions?.length || 0)
    
    // 2. Analisar as respostas corretas
    console.log('\n2️⃣ Analisando respostas corretas...')
    const correctAnswerCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, invalid: 0 }
    const questionsWithIssues = []
    
    questions.forEach((question, index) => {
      let correctAnswerIndex = -1
      
      if (question.correct_answer !== null && question.correct_answer !== undefined) {
        if (typeof question.correct_answer === 'string') {
          correctAnswerIndex = parseInt(question.correct_answer, 10)
        } else {
          correctAnswerIndex = question.correct_answer
        }
      }
      
      if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex > 4) {
        correctAnswerCounts.invalid++
        questionsWithIssues.push({
          id: question.id,
          correct_answer: question.correct_answer,
          parsed: correctAnswerIndex,
          issue: 'invalid'
        })
      } else {
        correctAnswerCounts[correctAnswerIndex]++
      }
      
      // Mostrar as primeiras 10 questões para debug
      if (index < 10) {
        console.log(`📝 Questão ${index + 1}:`)
        console.log(`   ID: ${question.id}`)
        console.log(`   Pergunta: ${question.question.substring(0, 50)}...`)
        console.log(`   Resposta correta (DB): ${question.correct_answer}`)
        console.log(`   Resposta correta (parsed): ${correctAnswerIndex}`)
        console.log(`   Letra: ${String.fromCharCode(97 + correctAnswerIndex).toUpperCase()}`)
        console.log(`   Opções: A) ${question.opcao_a}, B) ${question.opcao_b}, C) ${question.opcao_c}, D) ${question.opcao_d}, E) ${question.opcao_e}`)
        console.log('')
      }
    })
    
    console.log('📊 Distribuição das respostas corretas:')
    console.log(`   A (0): ${correctAnswerCounts[0]} questões`)
    console.log(`   B (1): ${correctAnswerCounts[1]} questões`)
    console.log(`   C (2): ${correctAnswerCounts[2]} questões`)
    console.log(`   D (3): ${correctAnswerCounts[3]} questões`)
    console.log(`   E (4): ${correctAnswerCounts[4]} questões`)
    console.log(`   Inválidas: ${correctAnswerCounts.invalid} questões`)
    
    if (questionsWithIssues.length > 0) {
      console.log('\n⚠️ Questões com problemas:')
      questionsWithIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ID: ${issue.id}, Valor: ${issue.correct_answer}, Parsed: ${issue.parsed}`)
      })
    }
    
    // 3. Verificar se há muitas questões com resposta A
    if (correctAnswerCounts[0] > questions.length * 0.5) {
      console.log('\n⚠️ ALERTA: Mais de 50% das questões têm resposta A!')
      console.log('Isso pode indicar um problema na importação ou nos dados.')
    }
    
    // 4. Verificar questões específicas que sabemos que deveriam ter outras respostas
    console.log('\n3️⃣ Verificando questões específicas...')
    const specificQuestions = questions.filter(q => 
      q.question.includes('crase') || 
      q.question.includes('concordância') || 
      q.question.includes('vocativo')
    )
    
    if (specificQuestions.length > 0) {
      console.log('📋 Questões específicas encontradas:')
      specificQuestions.forEach((q, index) => {
        let correctAnswerIndex = -1
        if (q.correct_answer !== null && q.correct_answer !== undefined) {
          if (typeof q.correct_answer === 'string') {
            correctAnswerIndex = parseInt(q.correct_answer, 10)
          } else {
            correctAnswerIndex = q.correct_answer
          }
        }
        
        console.log(`   ${index + 1}. ${q.question.substring(0, 50)}...`)
        console.log(`      Resposta correta: ${correctAnswerIndex} (${String.fromCharCode(97 + correctAnswerIndex).toUpperCase()})`)
      })
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

checkCorrectAnswers()



