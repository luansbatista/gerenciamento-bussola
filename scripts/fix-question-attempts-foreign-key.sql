-- =====================================================
-- CORREÇÃO DA FOREIGN KEY DA TABELA question_attempts
-- =====================================================

-- 1. Remover a foreign key incorreta
ALTER TABLE public.question_attempts 
DROP CONSTRAINT IF EXISTS question_attempts_user_id_fkey;

-- 2. Adicionar a foreign key correta para auth.users
ALTER TABLE public.question_attempts 
ADD CONSTRAINT question_attempts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Verificar se a correção foi aplicada
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='question_attempts'
    AND kcu.column_name = 'user_id';




