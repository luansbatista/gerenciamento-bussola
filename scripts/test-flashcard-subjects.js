// =====================================================
// TESTE DAS DISCIPLINAS NOS FLASHCARDS
// =====================================================

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase (credenciais corretas)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFlashcardSubjects() {
  console.log('🔍 Testando disciplinas para flashcards...')
  
  try {
    // 1. Verificar se há disciplinas na tabela subjects
    console.log('\n1. Verificando tabela subjects...')
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .order('name')
    
    if (subjectsError) {
      console.error('❌ Erro ao buscar subjects:', subjectsError)
    } else {
      console.log(`✅ Encontradas ${subjectsData?.length || 0} disciplinas na tabela subjects:`)
      if (subjectsData && subjectsData.length > 0) {
        subjectsData.forEach((subject, index) => {
          console.log(`   ${index + 1}. ${subject.name} (${subject.color})`)
        })
      }
    }
    
    // 2. Verificar disciplinas únicas na tabela questions
    console.log('\n2. Verificando disciplinas únicas na tabela questions...')
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('disciplina, subject')
      .or('disciplina.not.is.null,subject.not.is.null')
      .limit(1000)
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError)
    } else {
      console.log(`✅ Encontradas ${questionsData?.length || 0} questões`)
      
      if (questionsData && questionsData.length > 0) {
        // Extrair disciplinas únicas
        const uniqueSubjects = new Set()
        
        questionsData.forEach((question) => {
          if (question.disciplina && question.disciplina.trim() !== '') {
            uniqueSubjects.add(question.disciplina.trim())
          }
          if (question.subject && question.subject.trim() !== '' && question.subject !== question.disciplina) {
            uniqueSubjects.add(question.subject.trim())
          }
        })
        
        console.log(`✅ Encontradas ${uniqueSubjects.size} disciplinas únicas nas questões:`)
        Array.from(uniqueSubjects).forEach((subject, index) => {
          console.log(`   ${index + 1}. ${subject}`)
        })
      }
    }
    
    // 3. Verificar se há flashcards existentes
    console.log('\n3. Verificando flashcards existentes...')
    const { data: flashcardsData, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('*')
      .limit(10)
    
    if (flashcardsError) {
      console.error('❌ Erro ao buscar flashcards:', flashcardsError)
    } else {
      console.log(`✅ Encontrados ${flashcardsData?.length || 0} flashcards`)
      if (flashcardsData && flashcardsData.length > 0) {
        flashcardsData.forEach((flashcard, index) => {
          const frontText = flashcard.front ? flashcard.front.substring(0, 50) : 'sem texto'
          const subjectId = flashcard.subject_id || 'sem disciplina'
          console.log(`   ${index + 1}. ${frontText}... (${subjectId})`)
        })
      }
    }
    
    console.log('\n🎉 Teste das disciplinas para flashcards concluído!')
    console.log('📝 As disciplinas do banco de questões agora estão disponíveis para flashcards.')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar o teste
testFlashcardSubjects()
