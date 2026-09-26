import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RecipeImage } from "@/components/RecipeImage";
import { STARTER_THEMES, getStarterPackRecipes } from "@/data/starterPacks";
import { CatalogRecipe } from "@/data/recipesCatalog";
import { cloneStarterPack } from "@/lib/recipe-clone";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, ChefHat, Sparkles, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StarterPackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const StarterPackModal = ({
  open,
  onOpenChange,
  onSuccess,
}: StarterPackModalProps) => {
  const { user } = useAuth();
  const { ingredients: allIngredients } = useIngredients();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedThemes, setSelectedThemes] = useState<string[]>([
    "rapide",
    "etudiant",
  ]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(
    new Set()
  );
  const [importing, setImporting] = useState(false);

  // Compute recommended pack based on themes
  const packRecipes = useMemo(() => {
    return getStarterPackRecipes(selectedThemes, 12);
  }, [selectedThemes]);

  // Keep all pack recipes selected by default when themes change
  useMemo(() => {
    setSelectedRecipeIds(new Set(packRecipes.map((r) => r.id)));
  }, [packRecipes]);

  const toggleTheme = (themeId: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeId)
        ? prev.filter((t) => t !== themeId)
        : [...prev, themeId]
    );
  };

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });
  };

  const selectedRecipesToImport = useMemo(() => {
    return packRecipes.filter((r) => selectedRecipeIds.has(r.id));
  }, [packRecipes, selectedRecipeIds]);

  const handleImport = async () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth?mode=signup", { state: { isSignup: true } });
      return;
    }

    if (selectedRecipesToImport.length === 0) return;

    setImporting(true);
    try {
      const count = await cloneStarterPack(
        selectedRecipesToImport,
        user.id,
        allIngredients
      );
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({
        title: "Pack de recettes importé !",
        description: `${count} recettes ont été ajoutées avec succès à votre carnet.`,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error importing starter pack:", error);
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer toutes les recettes.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 text-accent font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            Pack de Bienvenue
          </div>
          <DialogTitle className="text-xl font-bold">
            Choisissez vos recettes de démarrage
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Sélectionnez vos préférences culinaires pour remplir instantanément
            votre carnet de 10 à 15 recettes testées et approuvées.
          </DialogDescription>
        </DialogHeader>

        {/* Thematic Filters Chips */}
        <div className="px-6 py-2 border-b border-border/60">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Filtres thématiques :
          </div>
          <div className="flex flex-wrap gap-2">
            {STARTER_THEMES.map((theme) => {
              const isSelected = selectedThemes.includes(theme.id);
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => toggleTheme(theme.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? "bg-accent text-accent-foreground border-accent shadow-sm"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
                  }`}
                >
                  <span>{theme.emoji}</span>
                  <span>{theme.label}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipes Selection List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>
              {selectedRecipeIds.size} sur {packRecipes.length} recettes
              sélectionnées
            </span>
            <button
              type="button"
              className="text-accent hover:underline font-medium"
              onClick={() => {
                if (selectedRecipeIds.size === packRecipes.length) {
                  setSelectedRecipeIds(new Set());
                } else {
                  setSelectedRecipeIds(new Set(packRecipes.map((r) => r.id)));
                }
              }}
            >
              {selectedRecipeIds.size === packRecipes.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </button>
          </div>

          {packRecipes.map((recipe) => {
            const isChecked = selectedRecipeIds.has(recipe.id);
            return (
              <div
                key={recipe.id}
                onClick={() => toggleRecipe(recipe.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? "border-accent/40 bg-accent/5"
                    : "border-border/60 opacity-60 hover:opacity-100"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleRecipe(recipe.id)}
                  className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                  <RecipeImage
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {recipe.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.prep_time + recipe.cook_time} min
                    </span>
                    <span>·</span>
                    <span className="capitalize">{recipe.difficulty}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[9px] px-1 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 sm:justify-between flex-row items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={importing}
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={importing || selectedRecipesToImport.length === 0}
            onClick={handleImport}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importation en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {user
                  ? `Importer mes ${selectedRecipesToImport.length} recettes`
                  : `Créer un compte et importer (${selectedRecipesToImport.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
