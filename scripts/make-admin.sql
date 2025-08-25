-- =====================================================
-- TORNAR USUÁRIO ADMINISTRADOR
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. ATUALIZAR SEU PERFIL PARA ADMIN
-- Substitua 'SEU_EMAIL_AQUI' pelo seu email real
UPDATE public.profiles 
SET 
    role = 'admin',
    is_admin = true
WHERE email = 'SEU_EMAIL_AQUI';

-- 3. VERIFICAR SE FOI ATUALIZADO
SELECT 
    id,
    full_name,
    email,
    role,
    is_admin,
    created_at
FROM public.profiles 
WHERE email = 'SEU_EMAIL_AQUI';

-- 4. MENSAGEM DE SUCESSO
SELECT '✅ USUÁRIO TORNADO ADMINISTRADOR!' as status;

-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 1. Substitua 'SEU_EMAIL_AQUI' pelo seu email real
-- 2. Execute este script no SQL Editor do Supabase
-- 3. Faça logout e login novamente no sistema
-- 4. O menu Admin aparecerá no sidebar
