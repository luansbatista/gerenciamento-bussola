# Bússola da Aprovação

Sistema completo de estudos para concursos públicos, desenvolvido com Next.js 15, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

### 📚 Banco de Questões
- 489 questões reais importadas do banco de dados
- Filtros por disciplina e dificuldade
- Sistema de resposta com feedback imediato
- Estatísticas de desempenho

### 🎯 Sistema de Estudos
- Técnica Pomodoro integrada
- Flashcards com revisão espaçada
- Metas de estudo personalizáveis
- Cronograma inteligente

### 📊 Analytics e Relatórios
- Dashboard com estatísticas em tempo real
- Ranking de usuários
- Relatórios de desempenho por disciplina
- Progresso mensal e semanal

### 👨‍💼 Painel Administrativo
- Gerenciamento completo de usuários
- Importação de questões via Excel/CSV
- Configurações do sistema
- Relatórios detalhados

### 🔐 Autenticação e Segurança
- Login/Registro com Supabase Auth
- Controle de acesso por roles (admin/usuário)
- Row Level Security (RLS) configurado
- Proteção de rotas

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deploy**: Netlify
- **Versionamento**: Git/GitHub

## 📁 Estrutura do Projeto

```
├── app/                    # Páginas da aplicação
│   ├── admin/             # Painel administrativo
│   ├── questions/         # Banco de questões
│   ├── pomodoro/          # Técnica Pomodoro
│   ├── flashcards/        # Sistema de flashcards
│   ├── exams/             # Simulados
│   └── ...
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Shadcn)
│   ├── admin/            # Componentes do painel admin
│   ├── questions/        # Componentes de questões
│   └── ...
├── lib/                  # Contextos e utilitários
│   ├── auth-context.tsx  # Contexto de autenticação
│   ├── admin-context.tsx # Contexto administrativo
│   ├── questions-context.tsx # Contexto de questões
│   └── ...
├── utils/                # Utilitários
│   └── supabase/         # Configuração do Supabase
└── scripts/              # Scripts SQL essenciais
```

## 🚀 Deploy

### Pré-requisitos
- Node.js 18+
- Conta no Supabase
- Conta no Netlify

### Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/bussola-aprovacao.git
cd bussola-aprovacao
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

4. **Execute o projeto**
```bash
npm run dev
```

### Deploy no Netlify

1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente no painel do Netlify
3. Deploy automático será realizado a cada push

## 📊 Banco de Dados

### Tabelas Principais
- `profiles`: Perfis de usuários
- `questions`: Banco de questões
- `question_attempts`: Tentativas de resposta
- `study_sessions`: Sessões de estudo
- `flashcards`: Sistema de flashcards
- `assuntos_edital`: Disciplinas e assuntos

### RLS (Row Level Security)
- Políticas configuradas para proteção de dados
- Usuários só acessam seus próprios dados
- Admins têm acesso completo

## 🔧 Manutenção

### Limpeza de Dados
- Todos os dados mockup foram removidos
- Sistema conectado 100% ao Supabase
- Logs de debug removidos

### Performance
- Otimizações de queries implementadas
- Lazy loading de componentes
- Cache de dados configurado

## 📈 Status do Sistema

### ✅ Funcionalidades Implementadas
- [x] Autenticação completa
- [x] Banco de questões funcional
- [x] Sistema de flashcards
- [x] Técnica Pomodoro
- [x] Painel administrativo
- [x] Analytics e relatórios
- [x] Importação de questões
- [x] Sistema de metas

### 🔄 Melhorias Futuras
- [ ] Notificações push
- [ ] App mobile
- [ ] Gamificação
- [ ] IA para recomendações

## 📞 Suporte

Para suporte técnico ou dúvidas, entre em contato através do painel administrativo.

---

**Desenvolvido com ❤️ para facilitar os estudos de concursos públicos**
