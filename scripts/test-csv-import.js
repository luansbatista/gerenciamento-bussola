const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para parsear linha CSV (simplificada)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Função para converter CSV para JSON (baseada no componente real)
function convertCSVToJson(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error("CSV deve ter pelo menos um cabeçalho e uma linha de dados");
  }

  // Extrair cabeçalhos
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Verificar se os cabeçalhos estão corretos
  const requiredHeaders = ['disciplina', 'assunto', 'enunciado', 'opcaoA', 'opcaoB', 'opcaoC', 'opcaoD', 'alternativaCorreta', 'nivel'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Cabeçalhos obrigatórios não encontrados: ${missingHeaders.join(', ')}`);
  }

  const questions = [];

  // Processar linhas de dados
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;

    const question = {
      disciplina: values[headers.indexOf('disciplina')] || '',
      assunto: values[headers.indexOf('assunto')] || '',
      enunciado: values[headers.indexOf('enunciado')] || '',
      opcaoA: values[headers.indexOf('opcaoA')] || '',
      opcaoB: values[headers.indexOf('opcaoB')] || '',
      opcaoC: values[headers.indexOf('opcaoC')] || '',
      opcaoD: values[headers.indexOf('opcaoD')] || '',
      opcaoE: values[headers.indexOf('opcaoE')] || '',
      alternativaCorreta: values[headers.indexOf('alternativaCorreta')] || '',
      nivel: values[headers.indexOf('nivel')] || 'médio'
    };

    questions.push(question);
  }

  return questions;
}

// Função para converter questão para formato do banco
function convertQuestion(question) {
  console.log('🔄 Convertendo questão:', question);
  
  // Mapear dificuldade baseado no nível
  const difficulty = question.nivel?.toLowerCase() === 'fácil' ? 'easy' : 
                   question.nivel?.toLowerCase() === 'médio' ? 'medium' : 
                   question.nivel?.toLowerCase() === 'difícil' ? 'hard' : 'medium';
  
  // Mapear alternativa correta para número (A=0, B=1, C=2, D=3, E=4)
  const correctAnswerNumber = question.alternativaCorreta === 'A' ? 0 : 
                             question.alternativaCorreta === 'B' ? 1 : 
                             question.alternativaCorreta === 'C' ? 2 : 
                             question.alternativaCorreta === 'D' ? 3 : 
                             question.alternativaCorreta === 'E' ? 4 : 0;
  
  const convertedQuestion = {
    disciplina: question.disciplina,
    subject: question.disciplina,
    assunto: question.assunto,
    question: question.enunciado,
    enunciado: question.enunciado,
    opcao_a: question.opcaoA,
    opcao_b: question.opcaoB,
    opcao_c: question.opcaoC,
    opcao_d: question.opcaoD,
    opcao_e: question.opcaoE,
    correct_answer: correctAnswerNumber,
    difficulty: difficulty,
    nivel: question.nivel
  };

  console.log('✅ Questão convertida:', convertedQuestion);
  return convertedQuestion;
}

async function testCSVImport() {
  console.log('🧪 Testando importação de CSV...\n');

  try {
    // Ler arquivo CSV
    const csvPath = path.join(__dirname, 'exemplo-importacao.csv');
    const csvText = fs.readFileSync(csvPath, 'utf8');
    
    console.log('📄 Conteúdo do CSV:');
    console.log(csvText);
    console.log('');

    // Converter CSV para JSON
    const questions = convertCSVToJson(csvText);
    console.log(`📋 ${questions.length} questões encontradas no CSV:`);
    questions.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.disciplina} - ${q.assunto} (${q.alternativaCorreta})`);
    });
    console.log('');

    // Converter e inserir cada questão
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`📝 Inserindo questão ${i + 1}/${questions.length}...`);
      
      const convertedQuestion = convertQuestion(question);
      
      const { data, error } = await supabase
        .from('questions')
        .insert([convertedQuestion])
        .select()
        .single();

      if (error) {
        console.log(`❌ Erro ao inserir questão ${i + 1}:`, error.message);
      } else {
        console.log(`✅ Questão ${i + 1} inserida com sucesso! ID: ${data.id}`);
      }
      console.log('');
    }

    // Verificar total de questões no banco
    const { data: allQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('id, disciplina, assunto, question')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.log('❌ Erro ao buscar questões:', fetchError.message);
    } else {
      console.log(`✅ Total de questões no banco: ${allQuestions?.length || 0}`);
      console.log('📋 Últimas questões inseridas:');
      allQuestions?.slice(0, 5).forEach((q, i) => {
        console.log(`   ${i + 1}. ${q.disciplina} - ${q.assunto}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testCSVImport().catch(console.error);



