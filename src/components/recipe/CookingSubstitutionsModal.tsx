import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Lightbulb, ArrowRight, ChefHat } from "lucide-react";
import {
  SUBSTITUTIONS_DATABASE,
  findIngredientSubstitution,
  normalizeIngredientSearch,
  IngredientSubstitution,
} from "@/lib/ingredient-substitutions";

interface CookingSubstitutionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeIngredients?: Array<{ name: string; quantity?: number | null; unit?: string | null }>;
  initialSearch?: string;
}

export const CookingSubstitutionsModal: React.FC<CookingSubstitutionsModalProps> = ({
  open,
  onOpenChange,
  recipeIngredients = [],
  initialSearch = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Sync initialSearch when opening
  React.useEffect(() => {
    if (open) {
      setSearchTerm(initialSearch);
    }
  }, [open, initialSearch]);

  // Detected substitutions for the current recipe ingredients
  const recipeSubstitutions = useMemo(() => {
    const list: Array<{ ingredientName: string; sub: IngredientSubstitution }> = [];
    for (const ing of recipeIngredients) {
      const match = findIngredientSubstitution(ing.name);
      if (match && !list.some((item) => item.sub.key === match.key)) {
        list.push({ ingredientName: ing.name, sub: match });
      }
    }
    return list;
  }, [recipeIngredients]);

  // Filtered list based on search term
  const filteredSubstitutions = useMemo(() => {
    if (!searchTerm.trim()) {
      return null;
    }
    const clean = normalizeIngredientSearch(searchTerm);

    // Direct lookup
    const direct = findIngredientSubstitution(searchTerm);
    if (direct) {
      return [direct];
    }

    // Match in database
    return SUBSTITUTIONS_DATABASE.filter(
      (item) =>
        normalizeIngredientSearch(item.canonicalName).includes(clean) ||
        item.substitutes.some((s) => normalizeIngredientSearch(s.name).includes(clean))
    );
  }, [searchTerm]);

  const displayedList = filteredSubstitutions ?? SUBSTITUTIONS_DATABASE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg">Substitutions d'ingrédients</DialogTitle>
              <DialogDescription className="text-xs">
                Aide contextuelle et équivalences si un ingrédient manque à l'appel.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative mt-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher (ex: beurre, œuf, crème, vin blanc...)"
            className="pl-9 h-10 text-xs sm:text-sm bg-muted/30"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Recipe's Quick Chips if available */}
        {!searchTerm && recipeSubstitutions.length > 0 && (
          <div className="mt-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Dans cette recette :
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {recipeSubstitutions.map((item) => (
                <button
                  key={item.sub.key}
                  onClick={() => setSearchTerm(item.sub.canonicalName)}
                  className="text-xs px-2.5 py-1 rounded-full bg-accent/10 hover:bg-accent/20 text-accent-foreground font-medium border border-accent/20 transition-colors flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3 text-accent" />
                  {item.sub.canonicalName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List of Substitutions */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
          {displayedList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs bg-muted/20 rounded-2xl p-4">
              <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm text-foreground">Aucun substitut trouvé</p>
              <p className="mt-1">
                Essayez un terme plus générique (ex: "lait", "farine", "huile").
              </p>
            </div>
          ) : (
            displayedList.map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-2xl border border-border/80 bg-card hover:border-accent/40 transition-colors space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{item.canonicalName}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                      {item.category.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic bg-muted/40 p-2 rounded-xl">
                  💡 {item.quickHint}
                </p>

                <div className="space-y-2 pt-1">
                  {item.substitutes.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="text-xs pl-2.5 border-l-2 border-accent/60 flex flex-col gap-0.5"
                    >
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground">{sub.name}</span>
                        {sub.ratio && (
                          <span className="text-[11px] text-accent font-medium">
                            ({sub.ratio})
                          </span>
                        )}
                      </div>
                      {sub.tip && (
                        <span className="text-[11px] text-muted-foreground">{sub.tip}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
