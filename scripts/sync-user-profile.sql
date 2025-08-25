-- =====================================================
-- SINCRONIZAR PERFIL DO USUÁRIO
-- =====================================================

-- 1. Verificar o perfil existente
SELECT 
    id,
    email,
    full_name,
    role,
    is_admin,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'luansalescontact@gmail.com';

-- 2. Verificar se há usuário na tabela auth.users com este email
-- (Isso precisa ser feito via API do Supabase, não via SQL direto)

-- 3. Atualizar o perfil para garantir que está correto
UPDATE public.profiles 
SET 
    role = 'admin',
    is_admin = true,
    full_name = 'Luan Sales',
    updated_at = NOW()
WHERE email = 'luansalescontact@gmail.com';

-- 4. Verificar se a atualização foi bem-sucedida
SELECT 
    id,
    email,
    full_name,
    role,
    is_admin,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'luansalescontact@gmail.com';

-- 5. Verificar se há outros perfis que precisam ser corrigidos
SELECT 
    id,
    email,
    full_name,
    role,
    is_admin
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;



