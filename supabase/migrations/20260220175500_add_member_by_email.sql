-- Function to add a family member by email
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
