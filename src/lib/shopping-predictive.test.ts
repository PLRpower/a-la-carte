// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  generatePredictiveSuggestions,
  recordPurchases,
  getPurchaseHistory,
  calculateItemFrequency,
  ESSENTIAL_STAPLES,
} from "./shopping-predictive";
import { ShoppingListItemWithIngredient, StockWithIngredient } from "@/types/database";

describe("shopping-predictive", () => {
  const now = new Date("2026-09-16T12:00:00Z").getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  beforeEach(() => {
    localStorage.clear();
  });

  describe("recordPurchases & getPurchaseHistory", () => {
    it("saves purchase records to localStorage", () => {
      recordPurchases([{ name: "Lait", category: "produits_laitiers" }], now);
      const history = getPurchaseHistory();
      expect(history).toHaveLength(1);
      expect(history[0].name).toBe("Lait");
      expect(history[0].purchasedAt).toBe(now);
    });
  });

  describe("calculateItemFrequency", () => {
    it("calculates average days between purchases", () => {
      const history = [
        { id: "1", name: "Lait", purchasedAt: now - 14 * ONE_DAY_MS },
        { id: "2", name: "Lait", purchasedAt: now - 7 * ONE_DAY_MS },
        { id: "3", name: "Lait", purchasedAt: now },
      ];

      const stats = calculateItemFrequency("Lait", history, now);
      expect(stats.purchaseCount).toBe(3);
      expect(stats.averageIntervalDays).toBe(7);
      expect(stats.daysSinceLastPurchase).toBe(0);
    });

    it("falls back to default interval for staples if not enough history", () => {
      const stats = calculateItemFrequency("Beurre", [], now);
      expect(stats.averageIntervalDays).toBe(14); // Beurre staple default
      expect(stats.daysSinceLastPurchase).toBeNull();
    });
  });

  describe("generatePredictiveSuggestions", () => {
    it("suggests items that are overdue based on purchase frequency", () => {
      // User bought Cafe 15 days ago, and 30 days ago (average interval 15 days)
      const history = [
        { id: "1", name: "Café", category: "epicerie_sucree", purchasedAt: now - 30 * ONE_DAY_MS },
        { id: "2", name: "Café", category: "epicerie_sucree", purchasedAt: now - 15 * ONE_DAY_MS },
      ];

      const suggestions = generatePredictiveSuggestions({
        shoppingListItems: [],
        stockItems: [],
        history,
        now,
      });

      const cafe = suggestions.find((s) => s.name.toLowerCase() === "café");
      expect(cafe).toBeDefined();
      expect(cafe?.reason).toContain("15");
    });

    it("does not suggest items already present in the shopping list", () => {
      const shoppingListItems = [
        {
          id: "s1",
          name: "Lait",
          checked: false,
        },
      ] as ShoppingListItemWithIngredient[];

      const suggestions = generatePredictiveSuggestions({
        shoppingListItems,
        stockItems: [],
        history: [],
        now,
      });

      const lait = suggestions.find((s) => s.name.toLowerCase() === "lait");
      expect(lait).toBeUndefined();
    });

    it("suggests items flagged as low_stock in current stock", () => {
      const stockItems = [
        {
          id: "stk1",
          ingredient_id: "ing1",
          quantity: 0,
          low_stock: true,
          unit: "piece",
          user_id: "u1",
          created_at: "",
          updated_at: "",
          expiration_date: null,
          ingredient: {
            id: "ing1",
            name: "Beurre doux",
            category: "produits_laitiers",
            image_url: null,
            created_at: "",
          },
        },
      ] as StockWithIngredient[];

      const suggestions = generatePredictiveSuggestions({
        shoppingListItems: [],
        stockItems,
        history: [],
        now,
      });

      const beurre = suggestions.find((s) => s.name.toLowerCase().includes("beurre"));
      expect(beurre).toBeDefined();
      expect(beurre?.reason).toMatch(/stock bas/i);
    });

    it("includes missing staples when neither in stock nor in shopping list", () => {
      const suggestions = generatePredictiveSuggestions({
        shoppingListItems: [],
        stockItems: [],
        history: [],
        now,
      });

      const stapleNames = suggestions.map((s) => s.name.toLowerCase());
      expect(stapleNames).toContain("lait");
      expect(stapleNames).toContain("œufs");
    });
  });
});
