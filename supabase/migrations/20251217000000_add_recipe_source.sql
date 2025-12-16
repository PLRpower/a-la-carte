-- Add recipe_source enum type
CREATE TYPE public.recipe_source AS ENUM ('book', 'cooking_class', 'website');

-- Add source column to recipes table
ALTER TABLE public.recipes 
ADD COLUMN source public.recipe_source DEFAULT 'website';

-- Update the comment (optional)
COMMENT ON COLUMN public.recipes.source IS 'Source of the recipe: book, cooking_class, or website';
