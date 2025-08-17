-- Script de Teste de Sincronização Completa
-- Execute este script para verificar se o problema está no salvamento ou na sincronização

-- =====================================================
-- 1. VERIFICAR ESTADO ATUAL
-- =====================================================

-- Verificar tentativas atuais do usuário
SELECT 
    'ESTADO ATUAL' as tipo,
    COUNT(*) as total_tentativas,
    COUNT(CASE WHEN is_correct = true THEN 1 END) as acertos,
    COUNT(CASE WHEN is_correct = false THEN 1 END) as erros,
    ROUND(
        (COUNT(CASE WHEN is_correct = true THEN 1 END)::decimal / COUNT(*)::decimal) * 100, 
        2
    ) as taxa_acerto,
    MAX(attempted_at) as ultima_tentativa
FROM public.question_attempts
WHERE user_id = auth.uid();

-- =====================================================
-- 2. VERIFICAR QUESTÕES DISPONÍVEIS
-- =====================================================

-- Verificar questões que podem ser respondidas
SELECT 
    'QUESTÕES DISPONÍVEIS' as tipo,
    id as question_id,
    disciplina,
    correct_answer,
    opcao_a,
    opcao_b,
    opcao_c,
    opcao_d,
    opcao_e
FROM public.questions
WHERE correct_answer IS NOT NULL
AND (opcao_a IS NOT NULL OR opcao_b IS NOT NULL)
LIMIT 5;

-- =====================================================
-- 3. VERIFICAR SE HÁ TENTATIVAS DUPLICADAS
-- =====================================================

-- Verificar duplicatas por questão
SELECT 
    'DUPLICATAS' as tipo,
    question_id,
    COUNT(*) as tentativas,
    MIN(attempted_at) as primeira,
    MAX(attempted_at) as ultima
FROM public.question_attempts
WHERE user_id = auth.uid()
GROUP BY question_id
HAVING COUNT(*) > 1
ORDER BY tentativas DESC;

-- =====================================================
-- 4. VERIFICAR INTEGRIDADE DOS DADOS
-- =====================================================

-- Verificar dados inconsistentes
SELECT 
    'INTEGRIDADE' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN selected_answer IS NULL THEN 1 END) as sem_resposta,
    COUNT(CASE WHEN selected_answer NOT IN ('A', 'B', 'C', 'D', 'E') THEN 1 END) as resposta_invalida,
    COUNT(CASE WHEN is_correct IS NULL THEN 1 END) as sem_correcao,
    COUNT(CASE WHEN attempted_at IS NULL THEN 1 END) as sem_timestamp
FROM public.question_attempts
WHERE user_id = auth.uid();

-- =====================================================
-- 5. TESTE DE INSERÇÃO MANUAL (DESCOMENTE PARA TESTAR)
-- =====================================================

/*
-- Teste de inserção manual
DO $$
DECLARE
    test_question_id UUID;
    test_user_id UUID;
    test_answer VARCHAR(1);
    test_is_correct BOOLEAN;
BEGIN
    -- Pegar uma questão válida
    SELECT id INTO test_question_id FROM public.questions 
    WHERE correct_answer IS NOT NULL 
    LIMIT 1;
    
    -- Pegar usuário atual
    test_user_id := auth.uid();
    
    -- Definir resposta de teste (A = 0, B = 1, etc.)
    test_answer := 'A';
    test_is_correct := true; -- Assumir que A é a resposta correta
    
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
            test_is_correct,
            0,
            NOW()
        );
        
        RAISE NOTICE 'Inserção de teste realizada com sucesso';
        RAISE NOTICE 'question_id: %, user_id: %, answer: %, is_correct: %', 
            test_question_id, test_user_id, test_answer, test_is_correct;
    ELSE
        RAISE NOTICE 'Não foi possível realizar o teste: questão_id=%, user_id=%', 
            test_question_id, test_user_id;
    END IF;
END $$;
*/

-- =====================================================
-- 6. VERIFICAR ESTATÍSTICAS APÓS INSERÇÃO
-- =====================================================

-- Verificar estatísticas após possível inserção
SELECT 
    'ESTATÍSTICAS APÓS INSERÇÃO' as tipo,
    COUNT(*) as total_tentativas,
    COUNT(CASE WHEN is_correct = true THEN 1 END) as acertos,
    COUNT(CASE WHEN is_correct = false THEN 1 END) as erros,
    ROUND(
        (COUNT(CASE WHEN is_correct = true THEN 1 END)::decimal / COUNT(*)::decimal) * 100, 
        2
    ) as taxa_acerto,
    MAX(attempted_at) as ultima_tentativa
FROM public.question_attempts
WHERE user_id = auth.uid();

-- =====================================================
-- 7. VERIFICAR ÚLTIMAS TENTATIVAS
-- =====================================================

-- Verificar as últimas 5 tentativas
SELECT 
    'ÚLTIMAS TENTATIVAS' as tipo,
    qa.attempted_at,
    q.disciplina,
    qa.selected_answer,
    qa.is_correct,
    q.correct_answer as resposta_correta_questao
FROM public.question_attempts qa
JOIN public.questions q ON qa.question_id = q.id
WHERE qa.user_id = auth.uid()
ORDER BY qa.attempted_at DESC
LIMIT 5;

-- =====================================================
-- 8. VERIFICAR PERMISSÕES RLS
-- =====================================================

-- Verificar se o usuário pode inserir
SELECT 
    'PERMISSÕES' as tipo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.question_attempts 
            WHERE user_id = auth.uid() 
            LIMIT 1
        ) THEN 'PODE LER'
        ELSE 'NÃO PODE LER'
    END as permissao_leitura,
    auth.uid() as user_id,
    auth.role() as user_role;

-- =====================================================
-- 9. VERIFICAR CONSTRAINTS
-- =====================================================

-- Verificar constraints da tabela
SELECT 
    'CONSTRAINTS' as tipo,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.question_attempts'::regclass;

-- =====================================================
-- 10. RESUMO FINAL
-- =====================================================

SELECT 
    'RESUMO SINCRONIZAÇÃO' as tipo,
    'Teste de sincronização completa executado' as status,
    'Verifique se os números mudaram após responder uma questão' as observacao,
    NOW() as data_execucao;
