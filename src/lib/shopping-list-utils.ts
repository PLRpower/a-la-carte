import { ShoppingListItemWithIngredient } from "@/types/database";

export const groupItemsByCategory = (items: ShoppingListItemWithIngredient[]) => {
    return items.reduce((acc, item) => {
        const category = item.ingredient?.category || "autre";
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, ShoppingListItemWithIngredient[]>);
};

export const sortCategories = (categories: string[]) => {
    return categories.sort((catA, catB) => {
        // Define order: specific categories first, then 'autre'
        if (catA === 'autre') return 1;
        if (catB === 'autre') return -1;
        return catA.localeCompare(catB);
    });
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
        // Keep old mappings for backward compatibility if needed, or remove if DB is fully migrated
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
