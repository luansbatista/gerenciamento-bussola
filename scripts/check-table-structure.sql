-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA QUESTIONS
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'questions';

-- 2. Verificar estrutura da tabela questions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'questions'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_questions FROM public.questions;

-- 4. Mostrar exemplo de dados (se houver)
SELECT * FROM public.questions LIMIT 1;



