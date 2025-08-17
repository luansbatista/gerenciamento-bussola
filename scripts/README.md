# Scripts do Sistema Bússola da Aprovação

## 📋 Ordem de Execução dos Scripts

### 1. Configuração Inicial
Execute apenas uma vez para configurar o banco de dados:

```sql
01- configuração-banco-de-dados.sql
```

### 2. Verificação do Sistema
Execute para verificar se tudo está funcionando:

```sql
02- verificar-disciplinas.sql
```

### 3. Correção Completa (Se houver problemas)
Execute se encontrar problemas no sistema:

```sql
14-correcao-completa-sistema.sql
```

### 4. Diagnóstico de Problemas (Se necessário)
Execute para diagnosticar problemas específicos:

```sql
15-diagnostico-completo-banco.sql
16-teste-insercao-dados.sql
```

## 📁 Scripts Disponíveis

### Scripts Principais
- `01- configuração-banco-de-dados.sql` - Configuração completa do banco
- `02- verificar-disciplinas.sql` - Verificação do sistema
- `14-correcao-completa-sistema.sql` - Correção completa

### Scripts de Diagnóstico
- `15-diagnostico-completo-banco.sql` - Diagnóstico completo da estrutura do banco
- `16-teste-insercao-dados.sql` - Teste específico de inserção de dados
- `17-correcao-insercao-question-attempts.sql` - Correção específica para problemas de inserção
- `18-teste-insercao-manual.sql` - Teste manual de inserção para debug

## ⚠️ Scripts Removidos
Os seguintes scripts foram removidos por serem desnecessários ou duplicados:
- `03-teste-consultas-aplicacao.sql`
- `04-restaurar-perfis-usuarios.sql`
- `05-inserir-dados-exemplo-usuario.sql`
- `06-verificar-estrutura-profiles.sql`
- `07-corrigir-estrutura-profiles.sql`
- `08-adicionar-colunas-profiles.sql`
- `09-configurar-admin.sql`
- `10-testar-insercao-questions.sql`
- `11-adicionar-opcao-e.sql`
- `12-testar-importacao-csv.sql`
- `13-diagnostico-insercao.sql`
- `15-verificar-questoes-importadas.sql`
- `16-verificar-questoes-simples.sql`
- `17-debug-filtros-disciplinas.sql`
- `18-corrigir-filtros-disciplinas.sql`
- `19-corrigir-questoes-banco.sql`
- `20-diagnostico-completo-questoes.sql`
- `21-correcao-definitiva-questoes.sql`
- `22-diagnostico-question-attempts.sql`
- `23-testar-filtros-disciplinas.sql`

## 🚀 Como Usar

1. **Primeira vez**: Execute apenas o script `01- configuração-banco-de-dados.sql`
2. **Verificação**: Execute `02- verificar-disciplinas.sql` para verificar se tudo está OK
3. **Problemas**: Se houver problemas, execute `14-correcao-completa-sistema.sql`
4. **Diagnóstico**: Para problemas específicos, use `15-diagnostico-completo-banco.sql` e `16-teste-insercao-dados.sql`

## 📝 Notas Importantes

- Execute os scripts na ordem correta
- Não execute scripts de manutenção rotineiramente
- Sempre verifique o resultado dos scripts
- Em caso de dúvida, use o script de correção completa
