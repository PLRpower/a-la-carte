-- 1. Unindexed foreign keys
CREATE INDEX IF NOT EXISTS family_members_user_id_idx ON public.family_members(user_id);

-- 2. Function Search Path Mutable
CREATE OR REPLACE FUNCTION public.add_family_member_by_email(p_email text, p_family_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public, auth
AS $function$
DECLARE
  v_user_id UUID;
  v_is_member BOOLEAN;
BEGIN
  -- Check if the current user is a member of this family
  SELECT EXISTS (
    SELECT 1 FROM public.family_members WHERE family_id = p_family_id AND user_id = (SELECT auth.uid())
  ) INTO v_is_member;
  
  IF NOT v_is_member THEN
    RAISE EXCEPTION 'You must be a member of the family to add others.';
  END IF;

  -- Find target user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with this email.';
  END IF;

  -- Insert into family_members
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (p_family_id, v_user_id, 'member')
  ON CONFLICT DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_family(p_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public, auth
AS $function$
DECLARE
  v_family_id UUID;
BEGIN
  INSERT INTO public.families (name) VALUES (p_name) RETURNING id INTO v_family_id;
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (v_family_id, (SELECT auth.uid()), 'admin');
  RETURN v_family_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_in_same_family(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public, auth
AS $function$
BEGIN
  RETURN target_user_id = (SELECT auth.uid()) OR EXISTS (
    SELECT 1 FROM public.family_members f1
    JOIN public.family_members f2 ON f1.family_id = f2.family_id
    WHERE f1.user_id = (SELECT auth.uid()) AND f2.user_id = target_user_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.join_family_with_code(p_share_code uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public, auth
AS $function$
DECLARE
  v_family_id UUID;
BEGIN
  SELECT id INTO v_family_id FROM public.families WHERE share_code = p_share_code;
  IF v_family_id IS NOT NULL THEN
    INSERT INTO public.family_members (family_id, user_id, role)
    VALUES (v_family_id, (SELECT auth.uid()), 'member')
    ON CONFLICT DO NOTHING;
  ELSE
    RAISE EXCEPTION 'Invalid share code';
  END IF;
END;
$function$;

-- 3 & 4. Auth RLS & Multiple Permissive Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert own stock" ON public.stock;
    DROP POLICY IF EXISTS "Users can insert own shopping list" ON public.shopping_list;
    DROP POLICY IF EXISTS "Users can insert own recipes" ON public.recipes;
    DROP POLICY IF EXISTS "Users can view members of their families" ON public.family_members;
    DROP POLICY IF EXISTS "Users can view their families" ON public.families;
    DROP POLICY IF EXISTS "Users can update their families" ON public.families;
    DROP POLICY IF EXISTS "Users can delete their families" ON public.families;
    DROP POLICY IF EXISTS "Admins or users themselves can delete members" ON public.family_members;

    DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
    DROP POLICY IF EXISTS "Users can view own or family recipes" ON public.recipes;
    DROP POLICY IF EXISTS "Users can view public or family recipes" ON public.recipes;
END $$;

CREATE POLICY "Users can insert own stock" ON public.stock
FOR INSERT TO public WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own shopping list" ON public.shopping_list
FOR INSERT TO public WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own recipes" ON public.recipes
FOR INSERT TO public WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view public or family recipes" ON public.recipes
FOR SELECT TO public USING (is_public = true OR is_in_same_family(user_id));

CREATE POLICY "Users can view members of their families" ON public.family_members
FOR SELECT TO public USING (family_id IN (SELECT get_user_family_ids((SELECT auth.uid()))));

CREATE POLICY "Admins or users themselves can delete members" ON public.family_members
FOR DELETE TO public USING (user_id = (SELECT auth.uid()) OR family_id IN (SELECT get_user_admin_family_ids((SELECT auth.uid()))));

CREATE POLICY "Users can view their families" ON public.families
FOR SELECT TO public USING (id IN (SELECT get_user_family_ids((SELECT auth.uid()))));

CREATE POLICY "Users can update their families" ON public.families
FOR UPDATE TO public USING (id IN (SELECT get_user_admin_family_ids((SELECT auth.uid()))));

CREATE POLICY "Users can delete their families" ON public.families
FOR DELETE TO public USING (id IN (SELECT get_user_admin_family_ids((SELECT auth.uid()))));
