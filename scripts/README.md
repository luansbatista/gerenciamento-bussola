# Scripts SQL - Bússola da Aprovação

## 📋 **Scripts Disponíveis**

### **1. `01-setup-database.sql`** - Setup Principal
**O que faz:**
- ✅ Cria todas as tabelas necessárias
- ✅ Insere as 12 disciplinas do concurso
- ✅ Configura RLS (Row Level Security)
- ✅ Cria políticas de segurança
- ✅ Insere questões de exemplo para cada disciplina

**Quando usar:**
- 🚀 **Primeira vez** configurando o banco
- 🔄 **Reset completo** do banco de dados

**Execute no Supabase SQL Editor**

---

### **2. `02-verificar-disciplinas.sql`** - Diagnóstico
**O que faz:**
- ✅ Lista todas as disciplinas cadastradas
- ✅ Mostra quantas questões cada disciplina tem
- ✅ Identifica disciplinas sem questões
- ✅ Testa a consulta exata que a aplicação usa
- ✅ Fornece resumo completo

**Quando usar:**
- 🔍 **Verificar** se as disciplinas estão funcionando
- 🐛 **Diagnosticar** problemas com disciplinas não aparecendo
- 📊 **Monitorar** o estado do banco

**Execute no Supabase SQL Editor**

---

### **3. `03-inserir-questoes-faltantes.sql`** - Correção
**O que faz:**
- ✅ Identifica disciplinas sem questões
- ✅ Insere questões simples para disciplinas faltantes
- ✅ Verifica se todas as disciplinas agora têm questões
- ✅ Testa se a aplicação conseguirá carregar as disciplinas

**Quando usar:**
- ⚠️ **Quando disciplinas não aparecem** na aplicação
- 🔧 **Corrigir** problemas de disciplinas faltantes
- ➕ **Adicionar** questões para novas disciplinas

**Execute no Supabase SQL Editor**

---

## 🚀 **Como Resolver o Problema das Disciplinas**

### **Passo 1: Setup Inicial**
```sql
-- Execute: 01-setup-database.sql
```
**Resultado esperado:**
- 12 disciplinas cadastradas
- 12 questões criadas (uma para cada disciplina)
- Todas as políticas RLS configuradas

### **Passo 2: Verificar Status**
```sql
-- Execute: 02-verificar-disciplinas.sql
```
**Verifique:**
- ✅ Todas as 12 disciplinas aparecem
- ✅ Cada disciplina tem pelo menos 1 questão
- ✅ A consulta da aplicação retorna dados

### **Passo 3: Corrigir se Necessário**
```sql
-- Execute: 03-inserir-questoes-faltantes.sql
```
**Se alguma disciplina não tem questões**

---

## 🎯 **Disciplinas do Concurso**

1. **Português** - #EF4444
2. **História do Brasil** - #F59E0B
3. **Geografia do Brasil** - #10B981
4. **Matemática** - #3B82F6
5. **Atualidades** - #8B5CF6
6. **Informática** - #06B6D4
7. **Direito Constitucional** - #84CC16
8. **Constituição do estado da Bahia** - #F97316
9. **Direitos Humanos** - #EC4899
10. **Direito Administrativo** - #6366F1
11. **Direito Penal** - #14B8A6
12. **Direito Penal Militar** - #F43F5E

---

## 🔧 **Estrutura das Tabelas**

### **subjects**
- `id` (UUID) - Chave primária
- `name` (TEXT) - Nome da disciplina
- `color` (TEXT) - Cor da disciplina
- `created_at` (TIMESTAMP) - Data de criação

### **questions**
- `id` (UUID) - Chave primária
- `subject_id` (UUID) - Referência para subjects
- `created_at` (TIMESTAMP) - Data de criação

### **question_attempts**
- `id` (UUID) - Chave primária
- `user_id` (UUID) - Referência para auth.users
- `question_id` (UUID) - Referência para questions
- `selected_answer` (TEXT) - Resposta selecionada
- `is_correct` (BOOLEAN) - Se está correta
- `time_spent` (INTEGER) - Tempo gasto em segundos
- `attempted_at` (TIMESTAMP) - Data da tentativa

---

## 🐛 **Problemas Comuns**

### **"Nenhuma disciplina encontrada"**
**Causa:** Disciplinas não têm questões
**Solução:** Execute `03-inserir-questoes-faltantes.sql`

### **"Erro ao buscar disciplinas"**
**Causa:** Problemas de RLS ou estrutura
**Solução:** Execute `01-setup-database.sql`

### **"Apenas algumas disciplinas aparecem"**
**Causa:** Algumas disciplinas não têm questões
**Solução:** Execute `02-verificar-disciplinas.sql` e depois `03-inserir-questoes-faltantes.sql`

---

## 📞 **Suporte**

Se os scripts não resolverem o problema:
1. Execute `02-verificar-disciplinas.sql`
2. Verifique os resultados
3. Compare com o esperado
4. Execute o script de correção apropriado
