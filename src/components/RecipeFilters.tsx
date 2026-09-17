import { X, Sparkles, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface RecipeFiltersProps {
  category: string;
  difficulty: string;
  maxTime: string;
  onlyCookable?: boolean;
  onlyBudget?: boolean;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onMaxTimeChange: (value: string) => void;
  onOnlyCookableChange?: (value: boolean) => void;
  onOnlyBudgetChange?: (value: boolean) => void;
  onReset: () => void;
  onClose: () => void;
}

const RecipeFilters = ({
  category,
  difficulty,
  maxTime,
  onlyCookable = false,
  onlyBudget = false,
  onCategoryChange,
  onDifficultyChange,
  onMaxTimeChange,
  onOnlyCookableChange,
  onOnlyBudgetChange,
  onReset,
  onClose,
}: RecipeFiltersProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in">
      <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-lg animate-in slide-in-from-bottom max-h-[80vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Filtres</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <Separator />

          <div className="space-y-4">
            {/* Frigo Match Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="space-y-0.5 pr-2">
                <Label htmlFor="only-cookable" className="font-bold text-sm text-foreground cursor-pointer flex items-center gap-1.5">
                  <span>🥗</span> Cuisinable maintenant
                </Label>
                <p className="text-xs text-muted-foreground">
                  Uniquement les plats avec 100% des ingrédients en stock
                </p>
              </div>
              <Switch
                id="only-cookable"
                checked={onlyCookable}
                onCheckedChange={(checked) => onOnlyCookableChange?.(checked)}
              />
            </div>

            {/* Fin de mois difficile / Petit Budget Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="space-y-0.5 pr-2">
                <Label htmlFor="only-budget" className="font-bold text-sm text-foreground cursor-pointer flex items-center gap-1.5">
                  <PiggyBank className="w-4 h-4 text-amber-600" />
                  <span>Fin de mois difficile / Petit budget</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recettes à moins de 2,50 € / portion
                </p>
              </div>
              <Switch
                id="only-budget"
                checked={onlyBudget}
                onCheckedChange={(checked) => onOnlyBudgetChange?.(checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="petit_dejeuner">Petit-déjeuner</SelectItem>
                  <SelectItem value="dejeuner">Déjeuner</SelectItem>
                  <SelectItem value="diner">Dîner</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="encas">En-cas</SelectItem>
                  <SelectItem value="vegetarien">Végétarien</SelectItem>
                  <SelectItem value="vegan">Végétalien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulté</Label>
              <Select value={difficulty} onValueChange={onDifficultyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="facile">Facile</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="difficile">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Temps de préparation maximum</Label>
              <Select value={maxTime} onValueChange={onMaxTimeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Peu importe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Peu importe</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button onClick={onClose} className="w-full" size="lg">
              Appliquer les filtres
            </Button>
            <Button onClick={onReset} variant="outline" className="w-full" size="lg">
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeFilters;
