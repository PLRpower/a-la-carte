import { describe, it, expect } from "vitest";
import { parseRecipeSteps } from "./recipe-step-parser";

describe("recipe-step-parser", () => {
  it("parses numbered steps with dots", () => {
    const text = `1. Cuisez les spaghetti al dente dans de l'eau bouillante salée.
2. Faites dorer la pancetta ou guanciale en dés dans une poêle sans matière grasse.
3. Dans un bol, fouettez les jaunes d'œufs avec le pecorino.`;

    const steps = parseRecipeSteps(text);
    expect(steps.length).toBe(3);
    expect(steps[0].stepNumber).toBe(1);
    expect(steps[0].text).toBe("Cuisez les spaghetti al dente dans de l'eau bouillante salée.");
    expect(steps[1].stepNumber).toBe(2);
    expect(steps[2].stepNumber).toBe(3);
  });

  it("parses steps with Étape prefix", () => {
    const text = `Étape 1 : Préchauffer le four à 180°C.
Étape 2 : Mélanger la farine et les œufs.`;

    const steps = parseRecipeSteps(text);
    expect(steps.length).toBe(2);
    expect(steps[0].text).toBe("Préchauffer le four à 180°C.");
    expect(steps[1].text).toBe("Mélanger la farine et les œufs.");
  });

  it("parses bullet points", () => {
    const text = `- Éplucher les carottes
- Les couper en rondelles
- Faire cuire à la vapeur`;

    const steps = parseRecipeSteps(text);
    expect(steps.length).toBe(3);
    expect(steps[0].text).toBe("Éplucher les carottes");
  });

  it("parses paragraphs when not numbered", () => {
    const text = `Préchauffer le four à 200°C.

Dans un grand récipient, mélanger tous les ingrédients jusqu'à homogénéité.

Verser dans le moule beurré et enfourner 30 minutes.`;

    const steps = parseRecipeSteps(text);
    expect(steps.length).toBe(3);
  });

  it("handles empty or single string", () => {
    expect(parseRecipeSteps("").length).toBe(1);
    expect(parseRecipeSteps("Tout mélanger et servir.").length).toBe(1);
  });
});
