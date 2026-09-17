import { 
  RecipeWithDetails, 
  StockWithIngredient, 
  MeasurementUnit, 
  IngredientCategory,
  MealPlanWithRecipe,
  MealPlanRecipeSnapshot,
  BatchCookingSession,
  BatchCookingTask,
  MealPlanSlot
} from "@/types/database";
import { CatalogRecipe } from "@/data/recipesCatalog";
import { 
  findMatchingStockItems, 
  convertQuantity, 
  normalizeText, 
  toSingular 
} from "./stock-matching";
import { 
  startOfWeek, 
  addDays, 
  format, 
  isSameDay, 
  isToday 
} from "date-fns";
import { fr } from "date-fns/locale";

// ==========================================
// 1. DATE & CALENDAR HELPERS
// ==========================================

export interface DayInfo {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayName: string; // "Lundi", "Mardi", ...
  shortDayName: string; // "Lun", "Mar", ...
  dayNumber: string; // "15"
  monthName: string; // "sept."
  isCurrentDay: boolean;
}

/**
 * Returns the 7 days (Monday to Sunday) for the week containing the given date.
 */
export function getWeekDates(baseDate: Date): DayInfo[] {
  const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(monday, i);
    return {
      date: day,
      dateKey: format(day, "yyyy-MM-dd"),
      dayName: format(day, "EEEE", { locale: fr }),
      shortDayName: format(day, "EEE", { locale: fr }),
      dayNumber: format(day, "d"),
      monthName: format(day, "MMM", { locale: fr }),
      isCurrentDay: isToday(day)
    };
  });
}

/**
 * Formats a week range header, e.g. "15 - 21 sept. 2026"
 */
export function formatWeekRangeDisplay(baseDate: Date): string {
  const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);
  
  const mondayStr = format(monday, "d", { locale: fr });
  const sundayStr = format(sunday, "d MMM yyyy", { locale: fr });
  return `${mondayStr} – ${sundayStr}`;
}

// ==========================================
// 2. SHOPPING LIST GENERATOR FROM MEAL PLANS
// ==========================================

export interface GeneratedShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: MeasurementUnit;
  category: IngredientCategory;
  ingredientId: string | null;
  neededTotal: number;
  stockAvailable: number;
  isMissing: boolean;
  selected: boolean;
  usedInRecipes: string[];
}

export interface WeeklyShoppingListResult {
  missingItems: GeneratedShoppingItem[];
  availableItems: GeneratedShoppingItem[];
  totalMealsCount: number;
}

/**
 * Calculates aggregated ingredients from all meal plans in a week,
 * subtracts available stock, and generates missing items to buy.
 */
export function generateWeeklyShoppingListItems(
  plans: MealPlanWithRecipe[],
  stock: StockWithIngredient[]
): WeeklyShoppingListResult {
  // Map of normalized key -> aggregated item
  const aggregatedMap = new Map<string, {
    name: string;
    quantity: number;
    unit: MeasurementUnit;
    category: IngredientCategory;
    ingredientId: string | null;
    usedInRecipes: Set<string>;
  }>();

  let totalMealsCount = 0;

  for (const plan of plans) {
    const recipe = plan.recipe || plan.recipe_snapshot;
    if (!recipe && !plan.custom_title) continue;
    totalMealsCount++;

    const recipeTitle = recipe?.title || plan.custom_title || "Repas";
    const planServings = plan.servings || 2;
    const baseServings = recipe?.servings || 2;
    const ratio = baseServings > 0 ? planServings / baseServings : 1;

    // Collect ingredients from recipe or snapshot
    const ingredients = recipe?.ingredients || [];
    for (const ing of ingredients) {
      if (!ing.name) continue;
      const rawQty = ing.quantity !== null && ing.quantity !== undefined ? ing.quantity * ratio : 1;
      const qty = Math.round(rawQty * 10) / 10;
      const unit = (ing.unit as MeasurementUnit) || "piece";
      const category = (ing.category as IngredientCategory) || "autre";
      const ingredientId = ing.ingredient_id || null;

      const normName = normalizeText(ing.name);
      const singularName = normName.split(" ").map(toSingular).join(" ");
      const key = `${ingredientId || singularName}_${unit}`;

      if (aggregatedMap.has(key)) {
        const existing = aggregatedMap.get(key)!;
        existing.quantity = Math.round((existing.quantity + qty) * 10) / 10;
        existing.usedInRecipes.add(recipeTitle);
      } else {
        aggregatedMap.set(key, {
          name: ing.name,
          quantity: qty,
          unit,
          category,
          ingredientId,
          usedInRecipes: new Set([recipeTitle])
        });
      }
    }
  }

  const missingItems: GeneratedShoppingItem[] = [];
  const availableItems: GeneratedShoppingItem[] = [];

  // Match against current stock
  aggregatedMap.forEach((item, key) => {
    const matchedStockItems = findMatchingStockItems(
      {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        ingredient_id: item.ingredientId
      },
      stock
    );

    let totalStock = 0;
    for (const s of matchedStockItems) {
      if (s.quantity <= 0) continue;
      if (!item.unit || !s.unit || item.unit === s.unit) {
        totalStock += Number(s.quantity);
      } else {
        const converted = convertQuantity(Number(s.quantity), s.unit, item.unit);
        if (converted !== null) {
          totalStock += converted;
        } else {
          totalStock += Number(s.quantity);
        }
      }
    }

    const stockQtyRounded = Math.round(totalStock * 10) / 10;
    const diff = Math.round((item.quantity - stockQtyRounded) * 10) / 10;
    const missingQty = Math.max(0, diff);
    const isMissing = missingQty > 0;

    const resultItem: GeneratedShoppingItem = {
      id: `gen-${key}`,
      name: item.name,
      quantity: isMissing ? missingQty : item.quantity,
      unit: item.unit,
      category: item.category,
      ingredientId: item.ingredientId,
      neededTotal: item.quantity,
      stockAvailable: stockQtyRounded,
      isMissing,
      selected: isMissing,
      usedInRecipes: Array.from(item.usedInRecipes)
    };

    if (isMissing) {
      missingItems.push(resultItem);
    } else {
      availableItems.push(resultItem);
    }
  });

  return {
    missingItems,
    availableItems,
    totalMealsCount
  };
}

// ==========================================
// 3. BATCH COOKING ROADMAP GENERATOR
// ==========================================

export function generateBatchCookingSession(
  recipes: Array<RecipeWithDetails | MealPlanRecipeSnapshot>
): BatchCookingSession {
  if (!recipes || recipes.length === 0) {
    return {
      selectedRecipes: [],
      estimatedTotalMinutes: 0,
      savedMinutes: 0,
      tasks: [],
      storageAdvice: []
    };
  }

  // 1. Calculate time savings
  const individualTotalMinutes = recipes.reduce((sum, r) => {
    const prep = r.prep_time || 15;
    const cook = r.cook_time || 20;
    return sum + prep + cook;
  }, 0);

  // Grouped batch cooking typically takes 60-90 minutes for 3-4 recipes
  const basePrep = 20 + recipes.length * 5; // ~35-40 min for cuts
  const parallelCook = Math.max(...recipes.map(r => r.cook_time || 25), 35);
  const packaging = 10 + recipes.length * 2;
  const estimatedTotalMinutes = Math.min(individualTotalMinutes, Math.round(basePrep + parallelCook * 0.6 + packaging));
  const savedMinutes = Math.max(15, individualTotalMinutes - estimatedTotalMinutes);

  // 2. Identify common ingredients for prep
  const alliumWords = ["oignon", "oignons", "ail", "echalote", "echalotes"];
  const vegetableWords = ["carotte", "courgette", "poivron", "champignon", "tomate", "patate", "pomme de terre", "aubergine", "brocoli", "poireau"];
  const ovenKeywords = ["four", "gratin", "roti", "tarte", "quiche", "bake", "enfourner", "dorer"];

  const alliums: { name: string; recipes: string[] }[] = [];
  const vegetables: { name: string; recipes: string[] }[] = [];
  const otherPreps: { name: string; recipes: string[] }[] = [];

  recipes.forEach(recipe => {
    const title = recipe.title;
    (recipe.ingredients || []).forEach(ing => {
      const lower = ing.name.toLowerCase();
      if (alliumWords.some(w => lower.includes(w))) {
        alliums.push({ name: ing.name, recipes: [title] });
      } else if (vegetableWords.some(w => lower.includes(w))) {
        vegetables.push({ name: ing.name, recipes: [title] });
      } else if (!lower.includes("sel") && !lower.includes("poivre") && !lower.includes("eau") && !lower.includes("huile")) {
        otherPreps.push({ name: ing.name, recipes: [title] });
      }
    });
  });

  const recipeTitles = recipes.map(r => r.title);

  // 3. Build structured tasks
  const tasks: BatchCookingTask[] = [
    {
      id: "step-1-alliums",
      category: "prep",
      title: "Mise en place : Découpe en bloc des oignons et de l'ail",
      description: alliums.length > 0
        ? `Éplucher et émincer l'ensemble des oignons et hacher l'ail pour toutes les recettes en une seule fois.`
        : `Éplucher et ciseler les aromates pour l'ensemble des recettes.`,
      durationMinutes: 10,
      associatedRecipes: recipeTitles,
      ingredients: alliums.map(a => a.name)
    },
    {
      id: "step-2-veg",
      category: "prep",
      title: "Taillage groupé des légumes",
      description: vegetables.length > 0
        ? `Laver, éplucher et découper tous les légumes en morceaux réguliers (dés, rondelles ou bâtonnets).`
        : `Préparer et portionner les légumes et accompagnements frais.`,
      durationMinutes: 15,
      associatedRecipes: recipeTitles,
      ingredients: vegetables.map(v => v.name)
    },
    {
      id: "step-3-oven",
      category: "oven",
      title: "Optimisation Four : Préchauffage unique & cuisson combinée",
      description: `Préchauffer le four à 190°C. Si vous préparez des légumes rôtis, gratins ou tartes, enfournez-les simultanément sur 2 grilles.`,
      durationMinutes: 35,
      associatedRecipes: recipeTitles.filter((_, idx) => idx % 2 === 0 || idx === 0)
    },
    {
      id: "step-4-stovetop",
      category: "stovetop",
      title: "Plaques de cuisson : Mijotage & féculents en parallèle",
      description: `Sur un feu doux, lancer le plat mijoté ou la sauce dans une cocotte/casserole. Sur un second feu, cuire les féculents (riz, pâtes ou légumineuses) al dente.`,
      durationMinutes: 25,
      associatedRecipes: recipeTitles
    },
    {
      id: "step-5-packaging",
      category: "packaging",
      title: "Refroidissement, portionnement & étiquetage",
      description: `Laisser tiédir à température ambiante pour éviter la buée. Répartir dans des boîtes hermétiques propres. Conserver les sauces séparément des féculents si possible.`,
      durationMinutes: 10,
      associatedRecipes: recipeTitles
    }
  ];

  // 4. Build storage advice
  const storageAdvice = recipes.map((recipe, index) => {
    const isFishOrDairy = (recipe.ingredients || []).some(i => {
      const lower = i.name.toLowerCase();
      return lower.includes("poisson") || lower.includes("saumon") || lower.includes("crevette") || lower.includes("creme") || lower.includes("creme fraiche");
    });

    const isSimmeredOrGrain = (recipe.ingredients || []).some(i => {
      const lower = i.name.toLowerCase();
      return lower.includes("lentille") || lower.includes("pois chiche") || lower.includes("riz") || lower.includes("sauce") || lower.includes("tomate");
    });

    if (isFishOrDairy) {
      return {
        recipeTitle: recipe.title,
        shelfLifeDays: 2,
        location: 'fridge' as const,
        containerType: 'Boîte en verre hermétique',
        tip: 'À consommer en priorité (Lundi ou Mardi). Ne pas congeler si crème fraîche.'
      };
    } else if (isSimmeredOrGrain || index >= 2) {
      return {
        recipeTitle: recipe.title,
        shelfLifeDays: 4,
        location: index === 3 ? ('freezer' as const) : ('fridge' as const),
        containerType: index === 3 ? 'Boîte adaptée congélateur' : 'Boîte en verre sous vide ou hermétique',
        tip: index === 3 ? 'Congeler directement après refroidissement pour Jeudi ou Vendredi.' : 'Se bonifie avec le temps ! Parfait pour Mercredi ou Jeudi.'
      };
    } else {
      return {
        recipeTitle: recipe.title,
        shelfLifeDays: 3,
        location: 'fridge' as const,
        containerType: 'Boîte hermétique',
        tip: 'Conserver au réfrigérateur à 4°C. Réchauffer à feu doux.'
      };
    }
  });

  return {
    selectedRecipes: recipes,
    estimatedTotalMinutes,
    savedMinutes,
    tasks,
    storageAdvice
  };
}

// ==========================================
// 4. SMART AI / LOCAL WEEK PLAN GENERATOR
// ==========================================

export interface MealPlanPreferences {
  budget: 'economique' | 'equilibre' | 'gourmand';
  vegetarienCount: number; // e.g. 2, 4
  quickCount: number; // e.g. 3, 5 (<= 25 min)
  prioritizeStock: boolean;
  planMode: 'all' | 'dinners_only' | 'weekdays_only';
}

export interface GeneratedWeekPlan {
  days: {
    dateKey: string;
    dayName: string;
    lunch?: {
      title: string;
      recipeId?: string;
      catalogId?: string;
      imageUrl?: string;
      prepCookTime: number;
      tags: string[];
      stockMatches: number;
      isVegetarian: boolean;
      recipeRef?: RecipeWithDetails | CatalogRecipe;
    };
    dinner?: {
      title: string;
      recipeId?: string;
      catalogId?: string;
      imageUrl?: string;
      prepCookTime: number;
      tags: string[];
      stockMatches: number;
      isVegetarian: boolean;
      recipeRef?: RecipeWithDetails | CatalogRecipe;
    };
  }[];
}

/**
 * Intelligent deterministic generator that produces a balanced 7-day plan
 * adhering to stock, vegetarian quota, quick recipe quota, and budget.
 */
export function generateSmartWeekPlan(
  startDate: Date,
  userRecipes: RecipeWithDetails[],
  catalogRecipes: CatalogRecipe[],
  stock: StockWithIngredient[],
  preferences: MealPlanPreferences
): GeneratedWeekPlan {
  const weekDays = getWeekDates(startDate);

  // Combine user recipes and catalog recipes
  type ScoredRecipe = {
    recipe: RecipeWithDetails | CatalogRecipe;
    id: string;
    isCatalog: boolean;
    title: string;
    imageUrl?: string;
    totalTime: number;
    isVegetarian: boolean;
    isQuick: boolean;
    isBudget: boolean;
    stockMatchScore: number;
  };

  const pool: ScoredRecipe[] = [];

  // Helper to score
  const evaluate = (r: RecipeWithDetails | CatalogRecipe, isCatalog: boolean): ScoredRecipe => {
    const totalTime = (r.prep_time || 15) + (r.cook_time || 15);
    const tags = (r.tags || []).map(t => t.toLowerCase());
    const isVegetarian = r.category === 'vegetarien' || r.category === 'vegan' || tags.includes('vegetarien') || tags.includes('vege');
    const isQuick = totalTime <= 25 || tags.includes('rapide');
    const isBudget = tags.includes('etudiant') || tags.includes('economique') || (r.difficulty === 'facile' && totalTime <= 20);

    let stockMatchScore = 0;
    if (preferences.prioritizeStock && stock.length > 0) {
      const ings = r.ingredients || [];
      for (const ing of ings) {
        const matches = findMatchingStockItems({ name: ing.name, quantity: 1, unit: null }, stock);
        if (matches.length > 0) stockMatchScore++;
      }
    }

    return {
      recipe: r,
      id: r.id,
      isCatalog,
      title: r.title,
      imageUrl: r.image_url || undefined,
      totalTime,
      isVegetarian,
      isQuick,
      isBudget,
      stockMatchScore
    };
  };

  userRecipes.forEach(r => pool.push(evaluate(r, false)));
  catalogRecipes.forEach(r => {
    if (!pool.some(p => p.title.toLowerCase() === r.title.toLowerCase())) {
      pool.push(evaluate(r, true));
    }
  });

  // Sort candidate pool with preferred criteria
  pool.sort((a, b) => {
    if (preferences.prioritizeStock && b.stockMatchScore !== a.stockMatchScore) {
      return b.stockMatchScore - a.stockMatchScore;
    }
    if (preferences.budget === 'economique' && a.isBudget !== b.isBudget) {
      return a.isBudget ? -1 : 1;
    }
    return Math.random() - 0.5;
  });

  // Distribute across days
  const usedTitles = new Set<string>();
  let currentVegeCount = 0;
  let currentQuickCount = 0;

  const pickCandidate = (needVege: boolean, needQuick: boolean): ScoredRecipe | null => {
    let candidate = pool.find(p => !usedTitles.has(p.title) && (!needVege || p.isVegetarian) && (!needQuick || p.isQuick));
    if (!candidate && needQuick) {
      candidate = pool.find(p => !usedTitles.has(p.title) && (!needVege || p.isVegetarian));
    }
    if (!candidate && needVege) {
      candidate = pool.find(p => !usedTitles.has(p.title));
    }
    if (!candidate) {
      candidate = pool.find(p => !usedTitles.has(p.title)) || pool[Math.floor(Math.random() * pool.length)];
    }
    if (candidate) {
      usedTitles.add(candidate.title);
      if (candidate.isVegetarian) currentVegeCount++;
      if (candidate.isQuick) currentQuickCount++;
    }
    return candidate;
  };

  const daysResult = weekDays.map((day, dayIndex) => {
    const isWeekend = dayIndex >= 5;
    const skipLunch = preferences.planMode === 'dinners_only' || (preferences.planMode === 'weekdays_only' && isWeekend);
    const skipDinner = preferences.planMode === 'weekdays_only' && isWeekend;

    let lunchItem = undefined;
    if (!skipLunch) {
      const needVege = currentVegeCount < preferences.vegetarienCount;
      const needQuick = currentQuickCount < preferences.quickCount;
      const picked = pickCandidate(needVege, needQuick);
      if (picked) {
        lunchItem = {
          title: picked.title,
          recipeId: picked.isCatalog ? undefined : picked.id,
          catalogId: picked.isCatalog ? picked.id : undefined,
          imageUrl: picked.imageUrl,
          prepCookTime: picked.totalTime,
          tags: picked.recipe.tags || [],
          stockMatches: picked.stockMatchScore,
          isVegetarian: picked.isVegetarian,
          recipeRef: picked.recipe
        };
      }
    }

    let dinnerItem = undefined;
    if (!skipDinner) {
      const needVege = currentVegeCount < preferences.vegetarienCount;
      const needQuick = currentQuickCount < preferences.quickCount;
      const picked = pickCandidate(needVege, needQuick);
      if (picked) {
        dinnerItem = {
          title: picked.title,
          recipeId: picked.isCatalog ? undefined : picked.id,
          catalogId: picked.isCatalog ? picked.id : undefined,
          imageUrl: picked.imageUrl,
          prepCookTime: picked.totalTime,
          tags: picked.recipe.tags || [],
          stockMatches: picked.stockMatchScore,
          isVegetarian: picked.isVegetarian,
          recipeRef: picked.recipe
        };
      }
    }

    return {
      dateKey: day.dateKey,
      dayName: day.dayName,
      lunch: lunchItem,
      dinner: dinnerItem
    };
  });

  return { days: daysResult };
}
