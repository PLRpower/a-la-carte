-- Rename notes to name
ALTER TABLE recipe_ingredients RENAME COLUMN notes TO name;

-- Make ingredient_id nullable
ALTER TABLE recipe_ingredients ALTER COLUMN ingredient_id DROP NOT NULL;

-- Backfill name from ingredients table if it's null (using the linked ingredient's name)
UPDATE recipe_ingredients ri
SET name = i.name
FROM ingredients i
WHERE ri.ingredient_id = i.id AND ri.name IS NULL;

-- Make name not null (assuming we want it mandatory like in shopping_list)
ALTER TABLE recipe_ingredients ALTER COLUMN name SET NOT NULL;
