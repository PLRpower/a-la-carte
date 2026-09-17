import React, { useState } from "react";
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
import { 
  WeeklyShoppingListResult, 
  GeneratedShoppingItem 
} from "@/lib/meal-planner-utils";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight, 
  AlertCircle 
} from "lucide-react";

interface WeeklyShoppingListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: WeeklyShoppingListResult;
}

export const WeeklyShoppingListModal: React.FC<WeeklyShoppingListModalProps> = ({
  open,
  onOpenChange,
  analysis,
}) => {
  const { addItems } = useShoppingList();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set(analysis.missingItems.map((i) => i.id));
  });
  const [showAvailable, setShowAvailable] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [hasAdded, setHasAdded] = useState(false);

  // Sync selected when analysis changes
  React.useEffect(() => {
    setSelectedIds(new Set(analysis.missingItems.map((i) => i.id)));
    setHasAdded(false);
  }, [analysis.missingItems]);

  const toggleSelectAll = () => {
    if (selectedIds.size === analysis.missingItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(analysis.missingItems.map((i) => i.id)));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddToShoppingList = async () => {
    const itemsToAdd = analysis.missingItems
      .filter((item) => selectedIds.has(item.id))
      .map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        ingredient_id: item.ingredientId,
      }));

    if (itemsToAdd.length === 0) return;

    setIsAdding(true);
    try {
      const res = await addItems(itemsToAdd);
      if (res.error) throw res.error;

      setHasAdded(true);
      toast({
        title: "Liste de courses mise à jour ! 🛒",
        description: `${itemsToAdd.length} ingrédient${itemsToAdd.length > 1 ? "s ajoutés" : " ajouté"} avec succès.`,
      });
    } catch (err: any) {
      console.error("Error adding to shopping list:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les ingrédients aux courses.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span>Générateur de courses de la semaine</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingrédients requis pour vos {analysis.totalMealsCount} repas prévus, après déduction de votre stock actuel.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 gap-2 my-2">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-sm">
              {analysis.missingItems.length}
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">À acheter</div>
              <div className="text-[10px] text-muted-foreground">Non présents en stock</div>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-sm">
              {analysis.availableItems.length}
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">Déjà au frigo</div>
              <div className="text-[10px] text-muted-foreground">Économisés cette semaine</div>
            </div>
          </div>
        </div>

        {/* Missing Items List */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-3">
          {analysis.missingItems.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/80 p-4">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Génial ! Vous avez déjà tous les ingrédients nécessaires en stock.
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Aucun achat requis pour les repas prévus cette semaine.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-foreground">
                  Articles à ajouter ({selectedIds.size}/{analysis.missingItems.length})
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-primary hover:underline font-medium text-[11px]"
                >
                  {selectedIds.size === analysis.missingItems.length ? "Tout désélectionner" : "Tout sélectionner"}
                </button>
              </div>

              <div className="space-y-1.5">
                {analysis.missingItems.map((item) => {
                  const isChecked = selectedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? "bg-primary/5 border-primary/40 text-foreground"
                          : "bg-card border-border/60 text-muted-foreground opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Checkbox checked={isChecked} onCheckedChange={() => toggleItem(item.id)} />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold line-clamp-1">{item.name}</div>
                          {item.usedInRecipes.length > 0 && (
                            <div className="text-[10px] text-muted-foreground line-clamp-1">
                              Pour : {item.usedInRecipes.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-foreground">
                          {item.quantity} {item.unit !== "piece" ? item.unit : ""}
                        </span>
                        {item.stockAvailable > 0 && (
                          <div className="text-[9px] text-muted-foreground">
                            (Stock: {item.stockAvailable} {item.unit})
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Collapsible Already In Stock Section */}
          {analysis.availableItems.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAvailable(!showAvailable)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/40 hover:bg-muted/60 text-xs font-medium text-muted-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  Déjà couverts par votre stock ({analysis.availableItems.length})
                </span>
                {showAvailable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAvailable && (
                <div className="mt-2 space-y-1 pl-2">
                  {analysis.availableItems.map((item) => (
                    <div key={item.id} className="text-[11px] text-muted-foreground flex justify-between py-1 border-b border-border/30">
                      <span>{item.name}</span>
                      <span className="text-emerald-600 font-medium">
                        Requis: {item.neededTotal} {item.unit} • En stock: {item.stockAvailable}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 border-t border-border/50 flex sm:flex-row flex-col gap-2">
          {hasAdded ? (
            <div className="w-full flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => onOpenChange(false)}
              >
                Fermer
              </Button>
              <Button
                className="flex-1 text-xs bg-primary text-primary-foreground"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/shopping-list");
                }}
              >
                Voir mes courses <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" className="text-xs" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button
                disabled={selectedIds.size === 0 || isAdding}
                onClick={handleAddToShoppingList}
                className="text-xs font-semibold"
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                {isAdding ? "Ajout en cours..." : `Ajouter ${selectedIds.size} article${selectedIds.size > 1 ? "s" : ""} aux courses`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
