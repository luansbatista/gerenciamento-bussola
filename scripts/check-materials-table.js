const { createClient } = require('@supabase/supabase-js')

// Usar as variáveis diretamente (copiadas do .env.local)
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMaterialsTable() {
  console.log('🔍 Verificando estrutura da tabela materials...')
  
  try {
    // 1. Verificar se a tabela existe e é acessível
    console.log('\n1️⃣ Verificando acesso à tabela materials...')
    const { data: testData, error: testError } = await supabase
      .from('materials')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro ao acessar tabela materials:', testError)
      return
    }
    
    console.log('✅ Tabela materials acessível')

    // 2. Verificar estrutura da tabela
    console.log('\n2️⃣ Verificando estrutura da tabela...')
    const { data: structureData, error: structureError } = await supabase
      .from('materials')
      .select('*')
      .limit(1)
    
    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError)
      return
    }
    
    if (structureData && structureData.length > 0) {
      console.log('📋 Estrutura da tabela:')
      const columns = Object.keys(structureData[0])
      columns.forEach(column => {
        console.log(`   - ${column}: ${typeof structureData[0][column]}`)
      })
    }

    // 3. Verificar materiais existentes
    console.log('\n3️⃣ Verificando materiais existentes...')
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (materialsError) {
      console.error('❌ Erro ao buscar materiais:', materialsError)
      return
    }
    
    console.log(`📊 Total de materiais: ${materials?.length || 0}`)
    
    if (materials && materials.length > 0) {
      console.log('📋 Primeiros 3 materiais:')
      materials.slice(0, 3).forEach((material, index) => {
        console.log(`   ${index + 1}. ${material.title} (${material.subject})`)
      })
    }

    // 4. Verificar se há políticas RLS
    console.log('\n4️⃣ Verificando políticas de segurança...')
    console.log('ℹ️ Para verificar políticas RLS, execute no SQL Editor do Supabase:')
    console.log('   SELECT * FROM pg_policies WHERE tablename = \'materials\';')
    console.log('   SELECT * FROM pg_tables WHERE tablename = \'materials\';')

    // 5. Testar inserção (apenas para verificar permissões)
    console.log('\n5️⃣ Testando permissões de inserção...')
    const testMaterial = {
      title: 'Teste de Permissão',
      description: 'Material de teste para verificar permissões',
      subject: 'Teste',
      file_url: 'https://example.com/test.pdf',
      file_type: 'pdf',
      created_by: '00000000-0000-0000-0000-000000000000' // ID fictício
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('materials')
      .insert(testMaterial)
      .select()
    
    if (insertError) {
      console.log('❌ Erro na inserção (esperado se não for admin):', {
        code: insertError.code,
        message: insertError.message
      })
    } else {
      console.log('✅ Inserção bem-sucedida (usuário tem permissão)')
      
      // Remover o material de teste
      if (insertData && insertData.length > 0) {
        const { error: deleteError } = await supabase
          .from('materials')
          .delete()
          .eq('id', insertData[0].id)
        
        if (deleteError) {
          console.log('⚠️ Erro ao remover material de teste:', deleteError.message)
        } else {
          console.log('✅ Material de teste removido')
        }
      }
    }

  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

checkMaterialsTable()
