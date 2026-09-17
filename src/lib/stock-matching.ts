import { MeasurementUnit, StockWithIngredient } from "@/types/database";

export interface RecipeIngredientLike {
  id?: string;
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
  ingredient_id?: string | null;
  ingredient?: {
    id: string;
    name: string;
    synonyms?: string[];
  } | null;
}

export interface IngredientStockStatus {
  name: string;
  neededQuantity: number | null;
  unit: MeasurementUnit | null;
  ingredient_id?: string | null;
  stockItem: StockWithIngredient | null;
  stockQuantity: number;
  stockUnit: MeasurementUnit | null;
  isAvailable: boolean;
  missingQuantity: number;
}

export interface RecipeStockAnalysis {
  totalCount: number;
  availableCount: number;
  missingCount: number;
  matchPercentage: number;
  isCookable: boolean;
  statuses: IngredientStockStatus[];
}

export interface StockDeduction {
  stockId: string;
  ingredientName: string;
  currentQuantity: number;
  deductedQuantity: number;
  newQuantity: number;
  unit: MeasurementUnit;
  isDepleted: boolean;
  isLowStock: boolean;
}

export interface DestockingResult {
  deductions: StockDeduction[];
  untrackedIngredients: string[];
  depletedOrLowStockItems: Array<{
    name: string;
    quantity: number | null;
    unit: MeasurementUnit;
    ingredientId?: string;
  }>;
}

/**
 * Normalizes a string: lowercased, stripped accents, expanded ligatures, trimmed.
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * French plural/singular normalizer.
 * Removes trailing 's' or 'x' from words of length > 3.
 */
export const toSingular = (word: string): string => {
  if (word.length > 3 && (word.endsWith("s") || word.endsWith("x"))) {
    return word.slice(0, -1);
  }
  return word;
};

const MASS_UNITS: Record<string, number> = {
  g: 1,
  kg: 1000,
};

const VOLUME_UNITS: Record<string, number> = {
  ml: 1,
  l: 1000,
  cuillere_soupe: 15,
  cuillere_the: 5,
};

/**
 * Converts quantity between units of same dimension (mass or volume).
 * Returns null if units cannot be converted.
 */
export const convertQuantity = (
  quantity: number,
  fromUnit: MeasurementUnit | null | string,
  toUnit: MeasurementUnit | null | string
): number | null => {
  if (!fromUnit || !toUnit) return null;
  if (fromUnit === toUnit) return quantity;

  // Mass conversion
  if (fromUnit in MASS_UNITS && toUnit in MASS_UNITS) {
    const inGrams = quantity * MASS_UNITS[fromUnit];
    return inGrams / MASS_UNITS[toUnit];
  }

  // Volume conversion
  if (fromUnit in VOLUME_UNITS && toUnit in VOLUME_UNITS) {
    const inMl = quantity * VOLUME_UNITS[fromUnit];
    return inMl / VOLUME_UNITS[toUnit];
  }

  return null;
};

/**
 * Checks if a recipe ingredient matches a stock item.
 */
export const isIngredientMatch = (
  recipeIng: RecipeIngredientLike,
  stockItem: StockWithIngredient
): boolean => {
  // 1. Check direct ingredient_id match
  const recipeIngId = recipeIng.ingredient_id || recipeIng.ingredient?.id;
  if (recipeIngId && stockItem.ingredient_id && recipeIngId === stockItem.ingredient_id) {
    return true;
  }

  const recipeNorm = normalizeText(recipeIng.name);
  const stockNorm = normalizeText(stockItem.ingredient?.name || "");

  if (!recipeNorm || !stockNorm) return false;

  // 2. Direct exact normalized match
  if (recipeNorm === stockNorm) return true;

  // 3. Singular match
  const recipeSingular = recipeNorm.split(" ").map(toSingular).join(" ");
  const stockSingular = stockNorm.split(" ").map(toSingular).join(" ");
  if (recipeSingular === stockSingular) return true;

  // 4. Check synonyms on stock item
  if (stockItem.ingredient?.synonyms && Array.isArray(stockItem.ingredient.synonyms)) {
    for (const syn of stockItem.ingredient.synonyms) {
      const synNorm = normalizeText(syn);
      if (synNorm === recipeNorm) return true;
      const synSingular = synNorm.split(" ").map(toSingular).join(" ");
      if (synSingular === recipeSingular) return true;
      if (recipeNorm.includes(synNorm) || synNorm.includes(recipeNorm)) {
        // Prevent false positives on very short words
        if (synNorm.length >= 4 || recipeNorm.length >= 4) {
          return true;
        }
      }
    }
  }

  // 5. Handle alternatives like "Pancetta ou Guanciale", "Pecorino ou Parmesan"
  const alternatives = recipeNorm.split(/\b(?:ou|et)\b/);
  if (alternatives.length > 1) {
    for (const alt of alternatives) {
      const altTrimmed = alt.trim();
      if (!altTrimmed) continue;
      const altSingular = altTrimmed.split(" ").map(toSingular).join(" ");
      if (altTrimmed === stockNorm || altSingular === stockSingular) return true;
      if (stockNorm.includes(altTrimmed) || altTrimmed.includes(stockNorm)) {
        if (altTrimmed.length >= 4 && stockNorm.length >= 3) return true;
      }
    }
  }

  // 6. Word containment with word boundaries
  // E.g. recipe "Gousses d'ail" -> contains "ail"
  // E.g. recipe "Poivre noir" -> contains "poivre"
  // E.g. stock "Spaghetti Barilla" -> contains "spaghetti"
  const stockWords = stockNorm.split(" ").filter((w) => w.length >= 3);
  const recipeWords = recipeNorm.split(" ").filter((w) => w.length >= 3);

  // If all significant words of stock are in recipe (e.g. stock "creme fraiche", recipe "creme fraiche liquide")
  if (stockWords.length > 0 && stockWords.every((w) => recipeSingular.includes(toSingular(w)))) {
    return true;
  }

  // If main stock word matches recipe main word
  if (stockWords.length === 1 && recipeWords.some((rw) => toSingular(rw) === toSingular(stockWords[0]))) {
    return true;
  }

  return false;
};

/**
 * Finds all stock items matching a recipe ingredient.
 */
export const findMatchingStockItems = (
  recipeIng: RecipeIngredientLike,
  stock: StockWithIngredient[]
): StockWithIngredient[] => {
  return stock.filter((item) => isIngredientMatch(recipeIng, item));
};

/**
 * Analyzes recipe ingredients against user's stock.
 * Scales needed quantities based on servingsScale (default 1).
 */
export const analyzeRecipeStock = (
  recipeIngredients: RecipeIngredientLike[],
  stock: StockWithIngredient[],
  servingsScale: number = 1
): RecipeStockAnalysis => {
  if (!recipeIngredients || recipeIngredients.length === 0) {
    return {
      totalCount: 0,
      availableCount: 0,
      missingCount: 0,
      matchPercentage: 100,
      isCookable: true,
      statuses: [],
    };
  }

  const statuses: IngredientStockStatus[] = [];
  let availableCount = 0;

  for (const ing of recipeIngredients) {
    const rawQty = ing.quantity !== null && ing.quantity !== undefined ? ing.quantity * servingsScale : null;
    const neededQty = rawQty !== null ? Math.round(rawQty * 10) / 10 : null;

    const matchedItems = findMatchingStockItems(ing, stock);

    if (matchedItems.length === 0) {
      statuses.push({
        name: ing.name,
        neededQuantity: neededQty,
        unit: ing.unit,
        ingredient_id: ing.ingredient_id || ing.ingredient?.id,
        stockItem: null,
        stockQuantity: 0,
        stockUnit: null,
        isAvailable: false,
        missingQuantity: neededQty ?? 1,
      });
      continue;
    }

    const primaryMatch = matchedItems[0];
    let totalStockInRecipeUnit = 0;
    let hasDirectStock = false;

    for (const item of matchedItems) {
      if (item.quantity <= 0) continue;
      hasDirectStock = true;

      if (!ing.unit || !item.unit) {
        totalStockInRecipeUnit += item.quantity;
      } else {
        const converted = convertQuantity(item.quantity, item.unit, ing.unit);
        if (converted !== null) {
          totalStockInRecipeUnit += converted;
        } else {
          // Different dimensions (e.g. piece vs g), treat presence as positive stock
          totalStockInRecipeUnit += item.quantity;
        }
      }
    }

    let isAvailable = false;
    let missingQuantity = 0;

    if (neededQty === null || neededQty <= 0) {
      // No specific quantity needed, presence is enough
      isAvailable = hasDirectStock && primaryMatch.quantity > 0;
      missingQuantity = isAvailable ? 0 : 1;
    } else {
      if (totalStockInRecipeUnit >= neededQty) {
        isAvailable = true;
        missingQuantity = 0;
      } else {
        isAvailable = false;
        missingQuantity = Math.max(0, Math.round((neededQty - totalStockInRecipeUnit) * 10) / 10);
      }
    }

    if (isAvailable) {
      availableCount++;
    }

    statuses.push({
      name: ing.name,
      neededQuantity: neededQty,
      unit: ing.unit,
      ingredient_id: ing.ingredient_id || ing.ingredient?.id || primaryMatch.ingredient_id,
      stockItem: primaryMatch,
      stockQuantity: primaryMatch.quantity,
      stockUnit: primaryMatch.unit,
      isAvailable,
      missingQuantity,
    });
  }

  const totalCount = recipeIngredients.length;
  const missingCount = totalCount - availableCount;
  const matchPercentage = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 100;
  const isCookable = missingCount === 0;

  return {
    totalCount,
    availableCount,
    missingCount,
    matchPercentage,
    isCookable,
    statuses,
  };
};

/**
 * Calculates stock deductions when a recipe is cooked.
 */
export const calculateRecipeDestocking = (
  recipeIngredients: RecipeIngredientLike[],
  stock: StockWithIngredient[],
  servingsScale: number = 1
): DestockingResult => {
  const deductions: StockDeduction[] = [];
  const untrackedIngredients: string[] = [];
  const depletedOrLowStockItems: DestockingResult["depletedOrLowStockItems"] = [];

  for (const ing of recipeIngredients) {
    const rawQty = ing.quantity !== null && ing.quantity !== undefined ? ing.quantity * servingsScale : 1;
    const neededQty = Math.round(rawQty * 10) / 10;

    const matched = findMatchingStockItems(ing, stock);

    if (matched.length === 0) {
      untrackedIngredients.push(ing.name);
      continue;
    }

    const stockItem = matched[0];
    let qtyToDeductInStockUnit = neededQty;

    if (ing.unit && stockItem.unit) {
      const converted = convertQuantity(neededQty, ing.unit, stockItem.unit);
      if (converted !== null) {
        qtyToDeductInStockUnit = Math.round(converted * 10) / 10;
      }
    }

    const currentQty = Number(stockItem.quantity) || 0;
    const newQty = Math.max(0, Math.round((currentQty - qtyToDeductInStockUnit) * 10) / 10);
    const isDepleted = newQty <= 0;

    // Determine low stock: <= 0 or below critical thresholds (e.g., 100g, 100ml, 1 piece)
    const isLowStock =
      isDepleted ||
      stockItem.low_stock ||
      (stockItem.unit === "g" && newQty <= 100) ||
      (stockItem.unit === "ml" && newQty <= 100) ||
      (stockItem.unit === "piece" && newQty <= 1);

    deductions.push({
      stockId: stockItem.id,
      ingredientName: stockItem.ingredient?.name || ing.name,
      currentQuantity: currentQty,
      deductedQuantity: qtyToDeductInStockUnit,
      newQuantity: newQty,
      unit: stockItem.unit,
      isDepleted,
      isLowStock,
    });

    if (isDepleted || isLowStock) {
      depletedOrLowStockItems.push({
        name: stockItem.ingredient?.name || ing.name,
        quantity: isDepleted ? (ing.quantity ? Math.round(ing.quantity * 10) / 10 : 1) : 1,
        unit: stockItem.unit,
        ingredientId: stockItem.ingredient_id,
      });
    }
  }

  return {
    deductions,
    untrackedIngredients,
    depletedOrLowStockItems,
  };
};
