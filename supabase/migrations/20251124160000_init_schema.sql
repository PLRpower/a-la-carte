-- Create Enums
CREATE TYPE app_role AS ENUM ('admin', 'user');
CREATE TYPE recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE recipe_category AS ENUM ('breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'vegetarian', 'vegan');
CREATE TYPE ingredient_category AS ENUM ('vegetables', 'fruits', 'dairy', 'meat', 'fish', 'grains', 'oils', 'spices', 'beverages', 'other');
CREATE TYPE measurement_unit AS ENUM ('g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece');

-- Create Tables

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role DEFAULT 'user'::app_role,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredients
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category ingredient_category,
  image_url TEXT,
  synonyms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  difficulty recipe_difficulty,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  category recipe_category,
  instructions TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe Ingredients
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  quantity NUMERIC NOT NULL,
  unit measurement_unit NOT NULL,
  notes TEXT
);

-- Stock
CREATE TABLE stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  quantity NUMERIC NOT NULL,
  unit measurement_unit NOT NULL,
  expiration_date DATE,
  low_stock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping List
CREATE TABLE shopping_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC,
  unit measurement_unit,
  checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING ((select auth.uid()) = id);

-- User Roles
CREATE POLICY "Users can view their own role" ON user_roles FOR SELECT USING ((select auth.uid()) = user_id);

-- Ingredients
CREATE POLICY "Ingredients are viewable by everyone" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Admins can insert ingredients" ON ingredients FOR INSERT WITH CHECK (has_role('admin'));
CREATE POLICY "Admins can update ingredients" ON ingredients FOR UPDATE USING (has_role('admin'));
CREATE POLICY "Admins can delete ingredients" ON ingredients FOR DELETE USING (has_role('admin'));

-- Recipes
CREATE POLICY "Public recipes are viewable by everyone" ON recipes FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own recipes" ON recipes FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own recipes" ON recipes FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own recipes" ON recipes FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own recipes" ON recipes FOR DELETE USING ((select auth.uid()) = user_id);

-- Recipe Ingredients
CREATE POLICY "Recipe ingredients are viewable by everyone" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Users can insert ingredients for their recipes" ON recipe_ingredients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND user_id = (select auth.uid()))
);
CREATE POLICY "Users can update ingredients for their recipes" ON recipe_ingredients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND user_id = (select auth.uid()))
);
CREATE POLICY "Users can delete ingredients for their recipes" ON recipe_ingredients FOR DELETE USING (
  EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND user_id = (select auth.uid()))
);

-- Stock
CREATE POLICY "Users can view their own stock" ON stock FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own stock" ON stock FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own stock" ON stock FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own stock" ON stock FOR DELETE USING ((select auth.uid()) = user_id);

-- Shopping List
CREATE POLICY "Users can view their own shopping list" ON shopping_list FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own shopping list" ON shopping_list FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own shopping list" ON shopping_list FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own shopping list" ON shopping_list FOR DELETE USING ((select auth.uid()) = user_id);

-- Favorites
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING ((select auth.uid()) = user_id);
