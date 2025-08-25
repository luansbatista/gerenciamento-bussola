-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS - BÚSSOLA DA APROVAÇÃO
-- Script para corrigir recursão infinita nas políticas
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA CORREÇÃO
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

-- 3. CRIAR POLÍTICAS CORRETAS PARA PROFILES
CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. CRIAR POLÍTICAS PARA SUBJECTS
CREATE POLICY "Enable read access for all users" ON public.subjects
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.subjects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.subjects
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. CRIAR POLÍTICAS PARA QUESTIONS
CREATE POLICY "Enable read access for all users" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.questions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. CRIAR POLÍTICAS PARA QUESTION_ATTEMPTS
CREATE POLICY "Users can view own attempts" ON public.question_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON public.question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" ON public.question_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. CRIAR POLÍTICAS PARA STUDY_SESSIONS
CREATE POLICY "Users can view own sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 8. CRIAR POLÍTICAS PARA MATERIALS
CREATE POLICY "Enable read access for all users" ON public.materials
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.materials
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.materials
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 9. CRIAR POLÍTICAS PARA REVIEWS
CREATE POLICY "Users can view own reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. CRIAR POLÍTICAS PARA POMODORO_SESSIONS
CREATE POLICY "Users can view own pomodoro sessions" ON public.pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pomodoro sessions" ON public.pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pomodoro sessions" ON public.pomodoro_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 11. REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- 12. INSERIR DADOS INICIAIS DE SUBJECTS (se não existirem)
INSERT INTO public.subjects (name, color, total_questions) VALUES
    ('Matemática', '#3B82F6', 0),
    ('Português', '#10B981', 0),
    ('História', '#F59E0B', 0),
    ('Geografia', '#EF4444', 0),
    ('Física', '#8B5CF6', 0),
    ('Química', '#06B6D4', 0),
    ('Biologia', '#84CC16', 0),
    ('Inglês', '#F97316', 0),
    ('Filosofia', '#EC4899', 0),
    ('Sociologia', '#6366F1', 0)
ON CONFLICT (name) DO NOTHING;

-- 13. VERIFICAR SE AS TABELAS FALTANTES EXISTEM
-- Se não existirem, criar as tabelas básicas

-- Criar tabela flashcards se não existir
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

-- Criar tabela flashcard_reviews se não existir
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 5),
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela goals se não existir
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

-- Criar tabela schedule_events se não existir
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

-- 14. APLICAR RLS NAS NOVAS TABELAS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

-- 15. CRIAR POLÍTICAS PARA AS NOVAS TABELAS
CREATE POLICY "Users can view own flashcards" ON public.flashcards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards" ON public.flashcards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards" ON public.flashcards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own flashcard reviews" ON public.flashcard_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcard reviews" ON public.flashcard_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own schedule events" ON public.schedule_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedule events" ON public.schedule_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule events" ON public.schedule_events
    FOR UPDATE USING (auth.uid() = user_id);

-- 16. MENSAGEM DE CONFIRMAÇÃO
SELECT 'Políticas RLS corrigidas com sucesso!' as status;



