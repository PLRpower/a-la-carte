import { describe, it, expect } from "vitest";
import { 
  getWeekDates, 
  formatWeekRangeDisplay, 
  generateWeeklyShoppingListItems, 
  generateBatchCookingSession,
  generateSmartWeekPlan
} from "./meal-planner-utils";
import { MealPlanWithRecipe, StockWithIngredient } from "@/types/database";

describe("meal-planner-utils", () => {
  it("getWeekDates returns exactly 7 days starting from Monday", () => {
    const testDate = new Date(2026, 8, 16); // Sept 16, 2026 (Wednesday)
    const days = getWeekDates(testDate);
    expect(days).toHaveLength(7);
    expect(days[0].dayName.toLowerCase()).toBe("lundi");
    expect(days[6].dayName.toLowerCase()).toBe("dimanche");
    expect(days[0].dateKey).toBe("2026-09-14");
    expect(days[6].dateKey).toBe("2026-09-20");
  });

  it("formatWeekRangeDisplay formats human readable french week", () => {
    const testDate = new Date(2026, 8, 16);
    const label = formatWeekRangeDisplay(testDate);
    expect(label).toContain("14");
    expect(label).toContain("20 sept. 2026");
  });

  it("generateWeeklyShoppingListItems subtracts available stock correctly", () => {
    const plans: MealPlanWithRecipe[] = [
      {
        id: "plan-1",
        user_id: "user-1",
        date: "2026-09-14",
        slot: "lunch",
        recipe_id: "rec-1",
        custom_title: null,
        servings: 4,
        created_at: "",
        updated_at: "",
        recipe_snapshot: {
          title: "Pâtes Tomate",
          servings: 2, // ratio = 4 / 2 = 2
          ingredients: [
            { name: "Pâtes", quantity: 200, unit: "g" },
            { name: "Tomates", quantity: 3, unit: "piece" },
            { name: "Basilic", quantity: 1, unit: "piece" }
          ]
        }
      }
    ];

    const stock: StockWithIngredient[] = [
      {
        id: "stock-1",
        user_id: "user-1",
        ingredient_id: "ing-1",
        quantity: 250,
        unit: "g",
        expiration_date: null,
        low_stock: false,
        created_at: "",
        updated_at: "",
        ingredient: {
          id: "ing-1",
          name: "Pâtes",
          category: "epicerie_salee",
          image_url: null,
          created_at: ""
        }
      },
      {
        id: "stock-2",
        user_id: "user-1",
        ingredient_id: "ing-2",
        quantity: 10,
        unit: "piece",
        expiration_date: null,
        low_stock: false,
        created_at: "",
        updated_at: "",
        ingredient: {
          id: "ing-2",
          name: "Tomates",
          category: "fruits_legumes",
          image_url: null,
          created_at: ""
        }
      }
    ];

    const result = generateWeeklyShoppingListItems(plans, stock);

    // Needed:
    // Pâtes: 200 * 2 = 400g. Stock = 250g. Missing = 150g.
    // Tomates: 3 * 2 = 6 piece. Stock = 10 piece. Missing = 0.
    // Basilic: 1 * 2 = 2 piece. Stock = 0. Missing = 2 piece.

    expect(result.missingItems).toHaveLength(2);
    
    const patesItem = result.missingItems.find(i => i.name.toLowerCase().includes("pâtes"));
    expect(patesItem).toBeDefined();
    expect(patesItem?.quantity).toBe(150);
    expect(patesItem?.stockAvailable).toBe(250);

    const basilicItem = result.missingItems.find(i => i.name.toLowerCase().includes("basilic"));
    expect(basilicItem).toBeDefined();
    expect(basilicItem?.quantity).toBe(2);

    expect(result.availableItems).toHaveLength(1);
    expect(result.availableItems[0].name.toLowerCase()).toContain("tomate");
  });

  it("generateBatchCookingSession creates 5 structured phases and estimates time saved", () => {
    const recipes = [
      {
        id: "r1",
        title: "Gratin de légumes",
        prep_time: 20,
        cook_time: 40,
        servings: 4,
        ingredients: [
          { name: "Courgettes", quantity: 3, unit: "piece" as const },
          { name: "Oignons", quantity: 2, unit: "piece" as const }
        ]
      },
      {
        id: "r2",
        title: "Curry de pois chiches",
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        ingredients: [
          { name: "Pois chiches", quantity: 400, unit: "g" as const },
          { name: "Ail", quantity: 3, unit: "piece" as const },
          { name: "Oignons", quantity: 1, unit: "piece" as const }
        ]
      },
      {
        id: "r3",
        title: "Saumon aux brocolis",
        prep_time: 15,
        cook_time: 20,
        servings: 2,
        ingredients: [
          { name: "Saumon", quantity: 2, unit: "piece" as const },
          { name: "Brocolis", quantity: 1, unit: "piece" as const }
        ]
      }
    ];

    const session = generateBatchCookingSession(recipes as any);
    expect(session.tasks).toHaveLength(5);
    expect(session.savedMinutes).toBeGreaterThan(0);
    expect(session.storageAdvice).toHaveLength(3);
    
    // Fish is flagged for priority consumption (shelfLife = 2 days)
    const fishAdvice = session.storageAdvice.find(a => a.recipeTitle.includes("Saumon"));
    expect(fishAdvice?.shelfLifeDays).toBe(2);
  });

  it("generateSmartWeekPlan distributes recipes according to quotas", () => {
    const testDate = new Date(2026, 8, 14);
    const catalog = [
      {
        id: "cat-1",
        title: "Salade Végé Express",
        prep_time: 10,
        cook_time: 5,
        servings: 2,
        category: "vegetarien" as const,
        difficulty: "facile" as const,
        tags: ["vegetarien", "rapide"],
        ingredients: [],
        description: "",
        image_url: "",
        source: "website" as const,
        instructions: "",
        is_public: true
      },
      {
        id: "cat-2",
        title: "Poulet Rôti",
        prep_time: 15,
        cook_time: 45,
        servings: 4,
        category: "diner" as const,
        difficulty: "moyen" as const,
        tags: ["famille"],
        ingredients: [],
        description: "",
        image_url: "",
        source: "website" as const,
        instructions: "",
        is_public: true
      }
    ];

    const plan = generateSmartWeekPlan(testDate, [], catalog, [], {
      budget: "equilibre",
      vegetarienCount: 2,
      quickCount: 3,
      prioritizeStock: false,
      planMode: "all"
    });

    expect(plan.days).toHaveLength(7);
    expect(plan.days[0].lunch).toBeDefined();
    expect(plan.days[0].dinner).toBeDefined();
  });
});
