-- Script para inserir questões para disciplinas que não têm
-- Execute este script no Supabase SQL Editor

-- 1. Verificar disciplinas que não têm questões
SELECT '1. DISCIPLINAS SEM QUESTÕES:' as info;
SELECT 
    s.id,
    s.name as disciplina
FROM public.subjects s
LEFT JOIN public.questions q ON s.id = q.subject_id
WHERE q.id IS NULL
ORDER BY s.name;

-- 2. Inserir questões para disciplinas que não têm
DO $$
DECLARE
    subject_record RECORD;
BEGIN
    -- Loop através de todas as disciplinas que não têm questões
    FOR subject_record IN 
        SELECT s.id, s.name
        FROM public.subjects s
        LEFT JOIN public.questions q ON s.id = q.subject_id
        WHERE q.id IS NULL
    LOOP
        -- Inserir questão simples
        INSERT INTO public.questions (subject_id)
        VALUES (subject_record.id);
        
        RAISE NOTICE 'Questão inserida para a disciplina: %', subject_record.name;
    END LOOP;
    
    RAISE NOTICE 'Processo concluído!';
END $$;

-- 3. Verificar disciplinas após inserção
SELECT '3. DISCIPLINAS APÓS INSERÇÃO:' as info;
SELECT 
    s.name as disciplina,
    COUNT(q.id) as total_questoes
FROM public.subjects s
LEFT JOIN public.questions q ON s.id = q.subject_id
GROUP BY s.id, s.name
ORDER BY s.name;

-- 4. Testar consulta da aplicação
SELECT '4. CONSULTA DA APLICAÇÃO:' as info;
SELECT 
    q.subject_id,
    s.name,
    s.color
FROM public.questions q
INNER JOIN public.subjects s ON q.subject_id = s.id
WHERE q.subject_id IS NOT NULL
GROUP BY q.subject_id, s.name, s.color
ORDER BY s.name;

-- 5. Resumo final
SELECT '5. RESUMO FINAL:' as info;
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
