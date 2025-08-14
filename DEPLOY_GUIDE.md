# 🚀 Guia de Deploy - Bússola da Aprovação

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Netlify
- Conta no Supabase (já configurada)

## 🔧 Passo a Passo

### 1. GitHub

1. **Crie um repositório no GitHub:**
   - Acesse https://github.com
   - Clique em "New repository"
   - Nome: `bussola-aprovacao`
   - Descrição: "Sistema de estudos para concursos públicos"
   - Público ou Privado (sua escolha)
   - Não inicialize com README (já temos)

2. **Conecte o repositório local:**
```bash
git remote add origin https://github.com/SEU_USUARIO/bussola-aprovacao.git
git branch -M main
git push -u origin main
```

### 2. Netlify

1. **Acesse o Netlify:**
   - Vá para https://netlify.com
   - Faça login com sua conta GitHub

2. **Conecte o repositório:**
   - Clique em "Add new site"
   - Selecione "Import an existing project"
   - Escolha "Deploy with GitHub"
   - Selecione o repositório `bussola-aprovacao`

3. **Configure o build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18 (ou superior)

4. **Configure as variáveis de ambiente:**
   - Vá em "Site settings" > "Environment variables"
   - Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://stiphfmiuxhygwlutwxm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aXBoZm1pdXhoeWd3bHV0d3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDgwMTAsImV4cCI6MjA3MDYyNDAxMH0.Ft7phh4Ef592U7IqeXCYSsgK94i1S6wnJz15fkkmB4Y
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aXBoZm1pdXhoeWd3bHV0d3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MDYyNDAxMH0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

5. **Deploy:**
   - Clique em "Deploy site"
   - Aguarde o build (2-3 minutos)

### 3. Configurações Adicionais

1. **Domínio personalizado (opcional):**
   - Vá em "Domain settings"
   - Clique em "Add custom domain"
   - Configure seu domínio

2. **SSL:**
   - O Netlify fornece SSL automaticamente
   - Não é necessário configurar

3. **Deploy automático:**
   - A cada push para a branch `main`, o deploy será automático
   - Você pode configurar previews para outras branches

## 🔍 Verificação

Após o deploy, verifique:

1. **Funcionalidades básicas:**
   - ✅ Login/Registro
   - ✅ Navegação entre páginas
   - ✅ Banco de questões
   - ✅ Painel administrativo

2. **Performance:**
   - ✅ Tempo de carregamento
   - ✅ Responsividade
   - ✅ Funcionalidades em mobile

3. **Segurança:**
   - ✅ HTTPS ativo
   - ✅ Variáveis de ambiente configuradas
   - ✅ RLS funcionando

## 🚨 Troubleshooting

### Erro de Build
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o Node.js 18+ está sendo usado

### Erro de Conexão com Supabase
- Verifique se as chaves do Supabase estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de Variáveis de Ambiente
- Certifique-se de que as variáveis começam com `NEXT_PUBLIC_`
- Verifique se não há espaços extras

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Netlify
2. Teste localmente primeiro
3. Consulte a documentação do Next.js e Supabase

---

**🎉 Parabéns! Seu sistema está no ar!**
