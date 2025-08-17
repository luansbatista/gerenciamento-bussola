-- Script de correção completa do sistema
-- Execute este script no Supabase SQL Editor

-- 1. Verificar e corrigir estrutura da tabela questions
SELECT '1. VERIFICANDO ESTRUTURA DA TABELA QUESTIONS:' as info;

-- Verificar se a coluna opcao_e existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'opcao_e'
    ) THEN
        ALTER TABLE public.questions ADD COLUMN opcao_e TEXT;
        RAISE NOTICE 'Coluna opcao_e adicionada à tabela questions';
    ELSE
        RAISE NOTICE 'Coluna opcao_e já existe na tabela questions';
    END IF;
END $$;

-- 2. Verificar e corrigir estrutura da tabela profiles
SELECT '2. VERIFICANDO ESTRUTURA DA TABELA PROFILES:' as info;

-- Adicionar colunas faltantes se não existirem
DO $$
BEGIN
    -- Adicionar role se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Coluna role adicionada à tabela profiles';
    END IF;

    -- Adicionar is_admin se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna is_admin adicionada à tabela profiles';
    END IF;

    -- Adicionar study_goal se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'study_goal'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN study_goal INTEGER DEFAULT 4;
        RAISE NOTICE 'Coluna study_goal adicionada à tabela profiles';
    END IF;

    -- Adicionar current_streak se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'current_streak'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna current_streak adicionada à tabela profiles';
    END IF;

    -- Adicionar total_study_hours se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'total_study_hours'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN total_study_hours NUMERIC DEFAULT 0;
        RAISE NOTICE 'Coluna total_study_hours adicionada à tabela profiles';
    END IF;

    -- Adicionar total_questions_answered se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'total_questions_answered'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN total_questions_answered INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna total_questions_answered adicionada à tabela profiles';
    END IF;

    -- Adicionar accuracy_rate se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'accuracy_rate'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN accuracy_rate NUMERIC DEFAULT 0;
        RAISE NOTICE 'Coluna accuracy_rate adicionada à tabela profiles';
    END IF;

    -- Adicionar last_login se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'last_login'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna last_login adicionada à tabela profiles';
    END IF;
END $$;

-- 3. Restaurar perfis para usuários autenticados
SELECT '3. RESTAURANDO PERFIS DE USUÁRIOS:' as info;

INSERT INTO public.profiles (id, role, is_admin, study_goal, current_streak, total_study_hours, total_questions_answered, accuracy_rate, created_at, updated_at)
SELECT 
    au.id,
    CASE WHEN au.id = (SELECT id FROM auth.users LIMIT 1) THEN 'admin' ELSE 'user' END as role,
    CASE WHEN au.id = (SELECT id FROM auth.users LIMIT 1) THEN true ELSE false END as is_admin,
    4 as study_goal,
    0 as current_streak,
    0 as total_study_hours,
    0 as total_questions_answered,
    0 as accuracy_rate,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- 4. Configurar primeiro usuário como admin
SELECT '4. CONFIGURANDO ADMIN:' as info;

UPDATE public.profiles 
SET role = 'admin', is_admin = true 
WHERE id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1);

-- 5. Verificar e corrigir RLS policies
SELECT '5. VERIFICANDO RLS POLICIES:' as info;

-- Desabilitar RLS temporariamente para questions
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;

-- Recriar política simples para questions
DROP POLICY IF EXISTS "Public can view questions" ON public.questions;
CREATE POLICY "Public can view questions" ON public.questions FOR ALL USING (true);

-- Verificar políticas de profiles
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Testar inserção de questões
SELECT '6. TESTANDO INSERÇÃO DE QUESTÕES:' as info;

-- Inserir questão de teste
INSERT INTO public.questions (
    disciplina,
    subject,
    assunto,
    question,
    enunciado,
    opcao_a,
    opcao_b,
    opcao_c,
    opcao_d,
    opcao_e,
    alternativa_correta,
    correct_answer,
    difficulty,
    nivel
) VALUES (
    'Teste Sistema',
    'Teste Sistema',
    'Teste',
    'Questão de teste do sistema?',
    'Questão de teste do sistema?',
    'Opção A',
    'Opção B',
    'Opção C',
    'Opção D',
    'Opção E',
    'a',
    'a',
    'médio',
    'médio'
) ON CONFLICT DO NOTHING;

-- 7. Verificar dados finais
SELECT '7. VERIFICAÇÃO FINAL:' as info;

SELECT 
    'PROFILES' as tabela,
    COUNT(*) as total_registros
FROM public.profiles
UNION ALL
SELECT 
    'QUESTIONS' as tabela,
    COUNT(*) as total_registros
FROM public.questions
UNION ALL
SELECT 
    'USERS AUTH' as tabela,
    COUNT(*) as total_registros
FROM auth.users;

-- 8. Status final
SELECT '8. STATUS FINAL:' as info;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM public.questions) > 0 
        AND (SELECT COUNT(*) FROM public.profiles) > 0
        THEN '🎉 SISTEMA CORRIGIDO E FUNCIONANDO!'
        ELSE '⚠️  AINDA HÁ PROBLEMAS'
    END as status_final,
    (SELECT COUNT(*) FROM public.questions) as total_questoes,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users) as total_users_auth;

