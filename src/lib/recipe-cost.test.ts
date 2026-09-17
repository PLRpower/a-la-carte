import { describe, it, expect } from "vitest";
import { calculateRecipeCost, calculateIngredientCost, BUDGET_MAX_PORTION } from "./recipe-cost";

describe("recipe-cost", () => {
  it("calculates specific ingredient costs correctly", () => {
    // 400g pasta at 2.20 €/kg = ~0.88 €
    const pastaCost = calculateIngredientCost({
      name: "Spaghetti",
      quantity: 400,
      unit: "g",
      category: "epicerie_salee",
    });
    expect(pastaCost).toBeCloseTo(0.88, 2);

    // 4 eggs at 0.35 €/piece = 1.40 €
    const eggCost = calculateIngredientCost({
      name: "Oeufs",
      quantity: 4,
      unit: "piece",
      category: "produits_frais",
    });
    expect(eggCost).toBeCloseTo(1.4, 2);
  });

  it("calculates budget friendly recipe accurately (< 2.50 € / serving)", () => {
    // Carbonara for 4 servings:
    // 400g spaghetti (~0.88€) + 150g lardons (~1.95€) + 4 oeufs (~1.40€) + 70g parmesan (~1.54€) = ~5.77€ / 4 = ~1.44€
    const carbonara = {
      servings: 4,
      ingredients: [
        { name: "Spaghetti", quantity: 400, unit: "g" },
        { name: "Lardons", quantity: 150, unit: "g" },
        { name: "Oeufs", quantity: 4, unit: "piece" },
        { name: "Parmesan", quantity: 70, unit: "g" },
      ],
    };

    const estimate = calculateRecipeCost(carbonara);
    expect(estimate.costPerServing).toBeLessThan(BUDGET_MAX_PORTION);
    expect(estimate.isBudget).toBe(true);
    expect(estimate.formattedCostPerServing).toMatch(/~\d+,\d{2} € \/ part/);
  });

  it("identifies non-budget recipes (> 2.50 € / serving)", () => {
    // Salmon steak for 2 servings: 350g salmon (~5.95€) + 200g crème (~0.84€) = ~6.79€ / 2 = ~3.40€
    const salmonDish = {
      servings: 2,
      ingredients: [
        { name: "Pavé de saumon", quantity: 350, unit: "g" },
        { name: "Crème fraîche", quantity: 200, unit: "ml" },
      ],
    };

    const estimate = calculateRecipeCost(salmonDish);
    expect(estimate.costPerServing).toBeGreaterThan(BUDGET_MAX_PORTION);
    expect(estimate.isBudget).toBe(false);
  });

  it("handles recipes with no ingredients using heuristic estimation", () => {
    const budgetTagRecipe = {
      servings: 4,
      tags: ["etudiant", "rapide"],
      ingredients: [],
    };

    const estimate = calculateRecipeCost(budgetTagRecipe);
    expect(estimate.isBudget).toBe(true);
    expect(estimate.costPerServing).toBeLessThanOrEqual(BUDGET_MAX_PORTION);
  });
});
