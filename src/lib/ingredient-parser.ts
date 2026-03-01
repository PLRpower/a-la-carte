import { MeasurementUnit } from "@/types/database";

interface ParsedIngredient {
    name: string;
    quantity: number | null;
    unit: MeasurementUnit | null;
}

const UNIT_MAPPINGS: Record<string, MeasurementUnit> = {
    'g': 'g',
    'gramme': 'g',
    'grammes': 'g',
    'kg': 'kg',
    'kilo': 'kg',
    'kilos': 'kg',
    'ml': 'ml',
    'l': 'l',
    'litre': 'l',
    'litres': 'l',
    'cup': 'piece',
    'tasse': 'piece',
    'tasses': 'piece',
    'tbsp': 'cuillere_soupe',
    'cs': 'cuillere_soupe',
    'c.s': 'cuillere_soupe',
    'cuillère à soupe': 'cuillere_soupe',
    'cuillères à soupe': 'cuillere_soupe',
    'tsp': 'cuillere_the',
    'cc': 'cuillere_the',
    'c.c': 'cuillere_the',
    'cuillère à café': 'cuillere_the',
    'cuillères à café': 'cuillere_the',
    'oz': 'g',
    'lb': 'g',
    'piece': 'piece',
    'pièce': 'piece',
    'pièces': 'piece',
    'pc': 'piece',
    'pcs': 'piece',
};

const parseQuantityAndUnit = (fractionPart: string | undefined, decimalPart: string | undefined, unitPart: string | undefined) => {
    let quantity: number | null = null;
    if (fractionPart) {
        const fractionParts = fractionPart.split(/\s+/);
        if (fractionParts.length === 2) {
            const [whole, frac] = fractionParts;
            const [num, den] = frac.split('/');
            quantity = parseInt(whole) + parseInt(num) / parseInt(den);
        } else {
            const [num, den] = fractionPart.split('/');
            quantity = parseInt(num) / parseInt(den);
        }
    } else if (decimalPart) {
        quantity = parseFloat(decimalPart.replace(',', '.'));
    }

    let unit: MeasurementUnit | null = null;
    if (unitPart) {
        unit = UNIT_MAPPINGS[unitPart.toLowerCase()] || null;
    } else if (quantity !== null) {
        unit = 'piece';
    }
    return { quantity, unit };
};

export const parseIngredientInput = (input: string): ParsedIngredient => {
    const trimmedInput = input.trim();

    // 1. Try to match quantity at the start
    // Regex to match quantity at the start (e.g., "2", "2.5", "2,5", "1/2", "1 1/2")
    // Added anchors ^ to both alternatives and \s* to both to consume trailing spaces
    const startQuantityMatch = trimmedInput.match(/^(\d+\s+\d+\/\d+|\d+\/\d+)\s*|^(\d+(?:[.,]\d+)?)\s*/);

    // Prepare sorted units for matching
    const sortedUnits = Object.keys(UNIT_MAPPINGS).sort((a, b) => b.length - a.length);
    const unitPattern = sortedUnits.join('|');

    if (startQuantityMatch) {
        let quantity: number | null = null;
        let remainingInput = trimmedInput;

        // If match group 1 (fractional) is present
        if (startQuantityMatch[1]) {
            const fractionParts = startQuantityMatch[1].split(/\s+/);
            if (fractionParts.length === 2) {
                // Mixed fraction: "1 1/2"
                const [whole, frac] = fractionParts;
                const [num, den] = frac.split('/');
                quantity = parseInt(whole) + parseInt(num) / parseInt(den);
            } else {
                // Simple fraction: "1/2"
                const [num, den] = startQuantityMatch[1].split('/');
                quantity = parseInt(num) / parseInt(den);
            }
            // Use match[0] to consume spaces matched by \s*
            remainingInput = trimmedInput.slice(startQuantityMatch[0].length);
        }
        // If match group 2 (decimal/integer) is present
        else if (startQuantityMatch[2]) {
            const quantityStr = startQuantityMatch[2].replace(',', '.');
            quantity = parseFloat(quantityStr);
            remainingInput = trimmedInput.slice(startQuantityMatch[0].length);
        }

        // Check for unit at the start of remaining input
        const unitRegex = new RegExp(`^(${unitPattern})(?:\\s+|$|(?=\\s*de\\s+)|(?=\\s*d'))`, 'i');
        const unitMatch = remainingInput.match(unitRegex);

        let unit: MeasurementUnit | null = null;

        if (unitMatch) {
            const matchedUnit = unitMatch[1].toLowerCase();
            unit = UNIT_MAPPINGS[matchedUnit] || null;
            remainingInput = remainingInput.slice(unitMatch[0].length);
        } else if (quantity !== null) {
            unit = 'piece';
        }

        // Remove "de" or "d'" separator
        remainingInput = remainingInput.replace(/^(?:\s+)?(?:de\s+|d')/i, '');

        return {
            name: remainingInput.trim(),
            quantity,
            unit
        };
    }

    // 2. Check for parenthesized quantity at the end: "Tomates (500g)" or "Items (2)"
    // Pattern: Optional Space + ( + (Fraction or Decimal) + Optional Space + Optional Unit + ) + Optional Space + End
    const parenEndRegex = new RegExp(`\\s*\\(\\s*((\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+)|(\\d+(?:[.,]\\d+)?))\\s*(${unitPattern})?\\s*\\)\\s*$`, 'i');
    const parenEndMatch = trimmedInput.match(parenEndRegex);

    if (parenEndMatch) {
        const fractionPart = parenEndMatch[2];
        const decimalPart = parenEndMatch[3];
        const unitPart = parenEndMatch[4];

        const { quantity, unit } = parseQuantityAndUnit(fractionPart, decimalPart, unitPart);

        const name = trimmedInput.slice(0, parenEndMatch.index).trim();
        return { name, quantity, unit };
    }

    // 3. If no quantity at start/paren-end, try to match at the end (no parens)
    // Pattern: Space + (Fraction or Decimal) + Optional Space + Optional Unit + End
    // e.g. "tomates 500g" or "tomates 1/2 cup"
    const endRegex = new RegExp(`\\s+((\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+)|(\\d+(?:[.,]\\d+)?))\\s*(${unitPattern})?$`, 'i');
    const endMatch = trimmedInput.match(endRegex);

    if (endMatch) {
        const fractionPart = endMatch[2]; // If fraction
        const decimalPart = endMatch[3]; // If decimal
        const unitPart = endMatch[4]; // The unit part

        const { quantity, unit } = parseQuantityAndUnit(fractionPart, decimalPart, unitPart);

        // Name is everything before the match
        const name = trimmedInput.slice(0, endMatch.index).trim();

        return {
            name,
            quantity,
            unit
        };
    }

    // Default: No quantity found
    return {
        name: trimmedInput,
        quantity: null,
        unit: null
    };
};

import { Ingredient } from "@/types/database";

export const findBestIngredientMatch = (inputName: string, allIngredients: Ingredient[]): Ingredient | null => {
    const lowerInput = inputName.toLowerCase();
    let bestMatch: Ingredient | null = null;
    let maxLen = -1;

    for (const ing of allIngredients) {
        // Check name
        if (lowerInput.includes(ing.name.toLowerCase())) {
            if (ing.name.length > maxLen) {
                maxLen = ing.name.length;
                bestMatch = ing;
            }
        }
        // Check synonyms
        if (ing.synonyms) {
            for (const syn of ing.synonyms) {
                if (lowerInput.includes(syn.toLowerCase())) {
                    if (syn.length > maxLen) {
                        maxLen = syn.length;
                        bestMatch = ing;
                    }
                }
            }
        }
    }

    return bestMatch;
};
