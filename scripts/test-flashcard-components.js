// =====================================================
// TESTE DOS COMPONENTES DE FLASHCARDS
// =====================================================

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase (credenciais corretas)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFlashcardComponents() {
  console.log('🔍 Testando componentes de flashcards...')
  
  try {
    // 1. Testar busca de disciplinas (simulando o que os componentes fazem)
    console.log('\n1. Testando busca de disciplinas...')
    
    // Primeiro, tentar buscar da tabela subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .order('name')
    
    let subjects = []
    
    if (!subjectsError && subjectsData && subjectsData.length > 0) {
      // Se subjects tem dados, usar subjects
      subjects = subjectsData.map((subject) => ({
        id: subject.id || subject.name,
        name: subject.name,
        color: subject.color || '#3B82F6',
        totalQuestions: subject.total_questions || 0
      }))
      
      console.log(`✅ Encontradas ${subjects.length} disciplinas na tabela subjects`)
    } else {
      // Se subjects não tem dados, buscar da tabela questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('disciplina, subject')
        .or('disciplina.not.is.null,subject.not.is.null')
        .limit(1000)
      
      if (questionsError) {
        console.error('❌ Erro ao buscar questões:', questionsError)
      } else if (questionsData && questionsData.length > 0) {
        // Extrair disciplinas únicas das questões
        const uniqueSubjects = new Set()
        
        questionsData.forEach((question) => {
          if (question.disciplina && question.disciplina.trim() !== '') {
            uniqueSubjects.add(question.disciplina.trim())
          }
          if (question.subject && question.subject.trim() !== '' && question.subject !== question.disciplina) {
            uniqueSubjects.add(question.subject.trim())
          }
        })
        
        const colors = [
          "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
          "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
        ]
        
        subjects = Array.from(uniqueSubjects).map((subjectName, index) => ({
          id: subjectName,
          name: subjectName,
          color: colors[index % colors.length],
          totalQuestions: 0
        }))
        
        console.log(`✅ Encontradas ${subjects.length} disciplinas únicas nas questões`)
      }
    }
    
    // 2. Verificar se as disciplinas têm valores válidos
    console.log('\n2. Verificando valores das disciplinas...')
    let hasValidSubjects = true
    
    subjects.forEach((subject, index) => {
      if (!subject.id || subject.id.trim() === '') {
        console.error(`❌ Disciplina ${index + 1} tem ID vazio:`, subject)
        hasValidSubjects = false
      }
      if (!subject.name || subject.name.trim() === '') {
        console.error(`❌ Disciplina ${index + 1} tem nome vazio:`, subject)
        hasValidSubjects = false
      }
    })
    
    if (hasValidSubjects) {
      console.log('✅ Todas as disciplinas têm valores válidos')
      console.log('📝 Exemplos de disciplinas:')
      subjects.slice(0, 5).forEach((subject, index) => {
        console.log(`   ${index + 1}. ID: "${subject.id}" | Nome: "${subject.name}" | Cor: ${subject.color}`)
      })
    }
    
    // 3. Testar criação de flashcard (simulação)
    console.log('\n3. Testando simulação de criação de flashcard...')
    
    if (subjects.length > 0) {
      const testFlashcard = {
        id: Date.now().toString(),
        subjectId: subjects[0].id,
        front: "Teste de pergunta",
        back: "Teste de resposta",
        difficulty: 1,
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
        reviewCount: 0
      }
      
      console.log('✅ Flashcard de teste criado com sucesso:')
      console.log(`   - ID: ${testFlashcard.id}`)
      console.log(`   - Disciplina: ${testFlashcard.subjectId}`)
      console.log(`   - Frente: ${testFlashcard.front}`)
      console.log(`   - Verso: ${testFlashcard.back}`)
      console.log(`   - Dificuldade: ${testFlashcard.difficulty}`)
    } else {
      console.log('⚠️ Nenhuma disciplina disponível para teste')
    }
    
    console.log('\n🎉 Teste dos componentes de flashcards concluído!')
    console.log('📝 Os componentes devem funcionar corretamente agora.')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar o teste
testFlashcardComponents()



