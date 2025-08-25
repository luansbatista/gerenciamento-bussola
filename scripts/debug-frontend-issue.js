const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugFrontendIssue() {
  console.log('🔍 VARREDURA COMPLETA - Debugando problema do frontend...')
  
  try {
    // 1. Verificar se há questões com correct_answer = 0 (A)
    console.log('\n1️⃣ Verificando questões com resposta A...')
    const { data: questionsWithA, error: errorA } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .eq('correct_answer', '0')
      .limit(10)
    
    if (errorA) {
      console.error('❌ Erro ao buscar questões com A:', errorA)
    } else {
      console.log('📊 Questões com resposta A:', questionsWithA?.length || 0)
      if (questionsWithA && questionsWithA.length > 0) {
        console.log('📋 Primeiras questões com A:')
        questionsWithA.slice(0, 3).forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.question.substring(0, 50)}...`)
        })
      }
    }
    
    // 2. Verificar se há questões com correct_answer = 1 (B)
    console.log('\n2️⃣ Verificando questões com resposta B...')
    const { data: questionsWithB, error: errorB } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .eq('correct_answer', '1')
      .limit(10)
    
    if (errorB) {
      console.error('❌ Erro ao buscar questões com B:', errorB)
    } else {
      console.log('📊 Questões com resposta B:', questionsWithB?.length || 0)
      if (questionsWithB && questionsWithB.length > 0) {
        console.log('📋 Primeiras questões com B:')
        questionsWithB.slice(0, 3).forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.question.substring(0, 50)}...`)
        })
      }
    }
    
    // 3. Verificar se há questões com correct_answer = 2 (C)
    console.log('\n3️⃣ Verificando questões com resposta C...')
    const { data: questionsWithC, error: errorC } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .eq('correct_answer', '2')
      .limit(10)
    
    if (errorC) {
      console.error('❌ Erro ao buscar questões com C:', errorC)
    } else {
      console.log('📊 Questões com resposta C:', questionsWithC?.length || 0)
      if (questionsWithC && questionsWithC.length > 0) {
        console.log('📋 Primeiras questões com C:')
        questionsWithC.slice(0, 3).forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.question.substring(0, 50)}...`)
        })
      }
    }
    
    // 4. Verificar se há questões com correct_answer = 3 (D)
    console.log('\n4️⃣ Verificando questões com resposta D...')
    const { data: questionsWithD, error: errorD } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .eq('correct_answer', '3')
      .limit(10)
    
    if (errorD) {
      console.error('❌ Erro ao buscar questões com D:', errorD)
    } else {
      console.log('📊 Questões com resposta D:', questionsWithD?.length || 0)
      if (questionsWithD && questionsWithD.length > 0) {
        console.log('📋 Primeiras questões com D:')
        questionsWithD.slice(0, 3).forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.question.substring(0, 50)}...`)
        })
      }
    }
    
    // 5. Verificar se há questões com correct_answer = 4 (E)
    console.log('\n5️⃣ Verificando questões com resposta E...')
    const { data: questionsWithE, error: errorE } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .eq('correct_answer', '4')
      .limit(10)
    
    if (errorE) {
      console.error('❌ Erro ao buscar questões com E:', errorE)
    } else {
      console.log('📊 Questões com resposta E:', questionsWithE?.length || 0)
      if (questionsWithE && questionsWithE.length > 0) {
        console.log('📋 Primeiras questões com E:')
        questionsWithE.slice(0, 3).forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.question.substring(0, 50)}...`)
        })
      }
    }
    
    // 6. Verificar se há questões com correct_answer nulo ou inválido
    console.log('\n6️⃣ Verificando questões com resposta inválida...')
    const { data: questionsInvalid, error: errorInvalid } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .or('correct_answer.is.null,correct_answer.eq.,correct_answer.eq.5,correct_answer.eq.6,correct_answer.eq.7,correct_answer.eq.8,correct_answer.eq.9')
      .limit(10)
    
    if (errorInvalid) {
      console.error('❌ Erro ao buscar questões inválidas:', errorInvalid)
    } else {
      console.log('📊 Questões com resposta inválida:', questionsInvalid?.length || 0)
      if (questionsInvalid && questionsInvalid.length > 0) {
        console.log('📋 Questões inválidas:')
        questionsInvalid.forEach((q, index) => {
          console.log(`   ${index + 1}. ID: ${q.id}, correct_answer: "${q.correct_answer}"`)
        })
      }
    }
    
    // 7. Verificar se há questões com correct_answer como número
    console.log('\n7️⃣ Verificando questões com correct_answer como número...')
    const { data: questionsNumber, error: errorNumber } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .not('correct_answer', 'like', '%[^0-9]%')
      .limit(10)
    
    if (errorNumber) {
      console.error('❌ Erro ao buscar questões numéricas:', errorNumber)
    } else {
      console.log('📊 Questões com correct_answer numérico:', questionsNumber?.length || 0)
      if (questionsNumber && questionsNumber.length > 0) {
        console.log('📋 Questões numéricas:')
        questionsNumber.slice(0, 5).forEach((q, index) => {
          console.log(`   ${index + 1}. ID: ${q.id}, correct_answer: ${q.correct_answer} (${typeof q.correct_answer})`)
        })
      }
    }
    
    // 8. Verificar se há questões com correct_answer como string
    console.log('\n8️⃣ Verificando questões com correct_answer como string...')
    const { data: questionsString, error: errorString } = await supabase
      .from('questions')
      .select('id, question, correct_answer')
      .like('correct_answer', '%[^0-9]%')
      .limit(10)
    
    if (errorString) {
      console.error('❌ Erro ao buscar questões string:', errorString)
    } else {
      console.log('📊 Questões com correct_answer string:', questionsString?.length || 0)
      if (questionsString && questionsString.length > 0) {
        console.log('📋 Questões string:')
        questionsString.slice(0, 5).forEach((q, index) => {
          console.log(`   ${index + 1}. ID: ${q.id}, correct_answer: "${q.correct_answer}" (${typeof q.correct_answer})`)
        })
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

debugFrontendIssue()



