-- Teste Rápido de Estatísticas
-- Execute este script antes e depois de responder uma questão

-- 1. VERIFICAR ESTADO ATUAL
SELECT 
    'ANTES' as momento,
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

-- 2. VERIFICAR ÚLTIMA TENTATIVA
SELECT 
    'ÚLTIMA TENTATIVA' as tipo,
    attempted_at,
    selected_answer,
    is_correct,
    question_id
FROM public.question_attempts
WHERE user_id = auth.uid()
ORDER BY attempted_at DESC
LIMIT 1;

-- 3. VERIFICAR SE HÁ QUESTÕES DISPONÍVEIS
SELECT 
    'QUESTÕES DISPONÍVEIS' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN correct_answer IS NOT NULL THEN 1 END) as com_resposta
FROM public.questions
LIMIT 1;
