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

const EXCEPTIONS = [
    'radis', 'maïs', 'jus', 'ananas', 'pois', 'frais', 'cours', 'corps',
    'temps', 'bras', 'bas', 'gras', 'gros', 'souris', 'brebis', 'fils',
    'os', 'ours', 'sens', 'succès', 'tapis', 'velours', 'kiwi', 'anchois',
    'cassis', 'noix'
];

const singularize = (text: string): string => {
    const words = text.trim().split(/\s+/);
    const singularWords = words.map(word => {
        const lower = word.toLowerCase();
        if (EXCEPTIONS.includes(lower)) return lower;

        if (lower.endsWith('s') && !lower.endsWith('ss')) return lower.slice(0, -1);
        if (lower.endsWith('x')) return lower.slice(0, -1);
        return lower;
    });
    return singularWords.join(' ');
};

export const parseIngredientInput = (input: string): ParsedIngredient => {
    const trimmedInput = input.trim();

    // Regex to match quantity at the start (e.g., "2", "2.5", "2,5")
    const quantityMatch = trimmedInput.match(/^(\d+(?:[.,]\d+)?)\s*/);

    let quantity: number | null = null;
    let remainingInput = trimmedInput;

    if (quantityMatch) {
        const quantityStr = quantityMatch[1].replace(',', '.');
        quantity = parseFloat(quantityStr);
        remainingInput = trimmedInput.slice(quantityMatch[0].length);
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

    // Singularize and clean the name
    const name = singularize(remainingInput);

    return {
        name,
        quantity,
        unit
    };
};
