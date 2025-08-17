-- Script de Diagnóstico Específico para Question Attempts
-- Execute este script para identificar problemas que causam erro ao salvar respostas

-- =====================================================
-- 1. VERIFICAR ESTRUTURA DA TABELA
-- =====================================================

-- Verificar estrutura da tabela question_attempts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'question_attempts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. VERIFICAR CONSTRAINTS E ÍNDICES
-- =====================================================

-- Verificar constraints da tabela
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.question_attempts'::regclass;

-- Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'question_attempts';

-- =====================================================
-- 3. VERIFICAR RLS POLICIES
-- =====================================================

-- Verificar políticas RLS
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
WHERE tablename = 'question_attempts';

-- =====================================================
-- 4. VERIFICAR DADOS EXISTENTES
-- =====================================================

-- Contar tentativas do usuário atual
SELECT 
    'TENTATIVAS USUÁRIO ATUAL' as tipo,
    COUNT(*) as total_tentativas,
    COUNT(DISTINCT question_id) as questoes_unicas,
    MIN(attempted_at) as primeira_tentativa,
    MAX(attempted_at) as ultima_tentativa
FROM public.question_attempts
WHERE user_id = auth.uid();

-- Verificar tipos de dados nas colunas
SELECT 
    'TIPOS DE DADOS' as tipo,
    selected_answer,
    CASE 
        WHEN selected_answer IS NULL THEN 'NULL'
        WHEN selected_answer ~ '^[A-E]$' THEN 'LETRA_VALIDA'
        WHEN selected_answer ~ '^[0-9]+$' THEN 'NUMERO'
        ELSE 'OUTRO'
    END as tipo_dado,
    COUNT(*) as quantidade
FROM public.question_attempts
WHERE user_id = auth.uid()
GROUP BY selected_answer, 
    CASE 
        WHEN selected_answer IS NULL THEN 'NULL'
        WHEN selected_answer ~ '^[A-E]$' THEN 'LETRA_VALIDA'
        WHEN selected_answer ~ '^[0-9]+$' THEN 'NUMERO'
        ELSE 'OUTRO'
    END
ORDER BY quantidade DESC;

-- =====================================================
-- 5. VERIFICAR INTEGRIDADE REFERENCIAL
-- =====================================================

-- Verificar se há tentativas com question_id inválido
SELECT 
    'TENTATIVAS COM QUESTÃO INVÁLIDA' as tipo,
    qa.question_id,
    qa.user_id,
    qa.attempted_at
FROM public.question_attempts qa
LEFT JOIN public.questions q ON qa.question_id = q.id
WHERE qa.user_id = auth.uid()
AND q.id IS NULL;

-- Verificar se há tentativas com user_id inválido
SELECT 
    'TENTATIVAS COM USUÁRIO INVÁLIDO' as tipo,
    qa.user_id,
    qa.question_id,
    qa.attempted_at
FROM public.question_attempts qa
LEFT JOIN auth.users u ON qa.user_id = u.id
WHERE qa.user_id = auth.uid()
AND u.id IS NULL;

-- =====================================================
-- 6. VERIFICAR PROBLEMAS ESPECÍFICOS
-- =====================================================

-- Verificar tentativas com dados inconsistentes
SELECT 
    'DADOS INCONSISTENTES' as tipo,
    COUNT(*) as total_tentativas,
    COUNT(CASE WHEN selected_answer IS NULL THEN 1 END) as sem_resposta,
    COUNT(CASE WHEN selected_answer NOT IN ('A', 'B', 'C', 'D', 'E') THEN 1 END) as resposta_invalida,
    COUNT(CASE WHEN is_correct IS NULL THEN 1 END) as sem_correcao,
    COUNT(CASE WHEN attempted_at IS NULL THEN 1 END) as sem_timestamp
FROM public.question_attempts
WHERE user_id = auth.uid();

-- Verificar duplicatas (mesma questão, mesmo usuário)
SELECT 
    'POSSÍVEIS DUPLICATAS' as tipo,
    question_id,
    COUNT(*) as tentativas,
    MIN(attempted_at) as primeira_tentativa,
    MAX(attempted_at) as ultima_tentativa
FROM public.question_attempts
WHERE user_id = auth.uid()
GROUP BY question_id
HAVING COUNT(*) > 1
ORDER BY tentativas DESC;

-- =====================================================
-- 7. TESTE DE PERMISSÕES
-- =====================================================

-- Verificar se o usuário pode inserir
SELECT 
    'TESTE INSERÇÃO' as tipo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.question_attempts 
            WHERE user_id = auth.uid() 
            LIMIT 1
        ) THEN 'PODE LER'
        ELSE 'NÃO PODE LER'
    END as permissao_leitura,
    auth.uid() as user_id;

-- =====================================================
-- 8. VERIFICAR QUESTÕES DISPONÍVEIS
-- =====================================================

-- Verificar questões disponíveis para teste
SELECT 
    'QUESTÕES DISPONÍVEIS' as tipo,
    COUNT(*) as total_questoes,
    COUNT(CASE WHEN correct_answer IS NOT NULL THEN 1 END) as com_resposta_correta,
    COUNT(CASE WHEN opcao_a IS NOT NULL AND opcao_a != '' THEN 1 END) as com_opcao_a,
    COUNT(CASE WHEN opcao_b IS NOT NULL AND opcao_b != '' THEN 1 END) as com_opcao_b
FROM public.questions
LIMIT 1;

-- =====================================================
-- 9. TESTE DE INSERÇÃO MANUAL (DESCOMENTE PARA TESTAR)
-- =====================================================

/*
-- Teste de inserção manual
DO $$
DECLARE
    test_question_id UUID;
    test_user_id UUID;
    test_answer VARCHAR(1);
BEGIN
    -- Pegar uma questão válida
    SELECT id INTO test_question_id FROM public.questions LIMIT 1;
    
    -- Pegar usuário atual
    test_user_id := auth.uid();
    
    -- Definir resposta de teste
    test_answer := 'A';
    
    -- Tentar inserir
    IF test_question_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        INSERT INTO public.question_attempts (
            user_id,
            question_id,
            selected_answer,
            is_correct,
            time_spent,
            attempted_at
        ) VALUES (
            test_user_id,
            test_question_id,
            test_answer,
            true,
            0,
            NOW()
        );
        
        RAISE NOTICE 'Inserção de teste realizada com sucesso';
        
        -- Limpar o teste
        DELETE FROM public.question_attempts 
        WHERE user_id = test_user_id 
        AND question_id = test_question_id 
        AND selected_answer = test_answer;
        
        RAISE NOTICE 'Teste limpo com sucesso';
    ELSE
        RAISE NOTICE 'Não foi possível realizar o teste: questão_id=%, user_id=%', test_question_id, test_user_id;
    END IF;
END $$;
*/

-- =====================================================
-- 10. RESUMO FINAL
-- =====================================================

SELECT 
    'RESUMO DIAGNÓSTICO' as tipo,
    'Diagnóstico de question_attempts executado' as status,
    'Verifique os resultados acima para identificar problemas' as observacao,
    NOW() as data_execucao;
