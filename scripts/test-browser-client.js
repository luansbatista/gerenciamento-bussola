const { createBrowserClient } = require('@supabase/ssr');

// Simular as variáveis de ambiente do frontend
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://zghneimasvhimrzbwtrv.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

async function testBrowserClient() {
  console.log('🧪 Testando cliente Supabase do frontend...\n');

  try {
    // Criar cliente como no frontend
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('🔧 Configurações:');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Presente' : 'Ausente');
    console.log('');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL e Key são obrigatórios');
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase criado com sucesso');
    console.log('');

    // Testar inserção com os mesmos dados que falharam no frontend
    const questionData = {
      disciplina: 'Português',
      subject: 'Português',
      assunto: 'Compreensão de Texto',
      question: 'Qual é a função do texto acima?',
      enunciado: 'Qual é a função do texto acima?',
      opcao_a: 'Informar',
      opcao_b: 'Persuadir',
      opcao_c: 'Narrar',
      opcao_d: 'Descrever',
      opcao_e: '',
      correct_answer: 0,
      difficulty: 'medium',
      nivel: 'médio'
    };

    console.log('📝 Tentando inserir com cliente do frontend:', JSON.stringify(questionData, null, 2));

    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single();

    if (error) {
      console.log('❌ Erro com cliente do frontend:', error.message);
      console.log('Detalhes:', {
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Inserção com cliente do frontend funcionou:', data);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBrowserClient().catch(console.error);




