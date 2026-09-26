import { supabase } from "@/integrations/supabase/client";
import { CatalogRecipe } from "@/data/recipesCatalog";
import { findBestIngredientMatch } from "./ingredient-parser";
import { Ingredient } from "@/types/database";

export const PENDING_STARTER_PACK_KEY = "pendingStarterPackRecipes";

/**
 * Clone a single catalog recipe into user's personal recipes in Supabase
 */
export async function cloneRecipeToUser(
  recipe: CatalogRecipe,
  userId: string,
  allIngredients: Ingredient[] = []
): Promise<string> {
  // 1. Insert recipe
  const { data: newRecipe, error: recipeError } = await supabase
    .from("recipes")
    .insert([{
      user_id: userId,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.image_url,
      difficulty: recipe.difficulty,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      category: recipe.category,
      tags: recipe.tags,
      source: "website",
      instructions: recipe.instructions,
      is_shared_with_family: false,
      is_public: false
    }])
    .select()
    .single();

  if (recipeError) throw recipeError;

  // 2. Insert recipe ingredients
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const ingredientsToInsert = recipe.ingredients.map(ing => {
      const match = findBestIngredientMatch(ing.name, allIngredients);
      return {
        recipe_id: newRecipe.id,
        ingredient_id: match ? match.id : null,
        name: ing.name,
        quantity: ing.quantity || 1,
        unit: ing.unit || "g"
      };
    });

    const { error: ingError } = await supabase
      .from("recipe_ingredients")
      .insert(ingredientsToInsert);

    if (ingError) {
      console.warn("Error inserting recipe ingredients:", ingError);
    }
  }

  return newRecipe.id;
}

/**
 * Batch clone multiple catalog recipes for a user
 */
export async function cloneStarterPack(
  recipes: CatalogRecipe[],
  userId: string,
  allIngredients: Ingredient[] = []
): Promise<number> {
  let successCount = 0;
  for (const recipe of recipes) {
    try {
      await cloneRecipeToUser(recipe, userId, allIngredients);
      successCount++;
    } catch (err) {
      console.error(`Failed to clone recipe "${recipe.title}":`, err);
    }
  }
  return successCount;
}

/**
 * Process any pending starter pack stored in localStorage upon user authentication
 */
export async function processPendingStarterPack(userId: string): Promise<number> {
  const raw = localStorage.getItem(PENDING_STARTER_PACK_KEY);
  if (!raw) return 0;
  try {
    const { CATALOG_RECIPES } = await import("@/data/recipesCatalog");
    const idsOrRecipes = JSON.parse(raw);
    if (!Array.isArray(idsOrRecipes) || idsOrRecipes.length === 0) {
      localStorage.removeItem(PENDING_STARTER_PACK_KEY);
      return 0;
    }

    const recipesToClone = idsOrRecipes
      .map(item => {
        if (typeof item === "string") {
          return CATALOG_RECIPES.find(r => r.id === item);
        }
        return item;
      })
      .filter(Boolean) as CatalogRecipe[];

    const count = await cloneStarterPack(recipesToClone, userId);
    localStorage.removeItem(PENDING_STARTER_PACK_KEY);
    return count;
  } catch (err) {
    console.error("Error processing pending starter pack:", err);
    localStorage.removeItem(PENDING_STARTER_PACK_KEY);
    return 0;
  }
}
