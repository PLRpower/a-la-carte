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
    'cup': 'cup',
    'tasse': 'cup',
    'tasses': 'cup',
    'tbsp': 'tbsp',
    'cs': 'tbsp',
    'c.s': 'tbsp',
    'cuillère à soupe': 'tbsp',
    'cuillères à soupe': 'tbsp',
    'tsp': 'tsp',
    'cc': 'tsp',
    'c.c': 'tsp',
    'cuillère à café': 'tsp',
    'cuillères à café': 'tsp',
    'oz': 'oz',
    'lb': 'lb',
    'piece': 'piece',
    'pièce': 'piece',
    'pièces': 'piece',
    'pc': 'piece',
    'pcs': 'piece',
};

export const parseIngredientInput = (input: string): ParsedIngredient => {
    const trimmedInput = input.trim();

    // Regex to match quantity at the start (e.g., "2", "2.5", "2,5", "1/2", "1 1/2")
    // Groups:
    // 1: Mixed number whole part (optional) + Fraction (e.g. "1 1/2") OR Fraction (e.g. "1/2")
    // 2: Decimal/Integer (e.g. "1.5", "1")
    const quantityMatch = trimmedInput.match(/^(\d+\s+\d+\/\d+|\d+\/\d+)|(\d+(?:[.,]\d+)?)\s*/);

    let quantity: number | null = null;
    let remainingInput = trimmedInput;

    if (quantityMatch) {
        // If match group 1 (fractional) is present
        if (quantityMatch[1]) {
            const fractionParts = quantityMatch[1].split(/\s+/);
            if (fractionParts.length === 2) {
                // Mixed fraction: "1 1/2"
                const [whole, frac] = fractionParts;
                const [num, den] = frac.split('/');
                quantity = parseInt(whole) + parseInt(num) / parseInt(den);
            } else {
                // Simple fraction: "1/2"
                const [num, den] = quantityMatch[1].split('/');
                quantity = parseInt(num) / parseInt(den);
            }
            remainingInput = trimmedInput.slice(quantityMatch[1].length);
        }
        // If match group 2 (decimal/integer) is present
        else if (quantityMatch[2]) {
            const quantityStr = quantityMatch[2].replace(',', '.');
            quantity = parseFloat(quantityStr);
            remainingInput = trimmedInput.slice(quantityMatch[0].length);
        }
    }

    // Check for unit
    // Sort units by length descending to match longest first (e.g. "cuillère à soupe" before "cuillère")
    const sortedUnits = Object.keys(UNIT_MAPPINGS).sort((a, b) => b.length - a.length);
    // Allow unit to be followed by space, OR end of string, OR "de"/"d'"
    const unitRegex = new RegExp(`^(${sortedUnits.join('|')})(?:\\s+|$|(?=\\s*de\\s+)|(?=\\s*d'))`, 'i');
    const unitMatch = remainingInput.match(unitRegex);

    let unit: MeasurementUnit | null = null;

    if (unitMatch) {
        const matchedUnit = unitMatch[1].toLowerCase();
        unit = UNIT_MAPPINGS[matchedUnit] || null;
        remainingInput = remainingInput.slice(unitMatch[0].length);
    } else if (quantity !== null && !unit) {
        // If no unit found but there is a quantity, default to 'piece'
        unit = 'piece';
    }

    // Remove "de" or "d'" separator
    remainingInput = remainingInput.replace(/^(?:\s+)?(?:de\s+|d')/i, '');

    // Clean the name
    const name = remainingInput.trim();

    return {
        name,
        quantity,
        unit
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
