-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own stock" ON "public"."stock";
DROP POLICY IF EXISTS "Users can insert their own stock" ON "public"."stock";
DROP POLICY IF EXISTS "Users can update their own stock" ON "public"."stock";
DROP POLICY IF EXISTS "Users can delete their own stock" ON "public"."stock";

DROP POLICY IF EXISTS "Users can view their own shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Users can insert their own shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Users can update their own shopping list" ON "public"."shopping_list";
DROP POLICY IF EXISTS "Users can delete their own shopping list" ON "public"."shopping_list";


-- Create new policies for Stock (Shared)
CREATE POLICY "Authenticated users can view all stock" ON "public"."stock"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert stock" ON "public"."stock"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id); -- Still ensure user_id matches the creator for integrity, although user wants shared view

CREATE POLICY "Authenticated users can update all stock" ON "public"."stock"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete all stock" ON "public"."stock"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);


-- Create new policies for Shopping List (Shared)
CREATE POLICY "Authenticated users can view all shopping list" ON "public"."shopping_list"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert shopping list" ON "public"."shopping_list"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all shopping list" ON "public"."shopping_list"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete all shopping list" ON "public"."shopping_list"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);
