import { describe, it, expect } from "vitest";
import { findIngredientSubstitution, normalizeIngredientSearch, SUBSTITUTIONS_DATABASE } from "./ingredient-substitutions";

describe("ingredient-substitutions", () => {
  it("normalizes ingredient string correctly", () => {
    expect(normalizeIngredientSearch("Beurre demi-sel")).toBe("beurre demi sel");
    expect(normalizeIngredientSearch("4 Jaunes d'œufs")).toBe("jaunes d oeufs");
    expect(normalizeIngredientSearch("Crème fraîche 30%")).toBe("creme fraiche");
  });

  it("finds substitutions for butter variations", () => {
    const sub1 = findIngredientSubstitution("Beurre demi-sel");
    expect(sub1).not.toBeNull();
    expect(sub1?.canonicalName).toBe("Beurre");
    expect(sub1?.substitutes.length).toBeGreaterThan(0);

    const sub2 = findIngredientSubstitution("100g de beurre doux");
    expect(sub2?.canonicalName).toBe("Beurre");
  });

  it("finds substitutions for eggs", () => {
    const sub = findIngredientSubstitution("4 jaunes d'œufs");
    expect(sub).not.toBeNull();
    expect(sub?.canonicalName).toBe("Œuf");
  });

  it("finds substitutions for cream", () => {
    const sub = findIngredientSubstitution("20cl de crème fraîche épaisse");
    expect(sub).not.toBeNull();
    expect(sub?.canonicalName).toBe("Crème fraîche");
  });

  it("finds substitutions for wine and condiments", () => {
    const wine = findIngredientSubstitution("10cl de vin blanc");
    expect(wine).not.toBeNull();
    expect(wine?.canonicalName).toBe("Vin blanc de cuisine");

    const mustard = findIngredientSubstitution("1 cuillère de moutarde");
    expect(mustard?.canonicalName).toBe("Moutarde de Dijon");
  });

  it("returns null for unknown ingredients", () => {
    expect(findIngredientSubstitution("spiruline obscure")).toBeNull();
    expect(findIngredientSubstitution("")).toBeNull();
  });
});
