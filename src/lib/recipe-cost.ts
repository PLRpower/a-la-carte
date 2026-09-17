import { MeasurementUnit, IngredientCategory } from "@/types/database";

export const BUDGET_MAX_PORTION = 2.50; // Threshold for "Fin de mois difficile / Petit budget" in €

export interface RecipeIngredientCostInput {
  name: string;
  quantity?: number | null;
  unit?: MeasurementUnit | string | null;
  category?: IngredientCategory | string | null;
  ingredient?: {
    category?: IngredientCategory | string | null;
  } | null;
}

export interface RecipeCostInput {
  servings?: number | null;
  category?: string | null;
  tags?: string[] | null;
  difficulty?: string | null;
  ingredients?: RecipeIngredientCostInput[] | null;
}

export interface RecipeCostEstimate {
  totalCost: number;
  costPerServing: number;
  isBudget: boolean;
  formattedCostPerServing: string;
  formattedTotalCost: string;
}

// Normalized pricing lookup (average French supermarket price in Euros)
const SPECIFIC_ITEM_PRICES: Array<{
  pattern: RegExp;
  pricePerKg?: number;
  pricePerLiter?: number;
  pricePerPiece?: number;
}> = [
  // Eggs
  { pattern: /\b(oeuf|oeufs|œuf|œufs|jaune d'oeuf|blanc d'oeuf)\b/i, pricePerPiece: 0.35 },
  // Starches & Grains
  { pattern: /\b(spaghetti|pates|pâtes|coquillette|penne|tagliatelle|macaroni|nouille|lasagne)\b/i, pricePerKg: 2.20 },
  { pattern: /\b(riz|basmati|arborio|thai)\b/i, pricePerKg: 2.40 },
  { pattern: /\b(farine|fecule|maizena)\b/i, pricePerKg: 1.50 },
  { pattern: /\b(lentille|lentilles|pois chiche|pois casses|haricot sec|quinoa)\b/i, pricePerKg: 3.20 },
  { pattern: /\b(pomme de terre|pommes de terre|patate|patates)\b/i, pricePerKg: 1.80 },
  // Common Dairy
  { pattern: /\b(lait)\b/i, pricePerLiter: 1.15 },
  { pattern: /\b(creme|crème)\b/i, pricePerLiter: 4.20, pricePerPiece: 0.85 },
  { pattern: /\b(beurre)\b/i, pricePerKg: 8.50 },
  { pattern: /\b(parmesan|pecorino|grana padano)\b/i, pricePerKg: 22.00 },
  { pattern: /\b(gruyere|gruyère|emmental|comte|comté|cheddar)\b/i, pricePerKg: 13.00 },
  { pattern: /\b(mozzarella|burrata|feta)\b/i, pricePerPiece: 1.30, pricePerKg: 10.00 },
  // Meats & Fish
  { pattern: /\b(guanciale|pancetta|lardon|lardons|bacon)\b/i, pricePerKg: 13.00 },
  { pattern: /\b(jambon|jambon blanc|jambon cru)\b/i, pricePerPiece: 0.75, pricePerKg: 14.00 },
  { pattern: /\b(poulet|dinde|escalope|filet de volaille)\b/i, pricePerKg: 11.50, pricePerPiece: 2.00 },
  { pattern: /\b(boeuf|bœuf|steak|viande hachee|viande hachée)\b/i, pricePerKg: 15.00, pricePerPiece: 2.20 },
  { pattern: /\b(saumon|cabillaud|colin|dorade|bar)\b/i, pricePerKg: 17.00, pricePerPiece: 3.00 },
  { pattern: /\b(thon en boite|thon au naturel|thon)\b/i, pricePerPiece: 1.60, pricePerKg: 12.00 },
  // Veggies & Fruits
  { pattern: /\b(oignon|oignons|echalote|échalote)\b/i, pricePerKg: 2.00, pricePerPiece: 0.25 },
  { pattern: /\b(ail)\b/i, pricePerPiece: 0.10 },
  { pattern: /\b(carotte|carottes)\b/i, pricePerKg: 1.80, pricePerPiece: 0.20 },
  { pattern: /\b(tomate|tomates|tomate pelee|coulis de tomate|pulpe de tomate)\b/i, pricePerKg: 2.80, pricePerPiece: 0.50 },
  { pattern: /\b(courgette|courgettes|poivron|poivrons|aubergine|aubergines)\b/i, pricePerKg: 3.00, pricePerPiece: 0.70 },
  { pattern: /\b(avocat|avocats)\b/i, pricePerPiece: 1.20 },
  { pattern: /\b(citron|citrons|lime)\b/i, pricePerPiece: 0.50 },
  { pattern: /\b(salade|laitue|mache|roquette)\b/i, pricePerPiece: 1.20, pricePerKg: 6.00 },
  // Bakery
  { pattern: /\b(pain|baguette|pain de mie|tortilla|wrap|pain burger)\b/i, pricePerPiece: 0.40 },
  // Condiments & Oils
  { pattern: /\b(huile d'olive|huile)\b/i, pricePerLiter: 7.50 },
  { pattern: /\b(sauce soja|vinaigre)\b/i, pricePerLiter: 4.50 },
  { pattern: /\b(sel|poivre|epice|épice|paprika|cumin|curry|herbes|origan|thym)\b/i, pricePerPiece: 0.08 },
  { pattern: /\b(sucre|cassonade|miel)\b/i, pricePerKg: 2.50 },
  { pattern: /\b(chocolat|cacao)\b/i, pricePerKg: 10.00 }
];

const CATEGORY_DEFAULT_PRICES: Record<string, { perKg: number; perLiter: number; perPiece: number }> = {
  fruits_legumes: { perKg: 2.90, perLiter: 2.50, perPiece: 0.50 },
  vegetables: { perKg: 2.90, perLiter: 2.50, perPiece: 0.50 },
  fruits: { perKg: 3.20, perLiter: 2.80, perPiece: 0.60 },
  boucherie: { perKg: 13.50, perLiter: 10.00, perPiece: 2.20 },
  meat: { perKg: 13.50, perLiter: 10.00, perPiece: 2.20 },
  poissonnerie: { perKg: 16.00, perLiter: 12.00, perPiece: 2.80 },
  fish: { perKg: 16.00, perLiter: 12.00, perPiece: 2.80 },
  produits_laitiers: { perKg: 6.50, perLiter: 1.40, perPiece: 0.60 },
  dairy: { perKg: 6.50, perLiter: 1.40, perPiece: 0.60 },
  epicerie_salee: { perKg: 2.80, perLiter: 1.60, perPiece: 0.40 },
  grains: { perKg: 2.50, perLiter: 1.50, perPiece: 0.40 },
  epicerie_sucree: { perKg: 3.80, perLiter: 2.50, perPiece: 0.45 },
  produits_frais: { perKg: 5.50, perLiter: 2.20, perPiece: 0.50 },
  produits_surgeles: { perKg: 5.20, perLiter: 3.00, perPiece: 0.90 },
  boissons: { perKg: 2.00, perLiter: 1.40, perPiece: 1.20 },
  beverages: { perKg: 2.00, perLiter: 1.40, perPiece: 1.20 },
  spices: { perKg: 15.00, perLiter: 10.00, perPiece: 0.10 },
  oils: { perKg: 7.00, perLiter: 7.00, perPiece: 0.15 },
  autre: { perKg: 4.00, perLiter: 2.50, perPiece: 0.60 },
};

/**
 * Calculates estimated cost for a single ingredient in Euros
 */
export function calculateIngredientCost(ing: RecipeIngredientCostInput): number {
  const name = (ing.name || "").trim().toLowerCase();
  const quantity = typeof ing.quantity === "number" && ing.quantity > 0 ? ing.quantity : 1;
  const unit = (ing.unit || "piece").toLowerCase();
  const rawCategory = ing.category || ing.ingredient?.category || "autre";
  const catKey = String(rawCategory).toLowerCase();

  // 1. Look for specific pattern match
  const specificMatch = SPECIFIC_ITEM_PRICES.find((item) => item.pattern.test(name));

  if (specificMatch) {
    if (unit === "kg") {
      return (specificMatch.pricePerKg ?? 4.0) * quantity;
    }
    if (unit === "g") {
      return ((specificMatch.pricePerKg ?? 4.0) / 1000) * quantity;
    }
    if (unit === "l") {
      return (specificMatch.pricePerLiter ?? (specificMatch.pricePerKg ?? 3.5)) * quantity;
    }
    if (unit === "ml") {
      return ((specificMatch.pricePerLiter ?? (specificMatch.pricePerKg ?? 3.5)) / 1000) * quantity;
    }
    if (unit === "cuillere_soupe") {
      // ~15g or 15ml
      return ((specificMatch.pricePerKg ?? 5.0) / 1000) * 15 * quantity;
    }
    if (unit === "cuillere_the") {
      // ~5g or 5ml
      return ((specificMatch.pricePerKg ?? 5.0) / 1000) * 5 * quantity;
    }
    // Unit is piece or unknown
    if (specificMatch.pricePerPiece !== undefined) {
      return specificMatch.pricePerPiece * quantity;
    }
    if (specificMatch.pricePerKg !== undefined) {
      // Assume average piece weight ~120g
      return (specificMatch.pricePerKg * 0.12) * quantity;
    }
  }

  // 2. Fallback to Category Table
  const catPricing = CATEGORY_DEFAULT_PRICES[catKey] || CATEGORY_DEFAULT_PRICES.autre;

  if (unit === "kg") {
    return catPricing.perKg * quantity;
  }
  if (unit === "g") {
    return (catPricing.perKg / 1000) * quantity;
  }
  if (unit === "l") {
    return catPricing.perLiter * quantity;
  }
  if (unit === "ml") {
    return (catPricing.perLiter / 1000) * quantity;
  }
  if (unit === "cuillere_soupe") {
    return (catPricing.perKg / 1000) * 15 * quantity;
  }
  if (unit === "cuillere_the") {
    return (catPricing.perKg / 1000) * 5 * quantity;
  }

  // Default piece
  return catPricing.perPiece * quantity;
}

/**
 * Calculates estimated cost per serving and total cost for a recipe.
 */
export function calculateRecipeCost(recipe: RecipeCostInput): RecipeCostEstimate {
  const servings = Math.max(1, recipe.servings || 4);
  const ingredients = recipe.ingredients || [];

  let totalCost = 0;

  if (ingredients.length > 0) {
    for (const ing of ingredients) {
      totalCost += calculateIngredientCost(ing);
    }
  } else {
    // Heuristic estimation when recipe has no ingredient breakdown
    const tags = (recipe.tags || []).map((t) => t.toLowerCase());
    const isBudgetTag = tags.includes("etudiant") || tags.includes("economique") || tags.includes("petit_budget") || tags.includes("rapide");
    const isVege = recipe.category === "vegetarien" || recipe.category === "vegan" || tags.includes("vegetarien");

    let perServingEstimate = 3.20;
    if (isBudgetTag) {
      perServingEstimate = 1.90;
    } else if (isVege) {
      perServingEstimate = 2.20;
    } else if (recipe.category === "dessert" || recipe.category === "encas") {
      perServingEstimate = 1.60;
    } else if (recipe.category === "petit_dejeuner") {
      perServingEstimate = 1.80;
    }

    totalCost = perServingEstimate * servings;
  }

  // Rounding: min total cost 0.50 €
  totalCost = Math.max(0.50, Math.round(totalCost * 100) / 100);
  const costPerServing = Math.round((totalCost / servings) * 100) / 100;
  const isBudget = costPerServing <= BUDGET_MAX_PORTION;

  return {
    totalCost,
    costPerServing,
    isBudget,
    formattedCostPerServing: `~${costPerServing.toFixed(2).replace(".", ",")} € / part`,
    formattedTotalCost: `~${totalCost.toFixed(2).replace(".", ",")} € total`,
  };
}
