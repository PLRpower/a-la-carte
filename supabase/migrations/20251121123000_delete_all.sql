-- SCRIPT RÉVISÉ : WIPE COMPLÈTE SUPABASE (robuste, protège contre les objets absents)
-- Exécuter en tant que superuser / owner de la base (p.ex. postgres / rôle admin Supabase)

-----------------------------
-- 0. Helper : exécutions protégées
-----------------------------
-- On encapsule chaque action critique dans un DO ... BEGIN/EXCEPTION pour éviter l'arrêt total.

-----------------------------
-- 1. Désactiver RLS sur toutes les tables existantes dans les schemas ciblés
-----------------------------
DO $$
DECLARE
r RECORD;
  target_schemas TEXT[] := ARRAY['public','auth','storage'];
BEGIN
FOR r IN
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = ANY(target_schemas)
    LOOP
BEGIN
EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY;', r.schemaname, r.tablename);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not disable RLS on %.%: %', r.schemaname, r.tablename, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 2. Supprimer toutes les policies existantes (schemas cibles)
-----------------------------
DO $$
DECLARE
p RECORD;
  target_schemas TEXT[] := ARRAY['public','auth','storage'];
BEGIN
FOR p IN
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = ANY(target_schemas)
    LOOP
BEGIN
EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', p.policyname, p.schemaname, p.tablename);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop policy % on %.% : %', p.policyname, p.schemaname, p.tablename, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 3. Supprimer tous les triggers existants
-----------------------------
DO $$
DECLARE
t RECORD;
  target_schemas TEXT[] := ARRAY['public','auth','storage'];
BEGIN
FOR t IN
SELECT event_object_schema AS schemaname, event_object_table AS tablename, trigger_name
FROM information_schema.triggers
WHERE event_object_schema = ANY(target_schemas)
    LOOP
BEGIN
EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE;', t.trigger_name, t.schemaname, t.tablename);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop trigger % on %.% : %', t.trigger_name, t.schemaname, t.tablename, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 4. Supprimer vues et materialized views existantes
-----------------------------
DO $$
DECLARE
v RECORD;
  target_schemas TEXT[] := ARRAY['public','auth','storage'];
BEGIN
FOR v IN
SELECT schemaname, viewname FROM pg_views WHERE schemaname = ANY(target_schemas)
    LOOP
BEGIN
EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE;', v.schemaname, v.viewname);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop view %.% : %', v.schemaname, v.viewname, SQLERRM;
END;
END LOOP;

FOR v IN
SELECT schemaname, matviewname FROM pg_matviews WHERE schemaname = ANY(target_schemas)
    LOOP
BEGIN
EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE;', v.schemaname, v.matviewname);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop materialized view %.% : %', v.schemaname, v.matviewname, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 5. Supprimer toutes les fonctions dans les schemas ciblés (utilise la signature correcte)
-----------------------------
DO $$
DECLARE
f RECORD;
  target_schemas TEXT[] := ARRAY['public','auth','storage'];
  sig TEXT;
BEGIN
FOR f IN
SELECT p.oid, n.nspname AS schema_name, p.proname AS funcname
FROM pg_proc p
         JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = ANY(target_schemas)
    LOOP
BEGIN
      sig := pg_get_function_identity_arguments(f.oid);
EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE;', f.schema_name, f.funcname, sig);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop function %.%(%): %', f.schema_name, f.funcname, sig, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 6. Supprimer toutes les tables existantes
-----------------------------
DO $$
DECLARE
t RECORD;
  target_schemas TEXT[] := ARRAY['public','auth','storage'];
BEGIN
FOR t IN
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = ANY(target_schemas)
    LOOP
BEGIN
EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE;', t.schemaname, t.tablename);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop table %.% : %', t.schemaname, t.tablename, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 7. Supprimer types composites / enums/custom types (limité aux enums ici)
-----------------------------
DO $$
DECLARE
ty RECORD;
  target_schemas TEXT[] := ARRAY['public','auth','storage'];
BEGIN
FOR ty IN
SELECT n.nspname AS schema, t.typname AS type
FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = ANY(target_schemas)
  AND t.typtype IN ('e','c','d') -- enums, composites, domains
    LOOP
BEGIN
EXECUTE format('DROP TYPE IF EXISTS %I.%I CASCADE;', ty.schema, ty.type);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop type %.% : %', ty.schema, ty.type, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 8. Supprimer les sequences
-----------------------------
DO $$
DECLARE
s RECORD;
  target_schemas TEXT[] := ARRAY['public','auth','storage'];
BEGIN
FOR s IN
SELECT sequence_schema, sequence_name
FROM information_schema.sequences
WHERE sequence_schema = ANY(target_schemas)
    LOOP
BEGIN
EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I CASCADE;', s.sequence_schema, s.sequence_name);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop sequence %.% : %', s.sequence_schema, s.sequence_name, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 9. Supprimer extensions optionnelles (ne supprime pas les extensions systèmes si verrouillées)
-----------------------------
DO $$
DECLARE
e RECORD;
BEGIN
FOR e IN SELECT extname FROM pg_extension WHERE extname NOT IN ('plpgsql') LOOP
BEGIN
EXECUTE format('DROP EXTENSION IF EXISTS %I CASCADE;', e.extname);
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop extension % : %', e.extname, SQLERRM;
END;
END LOOP;
END$$;


-----------------------------
-- 10. Retirer et recréer proprement les schemas ciblés
-----------------------------
DO $$
BEGIN
  -- Supprimer si présent
  PERFORM 1 FROM pg_namespace WHERE nspname = 'public';
  IF FOUND THEN
BEGIN
EXECUTE 'DROP SCHEMA IF EXISTS public CASCADE';
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop schema public: %', SQLERRM;
END;
END IF;

  PERFORM 1 FROM pg_namespace WHERE nspname = 'auth';
  IF FOUND THEN
BEGIN

EXECUTE 'DROP SCHEMA IF EXISTS auth CASCADE';
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop schema auth: %', SQLERRM;
END;
END IF;

  PERFORM 1 FROM pg_namespace WHERE nspname = 'storage';
  IF FOUND THEN
BEGIN
EXECUTE 'DROP SCHEMA IF EXISTS storage CASCADE';
EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop schema storage: %', SQLERRM;
END;
END IF;

  -- Recréer les schémas vides
BEGIN
EXECUTE 'CREATE SCHEMA IF NOT EXISTS public';
EXECUTE 'CREATE SCHEMA IF NOT EXISTS auth';
EXECUTE 'CREATE SCHEMA IF NOT EXISTS storage';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not (re)create one of the schemas: %', SQLERRM;
END;
END$$;

-----------------------------
-- 11. Réinitialisations finales et permissions
-----------------------------
ALTER SCHEMA public OWNER TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO public;

-- Si tu veux, ajoute ici la récréation minimale des objets Supabase (auth, storage) après vérification.
