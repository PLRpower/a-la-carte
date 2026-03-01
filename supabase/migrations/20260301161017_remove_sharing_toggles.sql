-- Drop columns from profiles since they are no longer used
ALTER TABLE public.profiles DROP COLUMN IF EXISTS share_recipes;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS share_stock;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS share_shopping_list;

-- Drop legacy is_public column from recipes
ALTER TABLE public.recipes DROP COLUMN IF EXISTS is_public;

-- Redefine helper function to ALWAYS share with family, regardless of item type
CREATE OR REPLACE FUNCTION public.is_shared_with_me(item_owner_id uuid, item_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, auth
AS $$
BEGIN
  IF item_owner_id = (SELECT auth.uid()) THEN
    RETURN true;
  END IF;

  IF public.is_in_same_family(item_owner_id) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
