# Configuração do Banco de Dados - Novo Projeto Supabase

## Passos para Configurar o Banco de Dados

1. **Acesse o painel do Supabase**
   - Vá para https://supabase.com
   - Faça login e acesse o projeto: `zghneimasvhimrzbwtrv`

2. **Execute o Script SQL**
   - No painel do Supabase, vá para "SQL Editor"
   - Clique em "New Query"
   - Copie todo o conteúdo do arquivo `00-estrutura-limpa-final.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

3. **Verificar as Tabelas**
   - Após executar o SQL, vá para "Table Editor"
   - Verifique se as seguintes tabelas foram criadas:
     - `profiles`
     - `subjects`
     - `questions`
     - `question_attempts`
     - `study_sessions`
     - `flashcards`
     - `flashcard_reviews`
     - `pomodoro_sessions`
     - `goals`
     - `reviews`
     - `schedule_events`

4. **Configurar RLS (Row Level Security)**
   - Vá para "Authentication" > "Policies"
   - Verifique se as políticas de segurança estão ativas

5. **Testar a Aplicação**
   - Após configurar o banco, reinicie o servidor de desenvolvimento
   - Teste o login e as funcionalidades principais

## Credenciais Atualizadas

As seguintes credenciais foram atualizadas em todos os arquivos:

- **URL**: `https://zghneimasvhimrzbwtrv.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODE4NzgsImV4cCI6MjA3MTA1Nzg3OH0.raFiD_cesWoed637PvSTo1cLgkNJSVz4AGlVzmjaD_0`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaG5laW1hc3ZoaW1yemJ3dHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ4MTg3OCwiZXhwIjoyMDcxMDU3ODc4fQ.nct6kD-TJU2BZu3ycltJWpfBug83_AZg_4mB9TFbs2M`

## Arquivos Atualizados

Os seguintes arquivos foram atualizados com as novas credenciais:

- `lib/supabase.ts`
- `utils/supabase/client.ts`
- `utils/supabase/server.ts`
- `utils/supabase/middleware.ts`
- `.env.local` (criado)

## Próximos Passos

1. **Execute o script SQL no painel do Supabase**
   - Vá para "SQL Editor" no painel do Supabase
   - Execute o arquivo `00-estrutura-limpa-final.sql`

2. **Execute o script de correção RLS (SOLUÇÃO RÁPIDA)**
   - Execute o arquivo `disable-rls-temp.sql` no SQL Editor
   - Este script desabilita temporariamente o RLS para resolver o problema
   - **Esta é a solução mais rápida** para fazer o sistema funcionar imediatamente

3. **Verifique as tabelas**
   - Execute o script `check-tables.js` para verificar se tudo está funcionando:
   ```bash
   node scripts/check-tables.js
   ```

4. **Teste a aplicação**
   - Acesse `http://localhost:3001/test-connection` para verificar a conectividade
   - Teste o login e funcionalidades principais

## Problemas Identificados e Soluções

### ❌ Erro: "infinite recursion detected in policy"
**Causa:** Políticas RLS mal configuradas na tabela `profiles`
**Solução:** Execute o script `fix-rls-policies.sql`

### ❌ Erro: "Could not find the table"
**Causa:** Algumas tabelas não foram criadas
**Solução:** O script `fix-rls-policies.sql` também cria as tabelas faltantes

### ✅ Após executar os scripts:
- Todas as tabelas estarão criadas
- Políticas RLS funcionando corretamente
- Dados iniciais de disciplinas inseridos
- Sistema pronto para uso
