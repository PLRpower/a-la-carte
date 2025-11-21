-- Create a secure function to handle ingredient creation
-- This bypasses RLS issues by running as security definer (admin privileges)

CREATE OR REPLACE FUNCTION public.get_or_create_ingredient(
  _name text,
  _category ingredient_category DEFAULT 'other'
)
RETURNS SETOF public.ingredients
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_ingredient public.ingredients;
BEGIN
  -- 1. Try to find existing ingredient (case-insensitive)
  SELECT * INTO found_ingredient
  FROM public.ingredients
  WHERE name ILIKE _name
  LIMIT 1;

  IF found_ingredient.id IS NOT NULL THEN
    RETURN NEXT found_ingredient;
    RETURN;
  END IF;

  -- 2. If not found, insert new one
  RETURN QUERY
  INSERT INTO public.ingredients (name, category)
  VALUES (_name, _category)
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name -- Handle race condition by doing a dummy update
  RETURNING *;
  
  -- If the insert didn't return anything (because of race condition on conflict), fetch again
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT *
    FROM public.ingredients
    WHERE name ILIKE _name
    LIMIT 1;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_or_create_ingredient(text, ingredient_category) TO authenticated;
