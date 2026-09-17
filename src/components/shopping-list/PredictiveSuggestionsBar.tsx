import { Sparkles, Plus, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PredictiveSuggestion } from "@/lib/shopping-predictive";
import { getCategoryIcon } from "@/lib/shopping-list-utils";

interface PredictiveSuggestionsBarProps {
  suggestions: PredictiveSuggestion[];
  onAdd: (suggestion: PredictiveSuggestion) => void;
  onAddAll?: () => void;
  onDismiss: (name: string) => void;
  addingName: string | null;
}

export const PredictiveSuggestionsBar = ({
  suggestions,
  onAdd,
  onAddAll,
  onDismiss,
  addingName,
}: PredictiveSuggestionsBarProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-accent/10 border border-primary/20 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Basiques & Réapprovisionnement
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                {suggestions.length}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Suggérés selon vos habitudes et votre stock
            </p>
          </div>
        </div>

        {suggestions.length > 1 && onAddAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddAll}
            className="text-xs font-medium text-primary hover:text-primary/90 h-8 px-2.5"
          >
            + Tout ajouter
          </Button>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none snap-x">
        {suggestions.map((suggestion) => {
          const isAdding = addingName === suggestion.name;
          const icon = getCategoryIcon(suggestion.category || "autre");

          return (
            <div
              key={suggestion.name}
              className="snap-start flex-shrink-0 flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card border shadow-xs hover:border-primary/40 transition-all min-w-[210px] max-w-[260px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground truncate">
                    {suggestion.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground truncate" title={suggestion.reason}>
                    {suggestion.reason}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => onAdd(suggestion)}
                  disabled={isAdding}
                  aria-label={`Ajouter ${suggestion.name}`}
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => onDismiss(suggestion.name)}
                  className="text-muted-foreground/60 hover:text-muted-foreground p-1"
                  aria-label={`Ignorer ${suggestion.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
