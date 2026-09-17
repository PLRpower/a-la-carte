import { ShoppingListItemWithIngredient } from "@/types/database";

export const DEFAULT_AISLE_ORDER: string[] = [
    'fruits_legumes',
    'boucherie',
    'poissonnerie',
    'produits_frais',
    'produits_laitiers',
    'epicerie_salee',
    'epicerie_sucree',
    'boissons',
    'produits_surgeles',
    'autre',
];

const AISLE_ORDER_STORAGE_KEY = 'alc_supermarket_aisle_order';

export const normalizeCategory = (category: string): string => {
    const legacyMap: Record<string, string> = {
        vegetables: 'fruits_legumes',
        fruits: 'fruits_legumes',
        dairy: 'produits_laitiers',
        meat: 'boucherie',
        fish: 'poissonnerie',
        grains: 'epicerie_salee',
        oils: 'epicerie_salee',
        spices: 'epicerie_salee',
        beverages: 'boissons',
    };
    const lower = category?.toLowerCase?.() || 'autre';
    return legacyMap[lower] || lower;
};

export const getAisleOrder = (): string[] => {
    if (typeof window === 'undefined') return [...DEFAULT_AISLE_ORDER];

    try {
        const saved = localStorage.getItem(AISLE_ORDER_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Keep parsed ordering and append any missing default categories
                const result = [...parsed];
                for (const cat of DEFAULT_AISLE_ORDER) {
                    if (!result.includes(cat)) {
                        result.push(cat);
                    }
                }
                return result;
            }
        }
    } catch (e) {
        console.error('Failed to read aisle order from storage', e);
    }
    return [...DEFAULT_AISLE_ORDER];
};

export const saveAisleOrder = (order: string[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(AISLE_ORDER_STORAGE_KEY, JSON.stringify(order));
    } catch (e) {
        console.error('Failed to save aisle order to storage', e);
    }
};

export const resetAisleOrder = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(AISLE_ORDER_STORAGE_KEY);
    } catch (e) {
        console.error('Failed to reset aisle order', e);
    }
};

export const groupItemsByCategory = (items: ShoppingListItemWithIngredient[]) => {
    return items.reduce((acc, item) => {
        const rawCategory = item.ingredient?.category || "autre";
        const category = normalizeCategory(rawCategory);
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, ShoppingListItemWithIngredient[]>);
};

export const sortCategories = (categories: string[], aisleOrder: string[] = getAisleOrder()) => {
    return [...categories].sort((catA, catB) => {
        const normA = normalizeCategory(catA);
        const normB = normalizeCategory(catB);

        const indexA = aisleOrder.indexOf(normA);
        const indexB = aisleOrder.indexOf(normB);

        const rankA = indexA === -1 ? (normA === 'autre' ? 999 : 500) : indexA;
        const rankB = indexB === -1 ? (normB === 'autre' ? 999 : 500) : indexB;

        if (rankA !== rankB) {
            return rankA - rankB;
        }
        return catA.localeCompare(catB);
    });
};

export const getCategoryIcon = (category: string): string => {
    const norm = normalizeCategory(category);
    const icons: Record<string, string> = {
        fruits_legumes: "🥦",
        boucherie: "🥩",
        poissonnerie: "🐟",
        produits_frais: "🥪",
        produits_laitiers: "🧀",
        epicerie_salee: "🥫",
        epicerie_sucree: "🍪",
        boissons: "🧃",
        produits_surgeles: "❄️",
        autre: "🛒",
    };
    return icons[norm] || "🛒";
};

export const getCategoryLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
        fruits_legumes: "Fruits & Légumes",
        boucherie: "Boucherie",
        poissonnerie: "Poissonnerie",
        produits_laitiers: "Produits laitiers",
        epicerie_sucree: "Épicerie sucrée",
        epicerie_salee: "Épicerie salée",
        produits_frais: "Produits frais",
        produits_surgeles: "Produits surgelés",
        boissons: "Boissons",
        autre: "Autres",
        // Keep old mappings for backward compatibility
        vegetables: "Fruits & Légumes",
        fruits: "Fruits & Légumes",
        dairy: "Produits laitiers",
        meat: "Boucherie",
        fish: "Poissonnerie",
        grains: "Épicerie salée",
        oils: "Épicerie salée",
        spices: "Épicerie salée",
        beverages: "Boissons",
    };

    return categoryLabels[category.toLowerCase()] ||
        (category === 'autre' ? "Autres" : category);
};
