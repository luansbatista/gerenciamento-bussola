-- Script de Teste de Sincronização de Estatísticas
-- Execute este script no Supabase SQL Editor para verificar a sincronização

-- =====================================================
-- 1. VERIFICAR DADOS ATUAIS
-- =====================================================

-- Verificar se o usuário tem tentativas
SELECT 
    'STATUS USUÁRIO' as tipo,
    CASE 
        WHEN COUNT(*) = 0 THEN 'Nenhuma tentativa encontrada'
        ELSE CONCAT(COUNT(*), ' tentativas encontradas')
    END as status,
    auth.uid() as user_id
FROM public.question_attempts
WHERE user_id = auth.uid();

-- Verificar tentativas do usuário atual
SELECT 
    'TENTATIVAS ATUAIS' as tipo,
    COUNT(*) as total_tentativas,
    COUNT(CASE WHEN is_correct = true THEN 1 END) as acertos,
    COUNT(CASE WHEN is_correct = false THEN 1 END) as erros,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
            (COUNT(CASE WHEN is_correct = true THEN 1 END)::decimal / COUNT(*)::decimal) * 100, 
            2
        )
    END as taxa_acerto
FROM public.question_attempts
WHERE user_id = auth.uid();

-- =====================================================
-- 2. VERIFICAR ESTATÍSTICAS DA SEMANA
-- =====================================================

-- Verificar tentativas da última semana
SELECT 
    'ESTATÍSTICAS SEMANA' as tipo,
    COUNT(*) as tentativas_semana,
    COUNT(CASE WHEN is_correct = true THEN 1 END) as acertos_semana,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
            (COUNT(CASE WHEN is_correct = true THEN 1 END)::decimal / COUNT(*)::decimal) * 100, 
            2
        )
    END as taxa_acerto_semana,
    ROUND(COUNT(*) * 2.0 / 60, 2) as horas_estimadas
FROM public.question_attempts
WHERE user_id = auth.uid()
AND attempted_at >= NOW() - INTERVAL '7 days';

-- =====================================================
-- 3. VERIFICAR QUESTÕES POR DISCIPLINA
-- =====================================================

-- Verificar tentativas por disciplina
SELECT 
    'TENTATIVAS POR DISCIPLINA' as tipo,
    q.disciplina,
    COUNT(*) as tentativas,
    COUNT(CASE WHEN qa.is_correct = true THEN 1 END) as acertos,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
            (COUNT(CASE WHEN qa.is_correct = true THEN 1 END)::decimal / COUNT(*)::decimal) * 100, 
            2
        )
    END as taxa_acerto
FROM public.question_attempts qa
JOIN public.questions q ON qa.question_id = q.id
WHERE qa.user_id = auth.uid()
GROUP BY q.disciplina
ORDER BY tentativas DESC;

-- =====================================================
-- 4. VERIFICAR ÚLTIMAS TENTATIVAS
-- =====================================================

-- Verificar as últimas 10 tentativas
SELECT 
    'ÚLTIMAS TENTATIVAS' as tipo,
    qa.attempted_at,
    q.disciplina,
    qa.selected_answer,
    qa.is_correct,
    q.question
FROM public.question_attempts qa
JOIN public.questions q ON qa.question_id = q.id
WHERE qa.user_id = auth.uid()
ORDER BY qa.attempted_at DESC
LIMIT 10;

-- =====================================================
-- 5. VERIFICAR INTEGRIDADE DOS DADOS
-- =====================================================

-- Verificar se há dados inconsistentes
SELECT 
    'VERIFICAÇÃO INTEGRIDADE' as tipo,
    COUNT(*) as total_tentativas,
    COUNT(CASE WHEN selected_answer IS NULL THEN 1 END) as sem_resposta,
    COUNT(CASE WHEN is_correct IS NULL THEN 1 END) as sem_correcao,
    COUNT(CASE WHEN question_id IS NULL THEN 1 END) as sem_questao,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as sem_usuario
FROM public.question_attempts
WHERE user_id = auth.uid();

-- =====================================================
-- 6. VERIFICAR PERFORMANCE
-- =====================================================

-- Verificar tempo médio entre tentativas
WITH time_diffs AS (
    SELECT 
        attempted_at,
        EXTRACT(EPOCH FROM (
            attempted_at - LAG(attempted_at) OVER (ORDER BY attempted_at)
        )) as time_diff_seconds
    FROM public.question_attempts
    WHERE user_id = auth.uid()
)
SELECT 
    'PERFORMANCE' as tipo,
    (SELECT COUNT(*) FROM public.question_attempts WHERE user_id = auth.uid()) as total_tentativas,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.question_attempts WHERE user_id = auth.uid()) <= 1 THEN 0
        ELSE ROUND(AVG(time_diff_seconds), 2)
    END as tempo_medio_segundos,
    (SELECT MIN(attempted_at) FROM public.question_attempts WHERE user_id = auth.uid()) as primeira_tentativa,
    (SELECT MAX(attempted_at) FROM public.question_attempts WHERE user_id = auth.uid()) as ultima_tentativa
FROM time_diffs
WHERE time_diff_seconds IS NOT NULL;

-- =====================================================
-- 7. TESTE DE INSERÇÃO (DESCOMENTE PARA TESTAR)
-- =====================================================

/*
-- Teste de inserção de uma nova tentativa
DO $$
DECLARE
    test_question_id UUID;
BEGIN
    -- Pegar uma questão válida
    SELECT id INTO test_question_id FROM public.questions LIMIT 1;
    
    -- Inserir tentativa de teste
    INSERT INTO public.question_attempts (
        user_id,
        question_id,
        selected_answer,
        is_correct,
        time_spent,
        attempted_at
    ) VALUES (
        auth.uid(),
        test_question_id,
        'A',
        true,
        0,
        NOW()
    );
    
    RAISE NOTICE 'Tentativa de teste inserida com sucesso';
END $$;
*/

-- =====================================================
-- 8. RESUMO FINAL
-- =====================================================

SELECT 
    'RESUMO SINCRONIZAÇÃO' as tipo,
    'Script de teste de sincronização executado' as status,
    'Verifique se os dados estão sendo atualizados corretamente' as observacao,
    NOW() as data_execucao;
