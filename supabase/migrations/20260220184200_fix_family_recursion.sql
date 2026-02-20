-- Fix infinite recursion in family_members policies

-- Drop existing infinite-recursion policies
DROP POLICY IF EXISTS "Users can view their families" ON public.families;
DROP POLICY IF EXISTS "Users can update their families" ON public.families;
DROP POLICY IF EXISTS "Users can delete their families" ON public.families;
DROP POLICY IF EXISTS "Users can view members of their families" ON public.family_members;
DROP POLICY IF EXISTS "Admins or users themselves can delete members" ON public.family_members;

-- Create security definer functions to bypass RLS when checking membership
CREATE OR REPLACE FUNCTION get_user_family_ids(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM family_members WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION get_user_admin_family_ids(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM family_members WHERE user_id = user_uuid AND role = 'admin';
$$;

-- Families policies
CREATE POLICY "Users can view their families" ON public.families
    FOR SELECT USING (id IN (SELECT get_user_family_ids(auth.uid())));

CREATE POLICY "Users can update their families" ON public.families
    FOR UPDATE USING (id IN (SELECT get_user_admin_family_ids(auth.uid())));

CREATE POLICY "Users can delete their families" ON public.families
    FOR DELETE USING (id IN (SELECT get_user_admin_family_ids(auth.uid())));

-- Family members policies
CREATE POLICY "Users can view members of their families" ON public.family_members
    FOR SELECT USING (family_id IN (SELECT get_user_family_ids(auth.uid())));

CREATE POLICY "Admins or users themselves can delete members" ON public.family_members
    FOR DELETE USING (
        user_id = auth.uid() OR
        family_id IN (SELECT get_user_admin_family_ids(auth.uid()))
    );
