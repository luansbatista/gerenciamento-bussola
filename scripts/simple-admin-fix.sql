-- =====================================================
-- SOLUÇÃO SIMPLES - TORNAR ADMIN
-- =====================================================

-- 1. VERIFICAR USUÁRIOS ATUAIS
SELECT 
    id,
    full_name,
    email,
    role,
    is_admin,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 2. ATUALIZAR USUÁRIO COMO ADMIN
UPDATE public.profiles 
SET 
    role = 'admin',
    is_admin = true
WHERE email = 'luansalescontact@gmail.com';

-- 3. VERIFICAR SE FOI ATUALIZADO
SELECT 
    id,
    full_name,
    email,
    role,
    is_admin,
    created_at
FROM public.profiles 
WHERE email = 'luansalescontact@gmail.com';

-- 4. MENSAGEM DE SUCESSO
SELECT '✅ ADMIN ATIVADO!' as status;



