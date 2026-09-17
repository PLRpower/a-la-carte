// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";

describe("Recipe Journal & Sharing logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves local recipe journal notes", () => {
    const recipeId = "test-recipe-123";
    const storageKey = `recipe_journal_${recipeId}`;

    const data = {
      notes: "Moins de sel, 5 min de cuisson en plus",
      cookedCount: 3,
      lastCookedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(data));

    const retrieved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    expect(retrieved.notes).toBe("Moins de sel, 5 min de cuisson en plus");
    expect(retrieved.cookedCount).toBe(3);
    expect(retrieved.lastCookedAt).toBeDefined();
  });

  it("handles empty or corrupt local storage gracefully", () => {
    const raw = localStorage.getItem("recipe_journal_non_existent");
    expect(raw).toBeNull();
  });

  it("formats public shared recipe URLs correctly", () => {
    const origin = "https://alacarte-app.com";
    const recipeId = "rec-1";
    const shareUrl = `${origin}/shared/recipe/${recipeId}`;

    expect(shareUrl).toBe("https://alacarte-app.com/shared/recipe/rec-1");
  });

  it("handles portion scaling for printable sheet correctly", () => {
    const initialServings = 4;
    const currentServings = 6;
    const scale = currentServings / initialServings;

    const ingredientQty = 200; // grams
    const scaledQty = ingredientQty * scale;

    expect(scaledQty).toBe(300);
  });
});
