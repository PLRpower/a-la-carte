-- Fix Search Path Mutable warning for SECURITY DEFINER functions

-- 1. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. has_role
CREATE OR REPLACE FUNCTION public.has_role(role_to_check app_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = (select auth.uid())
      AND role = role_to_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 3. get_user_family_ids
CREATE OR REPLACE FUNCTION public.get_user_family_ids(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM family_members WHERE user_id = user_uuid;
$$;

-- 4. get_user_admin_family_ids
CREATE OR REPLACE FUNCTION public.get_user_admin_family_ids(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM family_members WHERE user_id = user_uuid AND role = 'admin';
$$;

-- 5. add_family_member_by_email
CREATE OR REPLACE FUNCTION public.add_family_member_by_email(p_email TEXT, p_family_id UUID)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_is_member BOOLEAN;
BEGIN
  -- Check if the current user is a member of this family
  SELECT EXISTS (
    SELECT 1 FROM public.family_members WHERE family_id = p_family_id AND user_id = auth.uid()
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;