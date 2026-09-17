import { useState } from "react";
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
import { ChefHat, ShoppingCart, AlertTriangle, Check, Loader2, ArrowRight } from "lucide-react";
import { DestockingResult } from "@/lib/stock-matching";

interface CookRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeTitle: string;
  servings: number;
  destockingResult: DestockingResult;
  onConfirmDestock: () => Promise<void>;
  onAddToShoppingList: (
    items: DestockingResult["depletedOrLowStockItems"]
  ) => Promise<void>;
}

export const CookRecipeModal = ({
  open,
  onOpenChange,
  recipeTitle,
  servings,
  destockingResult,
  onConfirmDestock,
  onAddToShoppingList,
}: CookRecipeModalProps) => {
  const [step, setStep] = useState<"confirm" | "proposal">("confirm");
  const [loading, setLoading] = useState(false);
  const [selectedReplenish, setSelectedReplenish] = useState<Set<string>>(new Set());

  const { deductions, untrackedIngredients, depletedOrLowStockItems } = destockingResult;

  const handleDestock = async () => {
    setLoading(true);
    try {
      await onConfirmDestock();

      // If any items are depleted or low stock, suggest adding them to shopping list
      if (depletedOrLowStockItems.length > 0) {
        setSelectedReplenish(new Set(depletedOrLowStockItems.map((i) => i.name)));
        setStep("proposal");
      } else {
        onOpenChange(false);
        setStep("confirm");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReplenishConfirm = async () => {
    const itemsToAdd = depletedOrLowStockItems.filter((i) => selectedReplenish.has(i.name));
    if (itemsToAdd.length > 0) {
      setLoading(true);
      try {
        await onAddToShoppingList(itemsToAdd);
      } finally {
        setLoading(false);
      }
    }
    onOpenChange(false);
    setStep("confirm");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setStep("confirm"), 200);
  };

  const toggleReplenish = (name: string) => {
    setSelectedReplenish((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg">J'ai cuisiné ce plat !</DialogTitle>
                  <DialogDescription className="text-xs">
                    Déduire les ingrédients pour {servings} portion{servings > 1 ? "s" : ""} de "{recipeTitle}"
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 max-h-[45vh]">
              {deductions.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center bg-muted/40 rounded-xl">
                  Aucun ingrédient de cette recette n'est suivi dans votre stock.
                </p>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Modifications prévues du stock ({deductions.length}) :
                  </span>
                  {deductions.map((d) => (
                    <div
                      key={d.stockId}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {d.ingredientName}
                          </span>
                          {d.isDepleted ? (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                              Épuisé (0 restant)
                            </Badge>
                          ) : d.isLowStock ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 bg-amber-500/10 text-amber-700 border-amber-500/30"
                            >
                              Stock bas
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          Déduction : -{d.deductedQuantity} {d.unit !== "piece" ? d.unit : ""}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-muted-foreground line-through mr-1.5">
                          {d.currentQuantity}
                        </span>
                        <ArrowRight className="w-3 h-3 inline text-muted-foreground mr-1.5" />
                        <span className={`font-bold ${d.isDepleted ? "text-destructive" : "text-foreground"}`}>
                          {d.newQuantity} {d.unit !== "piece" ? d.unit : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {untrackedIngredients.length > 0 && (
                <div className="p-2.5 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Non suivis en stock ({untrackedIngredients.length}) : </span>
                  {untrackedIngredients.join(", ")}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 flex sm:flex-row gap-2 border-t border-border/50">
              <Button type="button" variant="outline" onClick={handleClose} className="sm:flex-1">
                Annuler
              </Button>
              <Button
                type="button"
                disabled={loading || deductions.length === 0}
                onClick={handleDestock}
                className="sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Check className="w-4 h-4 mr-1.5" />
                )}
                Confirmer le déstockage
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Step 2: Proposition to add depleted or low stock items to shopping list */}
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg">Ingrédients presque épuisés !</DialogTitle>
                  <DialogDescription className="text-xs">
                    Voulez-vous ajouter les articles épuisés ou en stock critique à votre liste de courses ?
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 max-h-[45vh]">
              {depletedOrLowStockItems.map((item) => {
                const isChecked = selectedReplenish.has(item.name);
                return (
                  <label
                    key={item.name}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      isChecked
                        ? "bg-accent/10 border-accent/40"
                        : "bg-muted/20 border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleReplenish(item.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate">{item.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30"
                        >
                          À racheter
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Ajouter : {item.quantity} {item.unit !== "piece" ? item.unit : ""}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <DialogFooter className="pt-2 flex sm:flex-row gap-2 border-t border-border/50">
              <Button type="button" variant="outline" onClick={handleClose} className="sm:flex-1">
                Non merci, terminer
              </Button>
              <Button
                type="button"
                disabled={loading || selectedReplenish.size === 0}
                onClick={handleReplenishConfirm}
                className="sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-xs"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                )}
                Ajouter ({selectedReplenish.size})
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
