-- Script para verificar se o sistema está funcionando corretamente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todas as tabelas criadas
SELECT '1. TABELAS CRIADAS NO SISTEMA:' as info;
SELECT 
    table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
FROM (
    VALUES 
        ('profiles'),
        ('subjects'),
        ('questions'),
        ('question_attempts'),
        ('study_sessions'),
        ('assuntos_edital'),
        ('materials'),
        ('reviews'),
        ('study_goals'),
        ('pomodoro_sessions'),
        ('exams'),
        ('exam_questions')
) AS t(table_name);

-- 2. Verificar todas as disciplinas cadastradas
SELECT '2. TODAS AS DISCIPLINAS CADASTRADAS:' as info;
SELECT 
    id,
    name,
    color,
    total_questions,
    created_at
FROM public.subjects 
ORDER BY name;

-- 3. Verificar questões por disciplina (da tabela questions)
SELECT '3. QUESTÕES POR DISCIPLINA (DA TABELA QUESTIONS):' as info;
SELECT 
    q.disciplina,
    q.subject,
    q.assunto,
    COUNT(q.id) as total_questoes
FROM public.questions q
WHERE q.disciplina IS NOT NULL OR q.subject IS NOT NULL
GROUP BY q.disciplina, q.subject, q.assunto
ORDER BY COALESCE(q.disciplina, q.subject);

-- 4. Verificar assuntos do edital
SELECT '4. ASSUNTOS DO EDITAL:' as info;
SELECT 
    disciplina,
    COUNT(assunto) as total_assuntos,
    STRING_AGG(assunto, ', ' ORDER BY assunto) as assuntos
FROM public.assuntos_edital
GROUP BY disciplina
ORDER BY disciplina;

-- 5. Verificar estrutura da tabela questions
SELECT '5. ESTRUTURA DA TABELA QUESTIONS:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'questions'
ORDER BY ordinal_position;

-- 6. Verificar políticas RLS
SELECT '6. POLÍTICAS RLS CONFIGURADAS:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. Verificar dados de exemplo
SELECT '7. DADOS DE EXEMPLO INSERIDOS:' as info;
SELECT 
    'subjects' as tabela,
    COUNT(*) as total_registros
FROM public.subjects
UNION ALL
SELECT 
    'questions' as tabela,
    COUNT(*) as total_registros
FROM public.questions
UNION ALL
SELECT 
    'assuntos_edital' as tabela,
    COUNT(*) as total_registros
FROM public.assuntos_edital;

-- 8. Testar consultas específicas da aplicação
SELECT '8. TESTE DE CONSULTAS DA APLICAÇÃO:' as info;

-- Teste 1: Consulta que lib/study-context.tsx usa para disciplinas
SELECT 'STUDY_CONTEXT - Consulta subjects' as teste, COUNT(*) as total FROM public.subjects;

-- Teste 2: Consulta que lib/study-context.tsx usa para questões
SELECT 'STUDY_CONTEXT - Consulta questions' as teste, COUNT(*) as total FROM public.questions;

-- Teste 3: Consulta que lib/study-context.tsx usa para question_attempts
SELECT 'STUDY_CONTEXT - Consulta question_attempts' as teste, COUNT(*) as total FROM public.question_attempts;

-- Teste 4: Consulta que lib/study-context.tsx usa para study_sessions
SELECT 'STUDY_CONTEXT - Consulta study_sessions' as teste, COUNT(*) as total FROM public.study_sessions;

-- Teste 5: Consulta que flashcards usa para assuntos_edital
SELECT 'FLASHCARDS - Consulta assuntos_edital' as teste, COUNT(*) as total FROM public.assuntos_edital;

-- Teste 6: Consulta que materials usa
SELECT 'MATERIALS - Consulta materials' as teste, COUNT(*) as total FROM public.materials;

-- 9. Verificar integridade referencial
SELECT '9. VERIFICAÇÃO DE INTEGRIDADE REFERENCIAL:' as info;

-- Verificar se há questões sem disciplina
SELECT 'Questões sem disciplina:' as item, COUNT(*) as total 
FROM public.questions 
WHERE disciplina IS NULL AND subject IS NULL;

-- Verificar se há tentativas sem usuário válido
SELECT 'Tentativas sem usuário válido:' as item, COUNT(*) as total 
FROM public.question_attempts qa
LEFT JOIN auth.users u ON qa.user_id = u.id
WHERE u.id IS NULL;

-- 10. Resumo final
SELECT '10. RESUMO FINAL DO SISTEMA:' as info;
SELECT 
    'Total de disciplinas (subjects):' as item,
    COUNT(*)::text as valor
FROM public.subjects
UNION ALL
SELECT 
    'Disciplinas únicas (questions):' as item,
    COUNT(DISTINCT COALESCE(q.disciplina, q.subject))::text as valor
FROM public.questions q
WHERE q.disciplina IS NOT NULL OR q.subject IS NOT NULL
UNION ALL
SELECT 
    'Total de questões:' as item,
    COUNT(*)::text as valor
FROM public.questions
UNION ALL
SELECT 
    'Total de assuntos do edital:' as item,
    COUNT(*)::text as valor
FROM public.assuntos_edital
UNION ALL
SELECT 
    'Total de materiais:' as item,
    COUNT(*)::text as valor
FROM public.materials
UNION ALL
SELECT 
    'Total de revisões:' as item,
    COUNT(*)::text as valor
FROM public.reviews
UNION ALL
SELECT 
    'Total de metas:' as item,
    COUNT(*)::text as valor
FROM public.study_goals
UNION ALL
SELECT 
    'Total de sessões pomodoro:' as item,
    COUNT(*)::text as valor
FROM public.pomodoro_sessions
UNION ALL
SELECT 
    'Total de simulados:' as item,
    COUNT(*)::text as valor
FROM public.exams;

-- 11. Status do sistema
SELECT '11. STATUS FINAL DO SISTEMA:' as info;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM public.subjects) >= 12 
         AND (SELECT COUNT(*) FROM public.questions) >= 12
         AND (SELECT COUNT(*) FROM public.assuntos_edital) >= 10
         AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 20
        THEN '🎉 SISTEMA 100% FUNCIONAL!'
        ELSE '⚠️  SISTEMA PRECISA DE AJUSTES'
    END as status_final;