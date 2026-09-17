import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, AlertCircle, Loader2 } from "lucide-react";
import { IngredientStockStatus } from "@/lib/stock-matching";
import { MeasurementUnit } from "@/types/database";

interface AddToShoppingListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeTitle: string;
  servings: number;
  statuses: IngredientStockStatus[];
  onConfirm: (
    items: Array<{
      name: string;
      quantity: number | null;
      unit: MeasurementUnit | null;
      ingredient_id?: string | null;
    }>
  ) => Promise<void>;
}

export const AddToShoppingListModal = ({
  open,
  onOpenChange,
  recipeTitle,
  servings,
  statuses,
  onConfirm,
}: AddToShoppingListModalProps) => {
  // Pre-select missing items by default
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const missing = new Set(
        statuses
          .filter((s) => !s.isAvailable || s.missingQuantity > 0)
          .map((s) => s.name)
      );
      // If all are available, pre-select none or all depending on user preference
      setSelectedNames(missing);
    }
  }, [open, statuses]);

  const toggleItem = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedNames(new Set(statuses.map((s) => s.name)));
  };

  const selectOnlyMissing = () => {
    setSelectedNames(
      new Set(
        statuses
          .filter((s) => !s.isAvailable || s.missingQuantity > 0)
          .map((s) => s.name)
      )
    );
  };

  const handleConfirm = async () => {
    const itemsToAdd = statuses
      .filter((s) => selectedNames.has(s.name))
      .map((s) => ({
        name: s.name,
        // If missingQuantity is > 0, use missingQuantity; otherwise neededQuantity
        quantity: s.missingQuantity > 0 ? s.missingQuantity : s.neededQuantity,
        unit: s.unit,
        ingredient_id: s.ingredient_id,
      }));

    if (itemsToAdd.length === 0) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      await onConfirm(itemsToAdd);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const missingCount = statuses.filter((s) => !s.isAvailable || s.missingQuantity > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Ajouter à la liste de courses</DialogTitle>
              <DialogDescription className="text-xs">
                Ajusté pour {servings} portion{servings > 1 ? "s" : ""} de "{recipeTitle}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Quick action buttons */}
        <div className="flex items-center justify-between text-xs py-1 border-b border-border/50">
          <span className="text-muted-foreground">
            {missingCount === 0
              ? "Tous les ingrédients sont en stock"
              : `${missingCount} ingrédient${missingCount > 1 ? "s" : ""} manquant${missingCount > 1 ? "s" : ""}`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectOnlyMissing}
              className="text-accent hover:underline font-medium text-[11px]"
            >
              Manquants
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              type="button"
              onClick={selectAll}
              className="text-muted-foreground hover:text-foreground font-medium text-[11px]"
            >
              Tout cocher
            </button>
          </div>
        </div>

        {/* Ingredients list with checkboxes */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 max-h-[45vh]">
          {statuses.map((status) => {
            const isChecked = selectedNames.has(status.name);
            const isMissing = !status.isAvailable || status.missingQuantity > 0;

            return (
              <label
                key={status.name}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isChecked
                    ? "bg-accent/5 border-accent/40"
                    : "bg-muted/20 border-border/60 hover:bg-muted/40"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleItem(status.name)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium leading-tight truncate">
                      {status.name}
                    </span>
                    {isMissing ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30 shrink-0 font-medium"
                      >
                        <AlertCircle className="w-2.5 h-2.5 mr-1" />
                        {status.stockItem
                          ? `Manque ${status.missingQuantity} ${status.unit !== "piece" ? status.unit : ""}`
                          : "Non en stock"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30 shrink-0 font-medium"
                      >
                        <Check className="w-2.5 h-2.5 mr-1" />
                        En stock ({status.stockQuantity} {status.stockUnit !== "piece" ? status.stockUnit : ""})
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-0.5">
                    Quantité à acheter :{" "}
                    <span className="font-semibold text-foreground">
                      {status.missingQuantity > 0 ? status.missingQuantity : status.neededQuantity}{" "}
                      {status.unit !== "piece" && status.unit}
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <DialogFooter className="pt-2 flex sm:flex-row gap-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:flex-1"
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={loading || selectedNames.size === 0}
            onClick={handleConfirm}
            className="sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-1.5" />
            )}
            Ajouter ({selectedNames.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
