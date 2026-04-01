DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN SELECT unnest(ARRAY['shopping_list', 'stock', 'recipes', 'recipe_photos', 'families', 'family_members'])
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = t_name AND schemaname = 'public'
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t_name);
        END IF;
    END LOOP;
END;
$$;