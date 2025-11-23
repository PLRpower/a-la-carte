import { ShoppingListItemWithIngredient } from "@/types/database";

export const groupItemsByCategory = (items: ShoppingListItemWithIngredient[]) => {
    return items.reduce((acc, item) => {
        const category = item.ingredient?.category || "other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, ShoppingListItemWithIngredient[]>);
};

export const sortCategories = (categories: string[]) => {
    return categories.sort((catA, catB) => {
        // Define order: specific categories first, then 'other'
        if (catA === 'other') return 1;
        if (catB === 'other') return -1;
        return catA.localeCompare(catB);
    });
};

export const getCategoryLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
        vegetables: "Fruits et Légumes",
        fruits: "Fruits et Légumes",
        dairy: "Produits Laitiers",
        meat: "Viandes et Poissons",
        fish: "Viandes et Poissons",
        grains: "Céréales et Pains",
        oils: "Huiles et Condiments",
        spices: "Épices",
        beverages: "Boissons",
        other: "Autres",
    };

    return categoryLabels[category.toLowerCase()] ||
        (category === 'other' ? "Autres" : category);
};
