import { ShoppingListItemWithIngredient } from "@/types/database";
import { ShoppingListItem } from "./ShoppingListItem";
import { getCategoryLabel } from "@/lib/shopping-list-utils";

interface ShoppingListCategoryProps {
    category: string;
    items: ShoppingListItemWithIngredient[];
    onToggle: (id: string, checked: boolean) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => void;
}

export const ShoppingListCategory = ({ category, items, onToggle, onDelete, onUpdate }: ShoppingListCategoryProps) => {
    const label = getCategoryLabel(category);

    return (
        <div>
            <h3 className="font-medium text-base mb-1 mt-2 capitalize text-primary">
                {label}
            </h3>
            <div className="space-y-0">
                {items.map((item) => (
                    <ShoppingListItem
                        key={item.id}
                        item={item}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                    />
                ))}
            </div>
        </div>
    );
};
