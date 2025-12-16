import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingListItemWithIngredient } from "@/types/database";

interface ShoppingListItemProps {
    item: ShoppingListItemWithIngredient;
    onToggle: (id: string, checked: boolean) => void;
    onDelete: (id: string) => void;
}

export const ShoppingListItem = ({ item, onToggle, onDelete }: ShoppingListItemProps) => {
    return (
        <Card className="shadow-sm overflow-hidden">
            <div
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors"
                onClick={() => onToggle(item.id, item.checked || false)}
            >
                <Checkbox
                    checked={item.checked || false}
                    onCheckedChange={() => onToggle(item.id, item.checked || false)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 w-4 h-4"
                />
                {item.ingredient?.image_url && (
                    <img
                        src={item.ingredient.image_url}
                        alt={item.name}
                        className={`w-6 h-6 rounded-full object-cover bg-muted flex-shrink-0 ${item.checked ? "grayscale opacity-50" : ""
                            }`}
                    />
                )}
                <span
                    className={`flex-1 capitalize text-sm ${item.checked
                        ? "line-through text-muted-foreground"
                        : ""
                        }`}
                >
                    {item.name}
                    {item.quantity && (
                        <span className="text-sm text-muted-foreground ml-2 lowercase">
                            ({item.quantity}{item.unit && item.unit !== 'piece' ? ` ${item.unit}` : ''})
                        </span>
                    )}
                </span>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className="flex-shrink-0 h-7 w-7"
                >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
            </div>
        </Card>
    );
};
