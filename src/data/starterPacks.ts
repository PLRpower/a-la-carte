import { CATALOG_RECIPES, CatalogRecipe } from "./recipesCatalog";

export interface StarterTheme {
  id: string;
  label: string;
  emoji: string;
  description: string;
  badge: string;
}

export const STARTER_THEMES: StarterTheme[] = [
  {
    id: "rapide",
    label: "Rapide & Facile",
    emoji: "⚡",
    description: "Prêt en moins de 20 minutes chrono pour les soirs de semaine",
    badge: "< 20 min"
  },
  {
    id: "etudiant",
    label: "Étudiant / Petit Budget",
    emoji: "🎓",
    description: "Plats économiques, malins et simples avec des ingrédients du quotidien",
    badge: "Économique"
  },
  {
    id: "vegetarien",
    label: "Végétarien",
    emoji: "🥗",
    description: "Recettes gourmandes, saines et 100% végétales riches en saveurs",
    badge: "100% Végé"
  },
  {
    id: "famille",
    label: "Famille & Convivial",
    emoji: "👨‍👩‍👧‍👦",
    description: "Grands plats généreux qui plaisent aux petits comme aux grands",
    badge: "Généreux"
  },
  {
    id: "batch_cooking",
    label: "Batch Cooking",
    emoji: "🍱",
    description: "Cuisinez le dimanche pour réchauffer de délicieux plats toute la semaine",
    badge: "Meal Prep"
  }
];

export function getStarterPackRecipes(selectedThemes: string[], limit: number = 12): CatalogRecipe[] {
  if (selectedThemes.length === 0) {
    // Default selection of essential daily recipes
    return CATALOG_RECIPES.slice(0, limit);
  }

  // Score each recipe by how many chosen themes match
  const scored = CATALOG_RECIPES.map(recipe => {
    let score = 0;
    for (const theme of selectedThemes) {
      if (recipe.tags.includes(theme)) score += 2;
    }
    // slight bonus for quick & highly rated basics
    if (recipe.prep_time + recipe.cook_time <= 25) score += 1;
    return { recipe, score };
  });

  // Filter recipes that have at least 1 match, sort descending by score
  const matched = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.recipe);

  // If fewer than limit, fill with general essentials
  if (matched.length < limit) {
    const matchedIds = new Set(matched.map(r => r.id));
    for (const r of CATALOG_RECIPES) {
      if (!matchedIds.has(r.id)) {
        matched.push(r);
        if (matched.length >= limit) break;
      }
    }
  }

  return matched.slice(0, limit);
}
