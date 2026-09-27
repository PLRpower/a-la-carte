-- Granular Recipe Sharing: Private, Family, Public
-- Migration: 20260404000000_granular_recipe_sharing.sql

-- 1. Add granular sharing columns to recipes table
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS is_shared_with_family BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS recipes_is_shared_with_family_idx ON public.recipes(is_shared_with_family);
CREATE INDEX IF NOT EXISTS recipes_is_public_idx ON public.recipes(is_public);

-- 2. Helper computed column function to check if a recipe belongs to the caller's carnet (author OR family-shared)
CREATE OR REPLACE FUNCTION public.in_my_carnet(r public.recipes)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT (r.user_id = (SELECT auth.uid()))
     OR (r.is_shared_with_family = true AND public.is_in_same_family(r.user_id));
$$;

-- 3. Update RLS policies on recipes table
DROP POLICY IF EXISTS "Users can view shared recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view public or family recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view own or family recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Users can view recipes" ON public.recipes;

CREATE POLICY "Users can view recipes" ON public.recipes
FOR SELECT TO public
USING (
  is_public = true
  OR user_id = (SELECT auth.uid())
  OR (is_shared_with_family = true AND public.is_in_same_family(user_id))
);

DROP POLICY IF EXISTS "Users can update shared recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update own or family recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update own recipes or shared family recipes" ON public.recipes;

CREATE POLICY "Users can update own recipes or shared family recipes" ON public.recipes
FOR UPDATE TO public
USING (
  user_id = (SELECT auth.uid())
  OR (is_shared_with_family = true AND public.is_in_same_family(user_id))
);

DROP POLICY IF EXISTS "Users can delete shared recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete own or family recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete own recipes or shared family recipes" ON public.recipes;

CREATE POLICY "Users can delete own recipes or shared family recipes" ON public.recipes
FOR DELETE TO public
USING (
  user_id = (SELECT auth.uid())
  OR (is_shared_with_family = true AND public.is_in_same_family(user_id))
);

-- 4. Update RLS policies on recipe_ingredients
DROP POLICY IF EXISTS "Users can view ingredients for accessible recipes" ON public.recipe_ingredients;
CREATE POLICY "Users can view ingredients for accessible recipes" ON public.recipe_ingredients
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_ingredients.recipe_id
    AND (
      r.is_public = true
      OR r.user_id = (SELECT auth.uid())
      OR (r.is_shared_with_family = true AND public.is_in_same_family(r.user_id))
    )
  )
);

DROP POLICY IF EXISTS "Users can insert ingredients for shared recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can insert ingredients for own or family recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can insert ingredients for own or shared family recipes" ON public.recipe_ingredients;

CREATE POLICY "Users can insert ingredients for own or shared family recipes" ON public.recipe_ingredients
FOR INSERT TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_ingredients.recipe_id
    AND (
      r.user_id = (SELECT auth.uid())
      OR (r.is_shared_with_family = true AND public.is_in_same_family(r.user_id))
    )
  )
);

DROP POLICY IF EXISTS "Users can update ingredients for shared recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can update ingredients for own or family recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can update ingredients for own or shared family recipes" ON public.recipe_ingredients;

CREATE POLICY "Users can update ingredients for own or shared family recipes" ON public.recipe_ingredients
FOR UPDATE TO public
USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_ingredients.recipe_id
    AND (
      r.user_id = (SELECT auth.uid())
      OR (r.is_shared_with_family = true AND public.is_in_same_family(r.user_id))
    )
  )
);

DROP POLICY IF EXISTS "Users can delete ingredients for shared recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can delete ingredients for own or family recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can delete ingredients for own or shared family recipes" ON public.recipe_ingredients;

CREATE POLICY "Users can delete ingredients for own or shared family recipes" ON public.recipe_ingredients
FOR DELETE TO public
USING (
  EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = recipe_ingredients.recipe_id
    AND (
      r.user_id = (SELECT auth.uid())
      OR (r.is_shared_with_family = true AND public.is_in_same_family(r.user_id))
    )
  )
);
