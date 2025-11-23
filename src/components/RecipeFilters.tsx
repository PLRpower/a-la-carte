import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface RecipeFiltersProps {
  category: string;
  difficulty: string;
  maxTime: string;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onMaxTimeChange: (value: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const RecipeFilters = ({
  category,
  difficulty,
  maxTime,
  onCategoryChange,
  onDifficultyChange,
  onMaxTimeChange,
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
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="italian">Italien</SelectItem>
                  <SelectItem value="seafood">Fruits de mer</SelectItem>
                  <SelectItem value="asian">Asiatique</SelectItem>
                  <SelectItem value="salad">Salade</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="vegetarian">Végétarien</SelectItem>
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
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
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
