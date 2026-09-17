// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  sortCategories,
  DEFAULT_AISLE_ORDER,
  getCategoryLabel,
  groupItemsByCategory,
  getAisleOrder,
  saveAisleOrder,
  resetAisleOrder,
} from "./shopping-list-utils";
import { ShoppingListItemWithIngredient } from "@/types/database";

describe("shopping-list-utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("sortCategories", () => {
    it("sorts categories according to default supermarket aisle order", () => {
      const categories = ["boissons", "fruits_legumes", "produits_surgeles", "boucherie"];
      const sorted = sortCategories(categories);

      expect(sorted).toEqual([
        "fruits_legumes",
        "boucherie",
        "boissons",
        "produits_surgeles",
      ]);
    });

    it("puts 'autre' at the very end by default", () => {
      const categories = ["autre", "fruits_legumes", "epicerie_sucree"];
      const sorted = sortCategories(categories);

      expect(sorted).toEqual(["fruits_legumes", "epicerie_sucree", "autre"]);
    });

    it("sorts according to a customized aisle order", () => {
      // Custom route: Surgelés first, then Légumes
      const customOrder = ["produits_surgeles", "epicerie_salee", "fruits_legumes", "autre"];
      const categories = ["fruits_legumes", "produits_surgeles", "epicerie_salee"];
      const sorted = sortCategories(categories, customOrder);

      expect(sorted).toEqual(["produits_surgeles", "epicerie_salee", "fruits_legumes"]);
    });
  });

  describe("getAisleOrder and saveAisleOrder", () => {
    it("returns default aisle order if none saved", () => {
      expect(getAisleOrder()).toEqual(DEFAULT_AISLE_ORDER);
    });

    it("saves and retrieves custom order", () => {
      const custom = ["boucherie", "fruits_legumes", "boissons"];
      saveAisleOrder(custom);

      const retrieved = getAisleOrder();
      expect(retrieved.slice(0, 3)).toEqual(custom);
      // Ensure missing default categories were preserved
      expect(retrieved).toContain("produits_surgeles");
    });

    it("resets aisle order to default", () => {
      saveAisleOrder(["boissons", "autre"]);
      resetAisleOrder();
      expect(getAisleOrder()).toEqual(DEFAULT_AISLE_ORDER);
    });
  });

  describe("groupItemsByCategory", () => {
    it("groups items by ingredient category or fallback to 'autre'", () => {
      const mockItems = [
        {
          id: "1",
          user_id: "u1",
          name: "Pommes",
          checked: false,
          created_at: "",
          updated_at: "",
          quantity: 4,
          unit: "piece",
          ingredient_id: "i1",
          ingredient: { id: "i1", name: "Pommes", category: "fruits_legumes" as const, image_url: null, created_at: "" },
        },
        {
          id: "2",
          user_id: "u1",
          name: "Savon",
          checked: false,
          created_at: "",
          updated_at: "",
          quantity: 1,
          unit: "piece",
          ingredient_id: null,
        },
      ] as ShoppingListItemWithIngredient[];

      const grouped = groupItemsByCategory(mockItems);
      expect(grouped.fruits_legumes).toHaveLength(1);
      expect(grouped.autre).toHaveLength(1);
    });
  });

  describe("getCategoryLabel", () => {
    it("returns friendly French labels", () => {
      expect(getCategoryLabel("fruits_legumes")).toBe("Fruits & Légumes");
      expect(getCategoryLabel("boucherie")).toBe("Boucherie");
      expect(getCategoryLabel("produits_surgeles")).toBe("Produits surgelés");
      expect(getCategoryLabel("unknown_cat")).toBe("unknown_cat");
    });
  });
});
