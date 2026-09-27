-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile
-- Fix ingredients SELECT policy to allow public (anon + authenticated) access
-- This ensures ingredients and their images can be fetched on app boot and in demo mode.

DROP POLICY IF EXISTS "Authenticated users can view all ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Ingredients are viewable by everyone" ON public.ingredients;

CREATE POLICY "Ingredients are viewable by everyone"
ON public.ingredients
FOR SELECT
TO public
USING (true);

-- Retroactively link ingredient_id for existing shopping_list items where ingredient_id is NULL
UPDATE public.shopping_list sl
SET ingredient_id = (
  SELECT i.id FROM public.ingredients i
  WHERE LOWER(sl.name) = LOWER(i.name)
     OR LOWER(sl.name) = ANY(SELECT LOWER(unnest(i.synonyms)))
     OR LOWER(sl.name) LIKE LOWER(i.name) || '%'
     OR LOWER(i.name) LIKE LOWER(sl.name) || '%'
  ORDER BY LENGTH(i.name) DESC
  LIMIT 1
)
WHERE sl.ingredient_id IS NULL;
