-- Script para verificar se as disciplinas estão funcionando corretamente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todas as disciplinas cadastradas
SELECT '1. TODAS AS DISCIPLINAS CADASTRADAS:' as info;
SELECT 
    id,
    name,
    color,
    created_at
FROM public.subjects 
ORDER BY name;

-- 2. Verificar questões por disciplina
SELECT '2. QUESTÕES POR DISCIPLINA:' as info;
SELECT 
    s.id,
    s.name as disciplina,
    s.color,
    COUNT(q.id) as total_questoes
FROM public.subjects s
LEFT JOIN public.questions q ON s.id = q.subject_id
GROUP BY s.id, s.name, s.color
ORDER BY s.name;

-- 3. Disciplinas que NÃO têm questões
SELECT '3. DISCIPLINAS SEM QUESTÕES:' as info;
SELECT 
    s.id,
    s.name as disciplina,
    s.color
FROM public.subjects s
LEFT JOIN public.questions q ON s.id = q.subject_id
WHERE q.id IS NULL
ORDER BY s.name;

-- 4. Disciplinas que TÊM questões (o que deveria aparecer na aplicação)
SELECT '4. DISCIPLINAS COM QUESTÕES (DEVERIAM APARECER):' as info;
SELECT 
    s.id,
    s.name as disciplina,
    s.color,
    COUNT(q.id) as total_questoes
FROM public.subjects s
INNER JOIN public.questions q ON s.id = q.subject_id
GROUP BY s.id, s.name, s.color
ORDER BY s.name;

-- 5. Testar a consulta EXATA que a aplicação usa
SELECT '5. CONSULTA EXATA DA APLICAÇÃO:' as info;
SELECT 
    q.subject_id,
    s.name,
    s.color
FROM public.questions q
INNER JOIN public.subjects s ON q.subject_id = s.id
WHERE q.subject_id IS NOT NULL
GROUP BY q.subject_id, s.name, s.color
ORDER BY s.name;

-- 6. Resumo final
SELECT '6. RESUMO FINAL:' as info;
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
