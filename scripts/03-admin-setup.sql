-- Admin Setup for PMBA Study System
-- Execute this script in Supabase SQL Editor

-- Add admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add admin role to auth.users metadata
-- This function will be called when a user is created
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user metadata contains admin role
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        UPDATE public.profiles 
        SET is_admin = TRUE 
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for admin role
DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
CREATE TRIGGER on_admin_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user();

-- Function to set user as admin
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    -- Update profiles table
    UPDATE public.profiles 
    SET is_admin = TRUE 
    WHERE id = user_id;
    
    -- Update auth.users metadata
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin", "isAdmin": true}'::jsonb
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove admin from user
CREATE OR REPLACE FUNCTION public.remove_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    -- Update profiles table
    UPDATE public.profiles 
    SET is_admin = FALSE 
    WHERE id = user_id;
    
    -- Update auth.users metadata
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'role' - 'isAdmin'
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy for admin access
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE is_admin = TRUE
        )
    );

-- Admin can view all data (for admin dashboard)
CREATE POLICY "Admins can view all subjects" ON public.subjects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all questions" ON public.questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all flashcards" ON public.flashcards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all study goals" ON public.study_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all exams" ON public.exams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Grant admin permissions to service role for admin functions
GRANT EXECUTE ON FUNCTION public.set_user_as_admin(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.remove_user_admin(TEXT) TO service_role;
