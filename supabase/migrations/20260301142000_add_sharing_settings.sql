-- 1. Add columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_recipes BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_stock BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_shopping_list BOOLEAN DEFAULT TRUE;

-- 2. Define helper function for sharing logic
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
    IF item_type = 'recipe' THEN
      RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = item_owner_id AND share_recipes = true);
    ELSIF item_type = 'stock' THEN
      RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = item_owner_id AND share_stock = true);
    ELSIF item_type = 'shopping_list' THEN
      RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = item_owner_id AND share_shopping_list = true);
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- 3. RECIPES
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Users can view own or family recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view public or family recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update own or family recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete own or family recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;

CREATE POLICY "Users can view shared recipes" ON public.recipes
FOR SELECT TO public USING (public.is_shared_with_me(user_id, 'recipe'));

CREATE POLICY "Users can update shared recipes" ON public.recipes
FOR UPDATE TO public USING (public.is_shared_with_me(user_id, 'recipe'));

CREATE POLICY "Users can delete shared recipes" ON public.recipes
FOR DELETE TO public USING (public.is_shared_with_me(user_id, 'recipe'));

-- 4. STOCK
DROP POLICY IF EXISTS "Users can view their own stock" ON public.stock;
DROP POLICY IF EXISTS "Users can view own or family stock" ON public.stock;
DROP POLICY IF EXISTS "Users can update their own stock" ON public.stock;
DROP POLICY IF EXISTS "Users can update own or family stock" ON public.stock;
DROP POLICY IF EXISTS "Users can delete their own stock" ON public.stock;
DROP POLICY IF EXISTS "Users can delete own or family stock" ON public.stock;

CREATE POLICY "Users can view shared stock" ON public.stock
FOR SELECT TO public USING (public.is_shared_with_me(user_id, 'stock'));

CREATE POLICY "Users can update shared stock" ON public.stock
FOR UPDATE TO public USING (public.is_shared_with_me(user_id, 'stock'));

CREATE POLICY "Users can delete shared stock" ON public.stock
FOR DELETE TO public USING (public.is_shared_with_me(user_id, 'stock'));

-- 5. SHOPPING LIST
DROP POLICY IF EXISTS "Users can view their own shopping list" ON public.shopping_list;
DROP POLICY IF EXISTS "Users can view own or family shopping list" ON public.shopping_list;
DROP POLICY IF EXISTS "Users can update their own shopping list" ON public.shopping_list;
DROP POLICY IF EXISTS "Users can update own or family shopping list" ON public.shopping_list;
DROP POLICY IF EXISTS "Users can delete their own shopping list" ON public.shopping_list;
DROP POLICY IF EXISTS "Users can delete own or family shopping list" ON public.shopping_list;

CREATE POLICY "Users can view shared shopping list" ON public.shopping_list
FOR SELECT TO public USING (public.is_shared_with_me(user_id, 'shopping_list'));

CREATE POLICY "Users can update shared shopping list" ON public.shopping_list
FOR UPDATE TO public USING (public.is_shared_with_me(user_id, 'shopping_list'));

CREATE POLICY "Users can delete shared shopping list" ON public.shopping_list
FOR DELETE TO public USING (public.is_shared_with_me(user_id, 'shopping_list'));

-- 6. RECIPE INGREDIENTS
DROP POLICY IF EXISTS "Users can insert ingredients for own or family recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can update ingredients for own or family recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can delete ingredients for own or family recipes" ON public.recipe_ingredients;

CREATE POLICY "Users can insert ingredients for shared recipes" ON public.recipe_ingredients
FOR INSERT TO public WITH CHECK (
    EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_ingredients.recipe_id AND public.is_shared_with_me(user_id, 'recipe'))
);

CREATE POLICY "Users can update ingredients for shared recipes" ON public.recipe_ingredients
FOR UPDATE TO public USING (
    EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_ingredients.recipe_id AND public.is_shared_with_me(user_id, 'recipe'))
);

CREATE POLICY "Users can delete ingredients for shared recipes" ON public.recipe_ingredients
FOR DELETE TO public USING (
    EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_ingredients.recipe_id AND public.is_shared_with_me(user_id, 'recipe'))
);
