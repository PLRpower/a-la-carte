-- Migration: Recipe Journal & Public Sharing
-- Add user personal notes, realization counter and public recipe share RPC

CREATE TABLE IF NOT EXISTS public.recipe_user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id TEXT NOT NULL,
    notes TEXT DEFAULT '',
    cooked_count INTEGER NOT NULL DEFAULT 0,
    last_cooked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_user_notes_user_recipe ON public.recipe_user_notes(user_id, recipe_id);

ALTER TABLE public.recipe_user_notes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own recipe notes" ON public.recipe_user_notes;
    DROP POLICY IF EXISTS "Users can insert own recipe notes" ON public.recipe_user_notes;
    DROP POLICY IF EXISTS "Users can update own recipe notes" ON public.recipe_user_notes;
    DROP POLICY IF EXISTS "Users can delete own recipe notes" ON public.recipe_user_notes;
END $$;

CREATE POLICY "Users can view own recipe notes"
    ON public.recipe_user_notes FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe notes"
    ON public.recipe_user_notes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipe notes"
    ON public.recipe_user_notes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe notes"
    ON public.recipe_user_notes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Secure RPC function to allow guest / read-only viewing of a shared recipe without logging in
CREATE OR REPLACE FUNCTION public.get_shared_recipe(p_recipe_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    recipe_record RECORD;
    ingredients_json jsonb;
    result jsonb;
BEGIN
    SELECT * INTO recipe_record FROM public.recipes WHERE id = p_recipe_id;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', ri.id,
                'name', ri.name,
                'quantity', ri.quantity,
                'unit', ri.unit
            )
        ),
        '[]'::jsonb
    ) INTO ingredients_json
    FROM public.recipe_ingredients ri
    WHERE ri.recipe_id = p_recipe_id;

    result := jsonb_build_object(
        'id', recipe_record.id,
        'title', recipe_record.title,
        'description', recipe_record.description,
        'image_url', recipe_record.image_url,
        'difficulty', recipe_record.difficulty,
        'prep_time', recipe_record.prep_time,
        'cook_time', recipe_record.cook_time,
        'servings', recipe_record.servings,
        'category', recipe_record.category,
        'tags', recipe_record.tags,
        'instructions', recipe_record.instructions,
        'source', recipe_record.source,
        'created_at', recipe_record.created_at,
        'ingredients', ingredients_json
    );

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_recipe(uuid) TO anon, authenticated;
