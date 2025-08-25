-- =====================================================
-- FORÇAR ATUALIZAÇÃO DO USUÁRIO COMO ADMIN
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. ATUALIZAR TODOS OS USUÁRIOS COMO ADMIN
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

-- 4. MOSTRAR TODOS OS USUÁRIOS
SELECT 
    id,
    full_name,
    email,
    role,
    is_admin,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- 5. MENSAGEM DE SUCESSO
SELECT '✅ USUÁRIO ATUALIZADO COMO ADMIN!' as status;




