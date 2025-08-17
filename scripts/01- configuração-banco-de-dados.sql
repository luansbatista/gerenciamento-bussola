-- Script principal para setup do banco de dados
-- Execute este script no Supabase SQL Editor

-- 0. Dropar tabelas antigas para recriar com estrutura correta
DROP TABLE IF EXISTS public.exam_questions CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.pomodoro_sessions CASCADE;
DROP TABLE IF EXISTS public.study_goals CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.assuntos_edital CASCADE;
DROP TABLE IF EXISTS public.question_attempts CASCADE;
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Criar tabelas principais
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    study_goal INTEGER DEFAULT 4,
    current_streak INTEGER DEFAULT 0,
    total_study_hours DECIMAL(8,2) DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    total_questions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela questions com estrutura original para importação CSV
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disciplina TEXT,
    subject TEXT,
    assunto TEXT,
    question TEXT,
    enunciado TEXT,
    opcao_a TEXT,
    opcao_b TEXT,
    opcao_c TEXT,
    opcao_d TEXT,
    alternativa_correta TEXT,
    correct_answer TEXT,
    difficulty TEXT DEFAULT 'medium',
    nivel TEXT DEFAULT 'médio',
    times_answered INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN,
    time_spent INTEGER DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    activity_type TEXT DEFAULT 'study',
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0
);

-- Tabela para assuntos do edital (usada em flashcards)
CREATE TABLE IF NOT EXISTS public.assuntos_edital (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disciplina TEXT NOT NULL,
    assunto TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para materiais de estudo
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    file_url TEXT,
    file_type TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para sistema de revisões
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    review_level INTEGER DEFAULT 0,
    interval INTEGER DEFAULT 1,
    next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_review_result TEXT,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para metas de estudo
CREATE TABLE IF NOT EXISTS public.study_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')),
    target INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0,
    description TEXT,
    deadline DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para sessões pomodoro
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    session_type TEXT CHECK (session_type IN ('study', 'break', 'long_break')),
    duration INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para simulados
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    time_limit INTEGER,
    score DECIMAL(5,2),
    total_time INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para questões dos simulados
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN,
    question_order INTEGER NOT NULL
);

-- 2. Inserir disciplinas do concurso
INSERT INTO public.subjects (name, color) VALUES
    ('Português', '#EF4444'),
    ('História do Brasil', '#F59E0B'),
    ('Geografia do Brasil', '#10B981'),
    ('Matemática', '#3B82F6'),
    ('Atualidades', '#8B5CF6'),
    ('Informática', '#06B6D4'),
    ('Direito Constitucional', '#84CC16'),
    ('Constituição do estado da Bahia', '#F97316'),
    ('Direitos Humanos', '#EC4899'),
    ('Direito Administrativo', '#6366F1'),
    ('Direito Penal', '#14B8A6'),
    ('Direito Penal Militar', '#F43F5E')
ON CONFLICT (name) DO NOTHING;

-- 3. Inserir assuntos do edital
INSERT INTO public.assuntos_edital (disciplina, assunto) VALUES
    ('Português', 'Interpretação de Texto'),
    ('Português', 'Gramática'),
    ('Português', 'Redação'),
    ('Matemática', 'Álgebra'),
    ('Matemática', 'Geometria'),
    ('Matemática', 'Trigonometria'),
    ('História do Brasil', 'Período Colonial'),
    ('História do Brasil', 'Independência'),
    ('História do Brasil', 'República'),
    ('Geografia do Brasil', 'Geografia Física'),
    ('Geografia do Brasil', 'Geografia Humana'),
    ('Direito Constitucional', 'Constituição Federal'),
    ('Direito Constitucional', 'Direitos Fundamentais'),
    ('Direito Administrativo', 'Princípios'),
    ('Direito Administrativo', 'Atos Administrativos'),
    ('Direito Penal', 'Teoria do Crime'),
    ('Direito Penal', 'Tipos Penais')
ON CONFLICT DO NOTHING;

-- 4. Configurar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assuntos_edital ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes antes de criar novas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view subjects" ON public.subjects;

DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

DROP POLICY IF EXISTS "Users can view own question attempts" ON public.question_attempts;
DROP POLICY IF EXISTS "Users can insert own question attempts" ON public.question_attempts;

DROP POLICY IF EXISTS "Users can view own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert own study sessions" ON public.study_sessions;

DROP POLICY IF EXISTS "Anyone can view assuntos_edital" ON public.assuntos_edital;

DROP POLICY IF EXISTS "Anyone can view materials" ON public.materials;
DROP POLICY IF EXISTS "Users can insert own materials" ON public.materials;

DROP POLICY IF EXISTS "Users can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;

DROP POLICY IF EXISTS "Users can view own study goals" ON public.study_goals;
DROP POLICY IF EXISTS "Users can insert own study goals" ON public.study_goals;
DROP POLICY IF EXISTS "Users can update own study goals" ON public.study_goals;

DROP POLICY IF EXISTS "Users can view own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can insert own pomodoro sessions" ON public.pomodoro_sessions;

DROP POLICY IF EXISTS "Users can view own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can insert own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can update own exams" ON public.exams;

DROP POLICY IF EXISTS "Users can view own exam questions" ON public.exam_questions;
DROP POLICY IF EXISTS "Users can insert own exam questions" ON public.exam_questions;
DROP POLICY IF EXISTS "Users can update own exam questions" ON public.exam_questions;

-- 6. Criar políticas RLS
-- Profiles: usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Subjects: todos podem ver
CREATE POLICY "Anyone can view subjects" ON public.subjects
    FOR SELECT USING (true);

-- Questions: todos podem ver
CREATE POLICY "Anyone can view questions" ON public.questions
    FOR SELECT USING (true);

-- Question attempts: usuários podem ver, inserir e atualizar apenas suas próprias tentativas
CREATE POLICY "Users can view own question attempts" ON public.question_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question attempts" ON public.question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own question attempts" ON public.question_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- Study sessions: usuários podem ver e inserir apenas suas próprias sessões
CREATE POLICY "Users can view own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Assuntos edital: todos podem ver
CREATE POLICY "Anyone can view assuntos_edital" ON public.assuntos_edital
    FOR SELECT USING (true);

-- Materials: todos podem ver, usuários podem inserir seus próprios
CREATE POLICY "Anyone can view materials" ON public.materials
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own materials" ON public.materials
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Reviews: usuários podem ver, inserir e atualizar apenas suas próprias
CREATE POLICY "Users can view own reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Study goals: usuários podem ver, inserir e atualizar apenas suas próprias
CREATE POLICY "Users can view own study goals" ON public.study_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study goals" ON public.study_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study goals" ON public.study_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Pomodoro sessions: usuários podem ver e inserir apenas suas próprias
CREATE POLICY "Users can view own pomodoro sessions" ON public.pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pomodoro sessions" ON public.pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exams: usuários podem ver, inserir e atualizar apenas suas próprias
CREATE POLICY "Users can view own exams" ON public.exams
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exams" ON public.exams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams" ON public.exams
    FOR UPDATE USING (auth.uid() = user_id);

-- Exam questions: usuários podem ver, inserir e atualizar apenas suas próprias
CREATE POLICY "Users can view own exam questions" ON public.exam_questions
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM public.exams WHERE id = exam_id
    ));

CREATE POLICY "Users can insert own exam questions" ON public.exam_questions
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM public.exams WHERE id = exam_id
    ));

CREATE POLICY "Users can update own exam questions" ON public.exam_questions
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM public.exams WHERE id = exam_id
    ));

-- 7. Inserir questões de exemplo para cada disciplina
DO $$
DECLARE
    subject_record RECORD;
BEGIN
    FOR subject_record IN SELECT id, name FROM public.subjects
    LOOP
        -- Inserir pelo menos uma questão para cada disciplina
        INSERT INTO public.questions (disciplina, subject, assunto, question, opcao_a, opcao_b, opcao_c, opcao_d, alternativa_correta)
        VALUES (
            subject_record.name,
            subject_record.name,
            'Geral',
            'Questão de exemplo para ' || subject_record.name,
            'Opção A',
            'Opção B',
            'Opção C',
            'Opção D',
            'a'
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 8. Verificar setup
SELECT 'SETUP CONCLUÍDO!' as status;
SELECT 
    'Total de disciplinas:' as item,
    COUNT(*)::text as valor
FROM public.subjects
UNION ALL
SELECT 
    'Disciplinas com questões:' as item,
    COUNT(DISTINCT q.disciplina)::text as valor
FROM public.questions q
WHERE q.disciplina IS NOT NULL
UNION ALL
SELECT 
    'Total de questões:' as item,
    COUNT(*)::text as valor
FROM public.questions
UNION ALL
SELECT 
    'Total de assuntos:' as item,
    COUNT(*)::text as valor
FROM public.assuntos_edital;