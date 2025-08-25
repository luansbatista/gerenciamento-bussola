// =====================================================
// TESTE DOS CAMPOS DE COMENTÁRIOS
// =====================================================

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase (credenciais corretas)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCommentsFields() {
  console.log('🔍 Testando campos de comentários...')
  
  try {
    // 1. Testar inserção de questão com comentários
    console.log('\n1. Testando inserção de questão com comentários...')
    const testQuestion = {
      disciplina: 'Teste',
      assunto: 'Teste de Comentários',
      enunciado: 'Esta é uma questão de teste para verificar os campos de comentários.',
      opcao_a: 'Opção A',
      opcao_b: 'Opção B',
      opcao_c: 'Opção C',
      opcao_d: 'Opção D',
      correct_answer: 0,
      difficulty: 'medium',
      nivel: 'médio',
      comentario: 'Este é um comentário explicativo da questão de teste.',
      explanation: 'Esta é uma explicação detalhada da resposta correta.'
    }
    
    const { data: insertedQuestion, error: insertError } = await supabase
      .from('questions')
      .insert(testQuestion)
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir questão de teste:', insertError)
      console.log('💡 Isso pode indicar que os campos de comentários não foram adicionados ainda.')
      return
    }
    
    console.log('✅ Questão de teste inserida com sucesso:')
    console.log('   - ID:', insertedQuestion[0].id)
    console.log('   - Comentário:', insertedQuestion[0].comentario)
    console.log('   - Explicação:', insertedQuestion[0].explanation)
    
    // 2. Testar busca de questões com comentários
    console.log('\n2. Testando busca de questões com comentários...')
    const { data: questionsWithComments, error: selectError } = await supabase
      .from('questions')
      .select('id, disciplina, enunciado, comentario, explanation')
      .not('comentario', 'is', null)
      .limit(5)
    
    if (selectError) {
      console.error('❌ Erro ao buscar questões com comentários:', selectError)
      return
    }
    
    console.log(`✅ Encontradas ${questionsWithComments.length} questões com comentários:`)
    questionsWithComments.forEach((q, index) => {
      console.log(`   ${index + 1}. ${q.disciplina} - ${q.comentario?.substring(0, 50)}...`)
    })
    
    // 3. Limpar questão de teste
    console.log('\n3. Limpando questão de teste...')
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', insertedQuestion[0].id)
    
    if (deleteError) {
      console.error('❌ Erro ao deletar questão de teste:', deleteError)
    } else {
      console.log('✅ Questão de teste removida com sucesso')
    }
    
    console.log('\n🎉 Teste dos campos de comentários concluído com sucesso!')
    console.log('📝 Os campos de comentários estão funcionando corretamente.')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar o teste
testCommentsFields()
