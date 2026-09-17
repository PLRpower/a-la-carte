/**
 * Recipe Step Parser
 * Parses recipe instruction text into structured, clean steps.
 */

export interface ParsedRecipeStep {
  stepNumber: number;
  text: string;
}

/**
 * Parses instructions string into clean, ordered steps.
 */
export function parseRecipeSteps(instructions: string | null | undefined): ParsedRecipeStep[] {
  if (!instructions || !instructions.trim()) {
    return [{ stepNumber: 1, text: "Suivre la préparation de la recette." }];
  }

  const raw = instructions.trim();

  // 1. Check if text has explicit numbered steps like "1.", "1)", "Étape 1"
  // Look for patterns starting lines: e.g. /(?:^|\n)\s*(?:(?:\d+[\.\)]\s*)|(?:étape\s*\d+\s*[:\-]?\s*))/i
  const numberedLinesRegex = /(?:^|\n)\s*(?:(?:\d+[\.\)]\s*)|(?:étape\s*\d+\s*[:\-]?\s*))/i;

  if (numberedLinesRegex.test(raw)) {
    // Split by lines or step headings
    const lines = raw.split(/\r?\n+/);
    const steps: string[] = [];
    let currentStepText = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const isNewStep = /^(?:(?:\d+[\.\)]\s*)|(?:étape\s*\d+\s*[:\-]?\s*))/i.test(trimmed);

      if (isNewStep) {
        if (currentStepText) {
          steps.push(currentStepText.trim());
        }
        // Remove leading step indicator: "1. ", "1) ", "Étape 1 : "
        currentStepText = trimmed.replace(/^(?:(?:\d+[\.\)]\s*)|(?:étape\s*\d+\s*[:\-]?\s*))/i, "");
      } else {
        if (currentStepText) {
          currentStepText += " " + trimmed;
        } else {
          currentStepText = trimmed;
        }
      }
    }

    if (currentStepText) {
      steps.push(currentStepText.trim());
    }

    if (steps.length > 0) {
      return steps.map((text, idx) => ({ stepNumber: idx + 1, text }));
    }
  }

  // 2. Check for bullet points (- or •)
  if (/(?:^|\n)\s*[\-•*]\s+/i.test(raw)) {
    const items = raw
      .split(/(?:^|\n)\s*[\-•*]\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (items.length > 1) {
      return items.map((text, idx) => ({ stepNumber: idx + 1, text }));
    }
  }

  // 3. Check for double line breaks (paragraphs)
  const paragraphs = raw
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.map((text, idx) => ({
      stepNumber: idx + 1,
      text: text.replace(/^\d+[\.\)]\s*/, "").trim(),
    }));
  }

  // 4. Check for single line breaks if multiple lines exist
  const singleLines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (singleLines.length > 1) {
    return singleLines.map((text, idx) => ({
      stepNumber: idx + 1,
      text: text.replace(/^\d+[\.\)]\s*/, "").trim(),
    }));
  }

  // 5. Fallback: single instruction block
  return [{ stepNumber: 1, text: raw }];
}
