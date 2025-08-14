-- Script principal para setup do banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabelas principais
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
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
    duration_minutes INTEGER DEFAULT 0
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

-- 3. Configurar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
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

-- Question attempts: usuários podem ver e inserir apenas suas próprias tentativas
CREATE POLICY "Users can view own question attempts" ON public.question_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question attempts" ON public.question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study sessions: usuários podem ver e inserir apenas suas próprias sessões
CREATE POLICY "Users can view own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Inserir questões de exemplo para cada disciplina
DO $$
DECLARE
    subject_record RECORD;
BEGIN
    FOR subject_record IN SELECT id, name FROM public.subjects
    LOOP
        -- Inserir pelo menos uma questão para cada disciplina
        INSERT INTO public.questions (subject_id)
        VALUES (subject_record.id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 6. Verificar setup
SELECT 'SETUP CONCLUÍDO!' as status;
SELECT 
    'Total de disciplinas:' as item,
    COUNT(*)::text as valor
FROM public.subjects
UNION ALL
SELECT 
    'Disciplinas com questões:' as item,
    COUNT(DISTINCT s.name)::text as valor
FROM public.questions q
INNER JOIN public.subjects s ON q.subject_id = s.id
UNION ALL
SELECT 
    'Total de questões:' as item,
    COUNT(*)::text as valor
FROM public.questions;
