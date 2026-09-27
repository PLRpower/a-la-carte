import { describe, it, expect } from "vitest";
import { parseIngredientInput, findBestIngredientMatch } from "./ingredient-parser";
import { Ingredient } from "@/types/database";

describe("ingredient-parser", () => {
  describe("parseIngredientInput", () => {
    it("parses name with quantity at start", () => {
      const res = parseIngredientInput("2 carottes");
      expect(res.name).toBe("carottes");
      expect(res.quantity).toBe(2);
      expect(res.unit).toBe("piece");
    });

    it("parses name with quantity and unit", () => {
      const res = parseIngredientInput("500g de farine");
      expect(res.name).toBe("farine");
      expect(res.quantity).toBe(500);
      expect(res.unit).toBe("g");
    });

    it("parses single ingredient without quantity", () => {
      const res = parseIngredientInput("Brocolis");
      expect(res.name).toBe("Brocolis");
      expect(res.quantity).toBeNull();
      expect(res.unit).toBeNull();
    });

    it("parses accented units like cuillères à soupe and cuillère à café", () => {
      const res1 = parseIngredientInput("2 cuillères à soupe d'huile");
      expect(res1.name).toBe("huile");
      expect(res1.quantity).toBe(2);
      expect(res1.unit).toBe("cuillere_soupe");

      const res2 = parseIngredientInput("1 cuillère à café de sel");
      expect(res2.name).toBe("sel");
      expect(res2.quantity).toBe(1);
      expect(res2.unit).toBe("cuillere_the");
    });
  });

  describe("findBestIngredientMatch", () => {
    const mockIngredients: Ingredient[] = [
      {
        id: "ing-brocoli",
        name: "brocoli",
        category: "fruits_legumes",
        image_url: "https://example.com/brocolis.jpg",
        synonyms: ["brocolis"],
        created_at: "",
        created_by: null,
      },
      {
        id: "ing-tomate",
        name: "tomate",
        category: "fruits_legumes",
        image_url: "https://example.com/tomate.jpg",
        synonyms: ["tomates"],
        created_at: "",
        created_by: null,
      },
      {
        id: "ing-tomate-cerise",
        name: "tomate cerise",
        category: "fruits_legumes",
        image_url: "https://example.com/tomates-cerises.jpg",
        synonyms: ["tomates cerises"],
        created_at: "",
        created_by: null,
      },
      {
        id: "ing-oeuf",
        name: "oeuf",
        category: "produits_frais",
        image_url: "https://example.com/oeufs.jpg",
        synonyms: ["oeufs"],
        created_at: "",
        created_by: null,
      },
    ];

    it("matches exact name case-insensitively", () => {
      const match = findBestIngredientMatch("Brocoli", mockIngredients);
      expect(match?.id).toBe("ing-brocoli");
    });

    it("matches plural form", () => {
      const match = findBestIngredientMatch("Brocolis", mockIngredients);
      expect(match?.id).toBe("ing-brocoli");
    });

    it("matches ligature and accented forms", () => {
      const match = findBestIngredientMatch("Œufs", mockIngredients);
      expect(match?.id).toBe("ing-oeuf");
    });

    it("prefers specific compound matches over substrings", () => {
      const match = findBestIngredientMatch("Tomates cerises", mockIngredients);
      expect(match?.id).toBe("ing-tomate-cerise");
    });

    it("returns null for unknown ingredient", () => {
      const match = findBestIngredientMatch("Dragonfruit", mockIngredients);
      expect(match).toBeNull();
    });

    it("returns null if ingredients list is empty", () => {
      const match = findBestIngredientMatch("Brocoli", []);
      expect(match).toBeNull();
    });
  });
});
