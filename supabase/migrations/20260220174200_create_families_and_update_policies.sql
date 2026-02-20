-- Create families and family_members tables
CREATE TABLE IF NOT EXISTS public.families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    share_code UUID DEFAULT gen_random_uuid() UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Drop new policies if they exist (to make script re-entrant)
DROP POLICY IF EXISTS "Users can view their families" ON public.families;
DROP POLICY IF EXISTS "Users can update their families" ON public.families;
DROP POLICY IF EXISTS "Users can delete their families" ON public.families;

DROP POLICY IF EXISTS "Users can view members of their families" ON public.family_members;
DROP POLICY IF EXISTS "Admins or users themselves can delete members" ON public.family_members;

-- Families policies
CREATE POLICY "Users can view their families" ON public.families
    FOR SELECT USING (
        id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their families" ON public.families
    FOR UPDATE USING (
        id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can delete their families" ON public.families
    FOR DELETE USING (
        id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Family members policies
CREATE POLICY "Users can view members of their families" ON public.family_members
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins or users themselves can delete members" ON public.family_members
    FOR DELETE USING (
        user_id = auth.uid() OR
        family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Is in same family helper
CREATE OR REPLACE FUNCTION public.is_in_same_family(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN target_user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members f1
    JOIN public.family_members f2 ON f1.family_id = f2.family_id
    WHERE f1.user_id = auth.uid() AND f2.user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing shared policies on stock, shopping_list, recipes
-- from 20251217001500_make_lists_shared.sql
DROP POLICY IF EXISTS "Authenticated users can view all stock" ON "public"."stock";
DROP POLICY IF EXISTS "Authenticated users can insert stock" ON "public"."stock";
DROP POLICY IF EXISTS "Authenticated users can update all stock" ON "public"."stock";
DROP POLICY IF EXISTS "Authenticated users can delete all stock" ON "public"."stock";

DROP POLICY IF EXISTS "Authenticated users can view all shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Authenticated users can insert shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Authenticated users can update all shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Authenticated users can delete all shopping list" ON "public"."shopping_list";

-- And from recipes
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON "public"."recipes";
DROP POLICY IF EXISTS "Users can view their own recipes" ON "public"."recipes";
DROP POLICY IF EXISTS "Users can insert their own recipes" ON "public"."recipes";
DROP POLICY IF EXISTS "Users can update their own recipes" ON "public"."recipes";
DROP POLICY IF EXISTS "Users can delete their own recipes" ON "public"."recipes";

-- Also drop the new ones if partially applied
DROP POLICY IF EXISTS "Users can view own or family stock" ON "public"."stock";
DROP POLICY IF EXISTS "Users can insert own stock" ON "public"."stock";
DROP POLICY IF EXISTS "Users can update own or family stock" ON "public"."stock";
DROP POLICY IF EXISTS "Users can delete own or family stock" ON "public"."stock";

DROP POLICY IF EXISTS "Users can view own or family shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Users can insert own shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Users can update own or family shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Users can delete own or family shopping list" ON "public"."shopping_list";

DROP POLICY IF EXISTS "Users can view own or family recipes" ON "public"."recipes";
DROP POLICY IF EXISTS "Users can insert own recipes" ON "public"."recipes";
DROP POLICY IF EXISTS "Users can update own or family recipes" ON "public"."recipes";
DROP POLICY IF EXISTS "Users can delete own or family recipes" ON "public"."recipes";

-- Recreate properly shared policies using is_in_same_family helper

-- STOCK
CREATE POLICY "Users can view own or family stock" ON "public"."stock"
    FOR SELECT USING (public.is_in_same_family(user_id));

CREATE POLICY "Users can insert own stock" ON "public"."stock"
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own or family stock" ON "public"."stock"
    FOR UPDATE USING (public.is_in_same_family(user_id));

CREATE POLICY "Users can delete own or family stock" ON "public"."stock"
    FOR DELETE USING (public.is_in_same_family(user_id));

-- SHOPPING LIST
CREATE POLICY "Users can view own or family shopping list" ON "public"."shopping_list"
    FOR SELECT USING (public.is_in_same_family(user_id));

CREATE POLICY "Users can insert own shopping list" ON "public"."shopping_list"
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own or family shopping list" ON "public"."shopping_list"
    FOR UPDATE USING (public.is_in_same_family(user_id));

CREATE POLICY "Users can delete own or family shopping list" ON "public"."shopping_list"
    FOR DELETE USING (public.is_in_same_family(user_id));

-- RECIPES
CREATE POLICY "Public recipes are viewable by everyone" ON "public"."recipes" 
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own or family recipes" ON "public"."recipes"
    FOR SELECT USING (public.is_in_same_family(user_id));

CREATE POLICY "Users can insert own recipes" ON "public"."recipes"
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own or family recipes" ON "public"."recipes"
    FOR UPDATE USING (public.is_in_same_family(user_id));

CREATE POLICY "Users can delete own or family recipes" ON "public"."recipes"
    FOR DELETE USING (public.is_in_same_family(user_id));


-- Recipe ingredients
DROP POLICY IF EXISTS "Recipe ingredients are viewable by everyone" ON "public"."recipe_ingredients";
DROP POLICY IF EXISTS "Users can insert ingredients for their recipes" ON "public"."recipe_ingredients";
DROP POLICY IF EXISTS "Users can update ingredients for their recipes" ON "public"."recipe_ingredients";
DROP POLICY IF EXISTS "Users can delete ingredients for their recipes" ON "public"."recipe_ingredients";

DROP POLICY IF EXISTS "Users can insert ingredients for own or family recipes" ON "public"."recipe_ingredients";
DROP POLICY IF EXISTS "Users can update ingredients for own or family recipes" ON "public"."recipe_ingredients";
DROP POLICY IF EXISTS "Users can delete ingredients for own or family recipes" ON "public"."recipe_ingredients";

CREATE POLICY "Recipe ingredients are viewable by everyone" ON "public"."recipe_ingredients"
    FOR SELECT USING (true);
    
CREATE POLICY "Users can insert ingredients for own or family recipes" ON "public"."recipe_ingredients"
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND public.is_in_same_family(user_id))
    );

CREATE POLICY "Users can update ingredients for own or family recipes" ON "public"."recipe_ingredients"
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND public.is_in_same_family(user_id))
    );

CREATE POLICY "Users can delete ingredients for own or family recipes" ON "public"."recipe_ingredients"
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND public.is_in_same_family(user_id))
    );

-- Functions to create and join families
CREATE OR REPLACE FUNCTION public.create_family(p_name TEXT)
RETURNS UUID AS $$
DECLARE
  v_family_id UUID;
BEGIN
  INSERT INTO public.families (name) VALUES (p_name) RETURNING id INTO v_family_id;
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (v_family_id, auth.uid(), 'admin');
  RETURN v_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.join_family_with_code(p_share_code UUID)
RETURNS void AS $$
DECLARE
  v_family_id UUID;
BEGIN
  SELECT id INTO v_family_id FROM public.families WHERE share_code = p_share_code;
  IF v_family_id IS NOT NULL THEN
    INSERT INTO public.family_members (family_id, user_id, role)
    VALUES (v_family_id, auth.uid(), 'member')
    ON CONFLICT DO NOTHING;
  ELSE
    RAISE EXCEPTION 'Invalid share code';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
