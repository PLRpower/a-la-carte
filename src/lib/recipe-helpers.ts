import { supabase } from "@/integrations/supabase/client";
import { parseIngredientInput, findBestIngredientMatch } from "./ingredient-parser";
import { Ingredient } from "@/types/database";

export const saveRecipeIngredients = async (
    recipeId: string,
    ingredientsText: string,
    allIngredients: Ingredient[]
) => {
    const ingredientLines = ingredientsText.split('\n').filter(line => line.trim());
    for (const line of ingredientLines) {
        const { name: parsedName, quantity, unit } = parseIngredientInput(line);
        if (!parsedName) continue;

        let ingredientId: string | null = null;
        const match = findBestIngredientMatch(parsedName, allIngredients);

        if (match) {
            ingredientId = match.id;
        }

        await supabase.from('recipe_ingredients').insert([{
            recipe_id: recipeId,
            ingredient_id: ingredientId,
            name: parsedName,
            quantity: quantity || 1,
            unit: unit as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
        }]);
    }
};
