-- =====================================================
-- CRIAR TRIGGER PARA SINCRONIZAR PERFIS AUTOMATICAMENTE
-- =====================================================

-- 1. Criar função para inserir perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_admin, avatar_url, study_goal, current_streak, total_study_hours)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    NEW.raw_user_meta_data->>'avatar_url',
    4, -- study_goal padrão
    0, -- current_streak padrão
    0  -- total_study_hours padrão
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger para executar a função quando um novo usuário for criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Verificar se a função foi criada
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 5. Testar inserção de perfil para usuário existente (se necessário)
-- INSERT INTO public.profiles (id, email, full_name, role, is_admin, study_goal, current_streak, total_study_hours)
-- VALUES (
--   '03e6e0e7-34cf-40c1-9a9d-a7192dbdcd16',
--   'luansalescontact@gmail.com',
--   'Luan Sales',
--   'admin',
--   true,
--   4,
--   0,
--   0
-- ) ON CONFLICT (id) DO UPDATE SET
--   role = EXCLUDED.role,
--   is_admin = EXCLUDED.is_admin,
--   full_name = EXCLUDED.full_name,
--   updated_at = NOW();




