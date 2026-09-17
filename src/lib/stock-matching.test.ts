import { describe, it, expect } from "vitest";
import {
  normalizeText,
  convertQuantity,
  isIngredientMatch,
  analyzeRecipeStock,
  calculateRecipeDestocking,
} from "./stock-matching";
import { StockWithIngredient } from "@/types/database";

describe("stock-matching", () => {
  describe("normalizeText", () => {
    it("handles accents, ligatures, and punctuation", () => {
      expect(normalizeText("Œufs")).toBe("oeufs");
      expect(normalizeText("Crème fraîche d'Isigny")).toBe("creme fraiche d isigny");
      expect(normalizeText("Pâtes (penne)")).toBe("pates penne");
    });
  });

  describe("convertQuantity", () => {
    it("converts mass units correctly", () => {
      expect(convertQuantity(1, "kg", "g")).toBe(1000);
      expect(convertQuantity(500, "g", "kg")).toBe(0.5);
      expect(convertQuantity(250, "g", "g")).toBe(250);
    });

    it("converts volume units correctly", () => {
      expect(convertQuantity(1, "l", "ml")).toBe(1000);
      expect(convertQuantity(250, "ml", "l")).toBe(0.25);
      expect(convertQuantity(2, "cuillere_soupe", "ml")).toBe(30);
      expect(convertQuantity(3, "cuillere_the", "ml")).toBe(15);
    });

    it("returns null for incompatible units", () => {
      expect(convertQuantity(500, "g", "ml")).toBeNull();
      expect(convertQuantity(2, "piece", "kg")).toBeNull();
    });
  });

  describe("isIngredientMatch", () => {
    const mockStockItem = (id: string, name: string, synonyms: string[] = []): StockWithIngredient => ({
      id: `stock-${id}`,
      user_id: "user-1",
      ingredient_id: id,
      quantity: 500,
      unit: "g",
      expiration_date: null,
      low_stock: false,
      created_at: "",
      updated_at: "",
      ingredient: {
        id,
        name,
        category: "autre",
        image_url: null,
        synonyms,
        created_at: "",
      },
    });

    it("matches by ingredient_id", () => {
      const stock = mockStockItem("ing-1", "Carottes");
      expect(isIngredientMatch({ name: "Carottes râpées", ingredient_id: "ing-1", quantity: 100, unit: "g" }, stock)).toBe(true);
    });

    it("matches singular and plural", () => {
      const stock = mockStockItem("ing-2", "Tomate");
      expect(isIngredientMatch({ name: "Tomates", quantity: 2, unit: "piece" }, stock)).toBe(true);
    });

    it("matches synonyms", () => {
      const stock = mockStockItem("ing-3", "Oeufs", ["oeuf", "jaune d'oeuf"]);
      expect(isIngredientMatch({ name: "Jaunes d'œufs", quantity: 4, unit: "piece" }, stock)).toBe(true);
    });

    it("matches alternatives like 'ou'", () => {
      const stock = mockStockItem("ing-4", "Parmesan");
      expect(isIngredientMatch({ name: "Pecorino ou Parmesan", quantity: 50, unit: "g" }, stock)).toBe(true);
    });

    it("matches compound ingredient phrases without false positives", () => {
      const stockAil = mockStockItem("ing-5", "Ail");
      expect(isIngredientMatch({ name: "Gousses d'ail", quantity: 2, unit: "piece" }, stockAil)).toBe(true);

      const stockSel = mockStockItem("ing-6", "Sel");
      expect(isIngredientMatch({ name: "Saumon frais", quantity: 200, unit: "g" }, stockSel)).toBe(false);
    });
  });

  describe("analyzeRecipeStock", () => {
    const mockStock: StockWithIngredient[] = [
      {
        id: "s1",
        user_id: "u1",
        ingredient_id: "pates-id",
        quantity: 500,
        unit: "g",
        expiration_date: null,
        low_stock: false,
        created_at: "",
        updated_at: "",
        ingredient: { id: "pates-id", name: "Spaghetti", category: "epicerie_salee", image_url: null, created_at: "" },
      },
      {
        id: "s2",
        user_id: "u1",
        ingredient_id: "oeufs-id",
        quantity: 6,
        unit: "piece",
        expiration_date: null,
        low_stock: false,
        created_at: "",
        updated_at: "",
        ingredient: { id: "oeufs-id", name: "Oeufs", synonyms: ["oeuf", "jaune d'oeuf"], category: "produits_frais", image_url: null, created_at: "" },
      },
      {
        id: "s3",
        user_id: "u1",
        ingredient_id: "parmesan-id",
        quantity: 30,
        unit: "g",
        expiration_date: null,
        low_stock: false,
        created_at: "",
        updated_at: "",
        ingredient: { id: "parmesan-id", name: "Parmesan", category: "produits_laitiers", image_url: null, created_at: "" },
      },
    ];

    it("identifies available and missing ingredients", () => {
      const recipeIngredients = [
        { name: "Spaghetti", quantity: 400, unit: "g" as const }, // Stock has 500g -> available
        { name: "Jaunes d'œufs", quantity: 4, unit: "piece" as const }, // Stock has 6 -> available
        { name: "Parmesan", quantity: 50, unit: "g" as const }, // Stock has 30g -> missing 20g
        { name: "Pancetta", quantity: 150, unit: "g" as const }, // Stock has 0 -> missing 150g
      ];

      const analysis = analyzeRecipeStock(recipeIngredients, mockStock, 1);

      expect(analysis.totalCount).toBe(4);
      expect(analysis.availableCount).toBe(2);
      expect(analysis.missingCount).toBe(2);
      expect(analysis.matchPercentage).toBe(50);
      expect(analysis.isCookable).toBe(false);

      const parmesanStatus = analysis.statuses.find((s) => s.name === "Parmesan");
      expect(parmesanStatus?.isAvailable).toBe(false);
      expect(parmesanStatus?.missingQuantity).toBe(20);

      const pancettaStatus = analysis.statuses.find((s) => s.name === "Pancetta");
      expect(pancettaStatus?.isAvailable).toBe(false);
      expect(pancettaStatus?.missingQuantity).toBe(150);
    });

    it("marks 100% available recipe as isCookable", () => {
      const recipeIngredients = [
        { name: "Spaghetti", quantity: 400, unit: "g" as const },
        { name: "Oeufs", quantity: 2, unit: "piece" as const },
      ];

      const analysis = analyzeRecipeStock(recipeIngredients, mockStock, 1);
      expect(analysis.isCookable).toBe(true);
      expect(analysis.matchPercentage).toBe(100);
      expect(analysis.missingCount).toBe(0);
    });

    it("scales correctly according to servings", () => {
      const recipeIngredients = [
        { name: "Spaghetti", quantity: 400, unit: "g" as const }, // Stock has 500g. At scale 2, needs 800g -> missing 300g
      ];

      const analysis = analyzeRecipeStock(recipeIngredients, mockStock, 2);
      expect(analysis.isCookable).toBe(false);
      expect(analysis.statuses[0].missingQuantity).toBe(300);
    });
  });

  describe("calculateRecipeDestocking", () => {
    const mockStock: StockWithIngredient[] = [
      {
        id: "s1",
        user_id: "u1",
        ingredient_id: "spaghetti-id",
        quantity: 400,
        unit: "g",
        expiration_date: null,
        low_stock: false,
        created_at: "",
        updated_at: "",
        ingredient: { id: "spaghetti-id", name: "Spaghetti", category: "epicerie_salee", image_url: null, created_at: "" },
      },
    ];

    it("calculates deduction and flags depletion", () => {
      const recipeIngredients = [{ name: "Spaghetti", quantity: 400, unit: "g" as const }];

      const result = calculateRecipeDestocking(recipeIngredients, mockStock, 1);
      expect(result.deductions.length).toBe(1);
      expect(result.deductions[0].newQuantity).toBe(0);
      expect(result.deductions[0].isDepleted).toBe(true);
      expect(result.depletedOrLowStockItems.length).toBe(1);
    });
  });
});
