import { ShoppingListItemWithIngredient } from "@/types/database";
import { ShoppingListItem } from "./ShoppingListItem";
import { getCategoryLabel } from "@/lib/shopping-list-utils";

interface ShoppingListCategoryProps {
    category: string;
    items: ShoppingListItemWithIngredient[];
    onToggle: (id: string, checked: boolean) => void;
    onDelete: (id: string) => void;
}

export const ShoppingListCategory = ({ category, items, onToggle, onDelete }: ShoppingListCategoryProps) => {
    const label = getCategoryLabel(category);

    return (
        <div>
            <h3 className="font-semibold text-lg mb-3 capitalize text-primary">
                {label}
            </h3>
            <div className="space-y-3">
                {items.map((item) => (
                    <ShoppingListItem
                        key={item.id}
                        item={item}
                        onToggle={onToggle}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};
