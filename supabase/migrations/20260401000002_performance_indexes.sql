-- Performance Optimization: Missing Indexes

-- Recipes
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS recipes_is_public_idx ON public.recipes(is_public);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON public.recipes(created_at DESC);

-- Recipe Ingredients
CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_id_idx ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_ingredients_ingredient_id_idx ON public.recipe_ingredients(ingredient_id);

-- Stock
CREATE INDEX IF NOT EXISTS stock_user_id_idx ON public.stock(user_id);
CREATE INDEX IF NOT EXISTS stock_ingredient_id_idx ON public.stock(ingredient_id);
CREATE INDEX IF NOT EXISTS stock_created_at_idx ON public.stock(created_at DESC);

-- Shopping List
CREATE INDEX IF NOT EXISTS shopping_list_user_id_idx ON public.shopping_list(user_id);
CREATE INDEX IF NOT EXISTS shopping_list_ingredient_id_idx ON public.shopping_list(ingredient_id);
CREATE INDEX IF NOT EXISTS shopping_list_checked_idx ON public.shopping_list(checked);
CREATE INDEX IF NOT EXISTS shopping_list_created_at_idx ON public.shopping_list(created_at DESC);

-- Family Members
CREATE INDEX IF NOT EXISTS family_members_family_id_idx ON public.family_members(family_id);

-- Favorites
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_recipe_id_idx ON public.favorites(recipe_id);

-- Recipe Photos
CREATE INDEX IF NOT EXISTS recipe_photos_recipe_id_idx ON public.recipe_photos(recipe_id);