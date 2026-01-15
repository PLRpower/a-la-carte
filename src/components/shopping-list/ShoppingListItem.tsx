import { useState, useRef, useEffect } from "react";
import { X, HelpCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingListItemWithIngredient } from "@/types/database";
import { parseIngredientInput } from "@/lib/ingredient-parser";

interface ShoppingListItemProps {
    item: ShoppingListItemWithIngredient;
    onToggle: (id: string, checked: boolean) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: any) => void;
}

export const ShoppingListItem = ({ item, onToggle, onDelete, onUpdate }: ShoppingListItemProps) => {
    // Construct initial display value
    const getDisplayValue = () => {
        let display = item.name;
        if (item.quantity) {
            const unitDisplay = (item.unit && item.unit !== 'piece') ? item.unit : '';
            display += ` (${item.quantity}${unitDisplay})`;
        }
        return display;
    };

    const [value, setValue] = useState(getDisplayValue());
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update local value if item changes externally
    useEffect(() => {
        if (!isFocused) {
            setValue(getDisplayValue());
        }
    }, [item.name, item.quantity, item.unit]);

    const handleBlur = () => {
        setIsFocused(false);
        const currentDisplay = getDisplayValue();
        if (value.trim() !== currentDisplay) {
            // Parse and update
            const { name, quantity, unit } = parseIngredientInput(value);
            if (name) {
                onUpdate(item.id, { name, quantity, unit: unit || null });
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            inputRef.current?.blur();
        }
    };

    return (
        <div
            className={`group flex items-center gap-3 py-2 px-1 min-h-[40px] ${item.checked ? 'opacity-50' : ''}`}
        >
            {/* Checkbox square */}
            <div className="relative flex items-center justify-center">
                <Checkbox
                    checked={item.checked || false}
                    onCheckedChange={() => onToggle(item.id, !item.checked)}
                    className="w-5 h-5 rounded-[2px] border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-colors"
                />
            </div>

            {item.ingredient?.image_url ? (
                <img
                    src={item.ingredient.image_url}
                    alt={item.name}
                    className="w-8 h-8 rounded bg-muted object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                    <HelpCircle className="w-5 h-5" />
                </div>
            )}

            <div className="flex-1 relative cursor-text" onClick={() => {
                setIsFocused(true);
                setTimeout(() => inputRef.current?.focus(), 0);
            }}>
                {!isFocused ? (
                    <div className={`text-base ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        <span>{item.name}</span>
                        {item.quantity && (
                            <span className="text-muted-foreground ml-1">
                                ({item.quantity}{(item.unit && item.unit !== 'piece') ? item.unit : ''})
                            </span>
                        )}
                    </div>
                ) : (
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className={`w-full bg-transparent border-none p-0 outline-none shadow-none text-base focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50 ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                        spellCheck={false}
                        placeholder="Article..."
                    />
                )}
            </div>

            <button
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-destructive"
                aria-label="Supprimer"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};
