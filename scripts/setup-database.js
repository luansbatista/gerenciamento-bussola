const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://zghneimasvhimrzbwtrv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ4MTg3OCwiZXhwIjoyMDcxMDU3ODc4fQ.nct6kD-TJU2BZu3ycltJWpfBug83_AZg_4mB9TFbs2M';

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey
    },
    body: JSON.stringify({ sql })
  });
  
  return response.json();
}

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '00-estrutura-limpa-final.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Arquivo SQL carregado com sucesso');
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`🔧 Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          const result = await executeSQL(command);
          if (result.error) {
            console.log(`⚠️  Comando ${i + 1} (pode ser ignorado se já existir):`, result.error);
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (err) {
          console.log(`⚠️  Comando ${i + 1} (pode ser ignorado se já existir):`, err.message);
        }
      }
    }
    
    console.log('🎉 Configuração do banco de dados concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

setupDatabase();
