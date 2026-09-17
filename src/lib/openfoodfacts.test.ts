import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mapCategoryFromOFF,
  parseQuantityString,
  fetchProductByBarcode,
} from "./openfoodfacts";

describe("openfoodfacts", () => {
  describe("mapCategoryFromOFF", () => {
    it("maps drinks correctly", () => {
      expect(mapCategoryFromOFF(["en:beverages"], "Jus d'orange")).toBe("boissons");
      expect(mapCategoryFromOFF(undefined, "Café, Thé, Boisson chaude")).toBe("boissons");
    });

    it("maps fruits and vegetables", () => {
      expect(mapCategoryFromOFF(["en:fruits"], "Pommes")).toBe("fruits_legumes");
      expect(mapCategoryFromOFF(["en:vegetables"], "Carottes")).toBe("fruits_legumes");
    });

    it("maps meats and poultry", () => {
      expect(mapCategoryFromOFF(["en:meats"], "Poulet fermier")).toBe("boucherie");
      expect(mapCategoryFromOFF(undefined, "Jambon blanc, Charcuterie")).toBe("boucherie");
    });

    it("maps seafood", () => {
      expect(mapCategoryFromOFF(["en:fishes"], "Saumon fumé")).toBe("poissonnerie");
    });

    it("maps dairy products", () => {
      expect(mapCategoryFromOFF(["en:cheeses"], "Emmental râpé")).toBe("produits_laitiers");
      expect(mapCategoryFromOFF(undefined, "Lait demi-écrémé, Yaourt")).toBe("produits_laitiers");
    });

    it("maps sweets", () => {
      expect(mapCategoryFromOFF(["en:chocolates"], "Pâte à tartiner")).toBe("epicerie_sucree");
    });

    it("defaults to autre when unknown", () => {
      expect(mapCategoryFromOFF([], "")).toBe("autre");
    });
  });

  describe("parseQuantityString", () => {
    it("parses single weights and volumes", () => {
      expect(parseQuantityString("500g")).toEqual({ quantity: 500, unit: "g" });
      expect(parseQuantityString("1.5 kg")).toEqual({ quantity: 1.5, unit: "kg" });
      expect(parseQuantityString("1 L")).toEqual({ quantity: 1, unit: "l" });
      expect(parseQuantityString("33 cl")).toEqual({ quantity: 330, unit: "ml" });
      expect(parseQuantityString("250 ml")).toEqual({ quantity: 250, unit: "ml" });
    });

    it("parses multi-packs", () => {
      expect(parseQuantityString("6 x 25cl")).toEqual({ quantity: 1500, unit: "ml" });
      expect(parseQuantityString("4 x 100g")).toEqual({ quantity: 400, unit: "g" });
    });

    it("defaults to 1 piece when missing or unparseable", () => {
      expect(parseQuantityString(undefined)).toEqual({ quantity: 1, unit: "piece" });
      expect(parseQuantityString("")).toEqual({ quantity: 1, unit: "piece" });
    });
  });

  describe("fetchProductByBarcode", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("fetches product from OpenFoodFacts and structures data", async () => {
      const mockResponse = {
        status: 1,
        product: {
          product_name_fr: "Pâte à tartiner",
          brands: "Nutella, Ferrero",
          categories_tags: ["en:breakfasts", "en:sweet-spreads"],
          nutriscore_grade: "e",
          allergens_tags: ["en:milk", "en:nuts", "en:soybeans"],
          quantity: "400 g",
          image_front_url: "https://example.com/nutella.jpg",
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const res = await fetchProductByBarcode("3017620422003");

      expect(res.name).toBe("Pâte à tartiner");
      expect(res.brand).toBe("Nutella");
      expect(res.category).toBe("epicerie_sucree");
      expect(res.nutriscore).toBe("e");
      expect(res.allergens).toEqual(["Lait", "Fruits à coque", "Soja"]);
      expect(res.quantity).toBe(400);
      expect(res.unit).toBe("g");
      expect(res.imageUrl).toBe("https://example.com/nutella.jpg");
    });

    it("throws when product is not found", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 0 }),
      } as unknown as Response);

      await expect(fetchProductByBarcode("0000000000000")).rejects.toThrow(
        "Produit non trouvé sur Open Food Facts"
      );
    });
  });
});
