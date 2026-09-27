import { supabase } from "@/integrations/supabase/client";
import { parseIngredientInput, findBestIngredientMatch } from "./ingredient-parser";
import { Ingredient } from "@/types/database";
import { CATALOG_RECIPES } from "@/data/recipesCatalog";

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

/**
 * Checks whether a recipe title belongs to the pre-packaged Discover catalog.
 */
export function isCatalogRecipeTitle(title?: string | null): boolean {
    if (!title) return false;
    const cleanTitle = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    return CATALOG_RECIPES.some((cat) => {
        const cleanCatTitle = cat.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
        return cleanCatTitle === cleanTitle;
    });
}

/**
 * Returns true if the recipe does not belong to the user as an original custom creation
 * (e.g. from the default Discover catalog, or shared by a family member).
 */
export function isRecipeNotMine(
    recipe?: { title?: string; user_id?: string | null } | null,
    currentUserId?: string | null
): boolean {
    if (!recipe) return false;
    if (isCatalogRecipeTitle(recipe.title)) return true;
    if (currentUserId && recipe.user_id && recipe.user_id !== currentUserId) return true;
    return false;
}

