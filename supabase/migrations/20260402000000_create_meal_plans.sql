-- Create meal_plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    slot TEXT NOT NULL CHECK (slot IN ('lunch', 'dinner')),
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
    catalog_recipe_id TEXT,
    custom_title TEXT,
    servings INTEGER DEFAULT 2 NOT NULL,
    notes TEXT,
    recipe_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON public.meal_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date ON public.meal_plans(date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe_id ON public.meal_plans(recipe_id);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Shared family policies using is_in_same_family helper
DROP POLICY IF EXISTS "Users can view own or family meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update own or family meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete own or family meal plans" ON public.meal_plans;

CREATE POLICY "Users can view own or family meal plans" ON public.meal_plans
    FOR SELECT USING (public.is_in_same_family(user_id));

CREATE POLICY "Users can insert own meal plans" ON public.meal_plans
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own or family meal plans" ON public.meal_plans
    FOR UPDATE USING (public.is_in_same_family(user_id));

CREATE POLICY "Users can delete own or family meal plans" ON public.meal_plans
    FOR DELETE USING (public.is_in_same_family(user_id));

-- Add meal_plans to realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'meal_plans' AND schemaname = 'public'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_plans;
    END IF;
END;
$$;
