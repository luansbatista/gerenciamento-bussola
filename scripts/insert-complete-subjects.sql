-- =====================================================
-- INSERIR DISCIPLINAS COMPLETAS DO CONCURSO
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- 3. LIMPAR TABELA DE SUBJECTS E INSERIR DISCIPLINAS COMPLETAS
DELETE FROM public.subjects;

INSERT INTO public.subjects (name, color, total_questions) VALUES
    ('Português', '#10B981', 0),
    ('História do Brasil', '#F59E0B', 0),
    ('Geografia do Brasil', '#EF4444', 0),
    ('Matemática', '#3B82F6', 0),
    ('Atualidades', '#8B5CF6', 0),
    ('Informática', '#06B6D4', 0),
    ('Direito Constitucional', '#84CC16', 0),
    ('Constituição da Bahia', '#F97316', 0),
    ('Direitos Humanos', '#EC4899', 0),
    ('Direito Administrativo', '#6366F1', 0),
    ('Direito Penal', '#DC2626', 0),
    ('Direito Penal Militar', '#059669', 0);

-- 4. CRIAR TABELA DE ASSUNTOS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.subjects_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_name TEXT NOT NULL,
    percentage INTEGER NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INSERIR ASSUNTOS DE PORTUGUÊS
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority) 
SELECT s.id, t.topic_name, t.percentage, 
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Compreensão e interpretação de textos', 57),
    ('Tipologia textual e gêneros textuais', 4),
    ('Ortografia oficial', 2),
    ('Acentuação gráfica', 2),
    ('Classes de palavras', 2),
    ('Uso do sinal indicativo de crase', 5),
    ('Sintaxe da oração e do período', 2),
    ('Pontuação', 9),
    ('Concordância nominal e verbal', 9),
    ('Regência nominal e verbal', 5),
    ('Significação das palavras', 3)
) AS t(topic_name, percentage)
WHERE s.name = 'Português';

-- 6. INSERIR ASSUNTOS DE HISTÓRIA DO BRASIL
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Descobrimento do Brasil (1500)', 4),
    ('Brasil Colônia (1530-1815)', 9),
    ('Independência do Brasil (1822)', 11),
    ('Primeiro Reinado (1822-1831)', 8),
    ('Segundo Reinado (1831-1840)', 12),
    ('Primeira República (1889-1930)', 9),
    ('Revolução de 1930', 12),
    ('Era Vargas (1930-1945)', 13),
    ('Os Presidentes do Brasil de 1964 à atualidade', 0),
    ('História da Bahia', 3),
    ('Independência da Bahia', 2),
    ('Revolta de Canudos', 5),
    ('Revolta dos Malês', 5),
    ('Conjuração Baiana', 5),
    ('Sabinada', 5)
) AS t(topic_name, percentage)
WHERE s.name = 'História do Brasil';

-- 7. INSERIR ASSUNTOS DE GEOGRAFIA DO BRASIL
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Relevo brasileiro', 11),
    ('Urbanização', 23),
    ('Tipos de fontes de energia brasileira', 10),
    ('Problemas Ambientais', 18),
    ('Climas', 20),
    ('Geografia da Bahia', 18)
) AS t(topic_name, percentage)
WHERE s.name = 'Geografia do Brasil';

-- 8. INSERIR ASSUNTOS DE MATEMÁTICA
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Conjuntos numéricos', 13),
    ('Álgebra', 3),
    ('Funções', 5),
    ('Sistemas lineares, Matrizes e Determinantes', 16),
    ('Análise Combinatória', 35),
    ('Geometria e Medidas', 25),
    ('Trigonometria', 4)
) AS t(topic_name, percentage)
WHERE s.name = 'Matemática';

-- 9. INSERIR ASSUNTOS DE ATUALIDADES
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Globalização', 58),
    ('Multiculturalidade, Pluralidade e Diversidade Cultural', 20),
    ('Tecnologias de Informação e Comunicação', 22)
) AS t(topic_name, percentage)
WHERE s.name = 'Atualidades';

-- 10. INSERIR ASSUNTOS DE INFORMÁTICA
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Conceitos e modos de utilização de aplicativos para edição de textos', 62),
    ('Sistemas operacionais Windows 7, Windows 10 e Linux', 25),
    ('Organização e gerenciamento de informações, arquivos, pastas e programas', 2),
    ('Atalhos de teclado, ícones, área de trabalho e lixeira', 2),
    ('Conceitos básicos e modos de utilização de tecnologias, ferramentas, aplicativos e procedimentos associados à Internet e intranet', 4),
    ('Correio eletrônico', 4),
    ('Computação em nuvem', 1)
) AS t(topic_name, percentage)
WHERE s.name = 'Informática';

-- 11. INSERIR ASSUNTOS DE DIREITO CONSTITUCIONAL
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Dos princípios fundamentais', 31),
    ('Dos Direitos e garantias fundamentais', 4),
    ('Da organização do Estado', 3),
    ('Da Administração Pública', 49),
    ('Dos militares dos Estados, do Distrito Federal e dos Territórios', 1),
    ('Da Segurança Pública', 10)
) AS t(topic_name, percentage)
WHERE s.name = 'Direito Constitucional';

-- 12. INSERIR ASSUNTOS DA CONSTITUIÇÃO DA BAHIA
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Dos princípios fundamentais', 5),
    ('Direitos e garantias fundamentais', 5),
    ('Dos Servidores Públicos Militares', 5),
    ('Da Segurança Pública', 5)
) AS t(topic_name, percentage)
WHERE s.name = 'Constituição da Bahia';

-- 13. INSERIR ASSUNTOS DE DIREITOS HUMANOS
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('A Declaração Universal dos Direitos Humanos/1948', 64),
    ('Convenção Americana sobre Direitos Humanos/1969 (Pacto de São José da Costa Rica) (art. 1° ao 32)', 4),
    ('Pacto Internacional dos Direitos Econômicos, Sociais e Culturais (art. 1° ao 15)', 18),
    ('Declaração de Pequim Adotada pela Quarta Conferência Mundial sobre as Mulheres', 14)
) AS t(topic_name, percentage)
WHERE s.name = 'Direitos Humanos';

-- 14. INSERIR ASSUNTOS DE DIREITO ADMINISTRATIVO
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Administração Pública', 23),
    ('Princípios fundamentais da administração pública', 35),
    ('Poderes e deveres dos administradores públicos', 30),
    ('Servidores públicos: cargo, emprego e função públicos', 10),
    ('Regime jurídico do militar estadual: Estatuto dos Policiais Militares do Estado da Bahia (Lei estadual nº 7.990 - arts 1º ao 59)', 2)
) AS t(topic_name, percentage)
WHERE s.name = 'Direito Administrativo';

-- 15. INSERIR ASSUNTOS DE DIREITO PENAL
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Elementos', 3),
    ('Consumação e tentativa', 10),
    ('Desistência voluntária e arrependimento eficaz', 6),
    ('Arrependimento posterior', 2),
    ('Crime impossível', 1),
    ('Causas de exclusão de ilicitude e culpabilidade', 7),
    ('Contravenção', 0),
    ('Dos crimes contra a vida', 24),
    ('Dos crimes contra a liberdade pessoal', 1),
    ('Dos crimes contra o patrimônio', 9),
    ('Dos crimes contra a dignidade sexual', 8),
    ('Corrupção ativa', 10),
    ('Corrupção passiva', 21),
    ('Lei n° 9.455 (Crimes de tortura)', 2)
) AS t(topic_name, percentage)
WHERE s.name = 'Direito Penal';

-- 16. INSERIR ASSUNTOS DE DIREITO PENAL MILITAR
INSERT INTO public.subjects_topics (subject_id, topic_name, percentage, priority)
SELECT s.id, t.topic_name, t.percentage,
       CASE 
           WHEN t.percentage >= 50 THEN 1
           WHEN t.percentage >= 20 THEN 2
           WHEN t.percentage >= 10 THEN 3
           ELSE 4
       END as priority
FROM public.subjects s,
(VALUES 
    ('Dos crimes contra a autoridade ou disciplina militar', 19),
    ('Da violência contra superior ou militar de serviço', 19),
    ('Desrespeito a superior', 6),
    ('Recusa de obediência', 19),
    ('Reunião ilícita', 16),
    ('Publicação ou crítica indevida', 0),
    ('Resistência mediante ameaça ou violência', 10),
    ('Dos crimes contra o serviço militar e o dever militar', 3),
    ('Crimes contra a Administração Militar', 3),
    ('Dos crimes contra o dever funcional', 3)
) AS t(topic_name, percentage)
WHERE s.name = 'Direito Penal Militar';

-- 17. CRIAR TABELAS FALTANTES
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    difficulty INTEGER DEFAULT 1,
    next_review TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 5),
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.schedule_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. MENSAGEM DE SUCESSO
SELECT '✅ SISTEMA COMPLETO! Todas as disciplinas e assuntos inseridos com priorização.' as status;
