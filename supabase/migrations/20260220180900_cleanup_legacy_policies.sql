-- Cleanup lingering old permissive policies that overrides the family ones

-- Recipes
DROP POLICY IF EXISTS "Authenticated users can view all recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON public.recipes;

-- Stock
DROP POLICY IF EXISTS "Users can view own stock" ON public.stock;
DROP POLICY IF EXISTS "Users can update own stock" ON public.stock;
DROP POLICY IF EXISTS "Users can delete own stock" ON public.stock;

-- Shopping List
DROP POLICY IF EXISTS "Users can view all shopping list items" ON public.shopping_list;
DROP POLICY IF EXISTS "Users can insert shopping list items" ON public.shopping_list;
DROP POLICY IF EXISTS "Users can update all shopping list items" ON public.shopping_list;
DROP POLICY IF EXISTS "Users can delete all shopping list items" ON public.shopping_list;

-- Recipe Ingredients
DROP POLICY IF EXISTS "Authenticated users can view all recipe_ingredients" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can insert ingredients for own recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can update ingredients for own recipes" ON public.recipe_ingredients;
DROP POLICY IF EXISTS "Users can delete ingredients for own recipes" ON public.recipe_ingredients;
