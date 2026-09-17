import React, { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeWithDetails, MealPlanSlot } from "@/types/database";
import { CATALOG_RECIPES, CatalogRecipe } from "@/data/recipesCatalog";
import { RecipeImage } from "@/components/RecipeImage";
import { useRecipes } from "@/hooks/useRecipes";
import { useStock } from "@/hooks/useStock";
import { analyzeRecipeStock } from "@/lib/stock-matching";
import { 
  Search, 
  Clock, 
  ChefHat, 
  Check, 
  Sparkles, 
  Utensils, 
  BookOpen, 
  Compass, 
  PenTool, 
  Users 
} from "lucide-react";

interface AssignRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetDateKey: string;
  targetDayName: string;
  targetSlot: MealPlanSlot;
  onAssignRecipe: (data: {
    recipe?: RecipeWithDetails;
    catalogRecipe?: CatalogRecipe;
    customTitle?: string;
    servings: number;
  }) => Promise<void>;
}

export const AssignRecipeModal: React.FC<AssignRecipeModalProps> = ({
  open,
  onOpenChange,
  targetDateKey,
  targetDayName,
  targetSlot,
  onAssignRecipe,
}) => {
  const { allRecipes } = useRecipes();
  const { stock } = useStock();

  const [activeTab, setActiveTab] = useState<"carnet" | "catalog" | "custom">("carnet");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [customTitle, setCustomTitle] = useState("");
  const [servings, setServings] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slotLabel = targetSlot === "lunch" ? "Midi (Déjeuner)" : "Soir (Dîner)";

  // Filter user recipes
  const filteredUserRecipes = useMemo(() => {
    return allRecipes.filter(r => {
      const matchQuery = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = selectedTag === "all" || (r.tags || []).some(t => t.toLowerCase() === selectedTag.toLowerCase());
      return matchQuery && matchTag;
    });
  }, [allRecipes, searchQuery, selectedTag]);

  // Filter catalog recipes
  const filteredCatalogRecipes = useMemo(() => {
    return CATALOG_RECIPES.filter(r => {
      const matchQuery = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = selectedTag === "all" || (r.tags || []).some(t => t.toLowerCase() === selectedTag.toLowerCase());
      return matchQuery && matchTag;
    });
  }, [searchQuery, selectedTag]);

  const handleSelectUserRecipe = async (recipe: RecipeWithDetails) => {
    setIsSubmitting(true);
    try {
      await onAssignRecipe({ recipe, servings });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCatalogRecipe = async (catalogRecipe: CatalogRecipe) => {
    setIsSubmitting(true);
    try {
      await onAssignRecipe({ catalogRecipe, servings });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCustomMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onAssignRecipe({ customTitle: customTitle.trim(), servings });
      setCustomTitle("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
              <span>📅 {targetDayName}</span>
              <Badge variant="outline" className="text-xs font-medium">
                {slotLabel}
              </Badge>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Choisissez une recette ou renseignez un plat personnalisé.
          </DialogDescription>
        </DialogHeader>

        {/* Servings Counter Selector */}
        <div className="flex items-center justify-between py-2 border-y border-border/50 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>Nombre de convives pour ce repas :</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/60 rounded-md p-1">
            <button
              type="button"
              onClick={() => setServings(s => Math.max(1, s - 1))}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-background font-bold text-xs"
            >
              -
            </button>
            <span className="font-semibold text-xs px-1 text-foreground">
              {servings} {servings > 1 ? "pers." : "pers."}
            </span>
            <button
              type="button"
              onClick={() => setServings(s => Math.min(12, s + 1))}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-background font-bold text-xs"
            >
              +
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col min-h-0 pt-2">
          <TabsList className="grid grid-cols-3 w-full mb-3">
            <TabsTrigger value="carnet" className="text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Carnet ({allRecipes.length})
            </TabsTrigger>
            <TabsTrigger value="catalog" className="text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Catalogue
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              Sur-mesure
            </TabsTrigger>
          </TabsList>

          {/* Search bar for recipe tabs */}
          {activeTab !== "custom" && (
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une recette (ex: pâtes, curry, quiche)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Tag filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: "all", label: "Tous" },
                  { id: "rapide", label: "⚡ Rapide" },
                  { id: "vegetarien", label: "🥗 Végé" },
                  { id: "etudiant", label: "🎓 Budget" },
                  { id: "famille", label: "👨‍👩‍👦 Famille" },
                ].map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTag === tag.id ? "default" : "outline"}
                    className="cursor-pointer text-[10px] px-2 py-0.5 whitespace-nowrap"
                    onClick={() => setSelectedTag(tag.id)}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: Mon Carnet */}
          <TabsContent value="carnet" className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0 mt-0">
            {filteredUserRecipes.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Aucune recette trouvée dans votre carnet personnel.
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("catalog")}>
                    Explorer le catalogue (108 recettes)
                  </Button>
                </div>
              </div>
            ) : (
              filteredUserRecipes.map((recipe) => {
                const analysis = recipe.ingredients
                  ? analyzeRecipeStock(recipe.ingredients as any, stock, servings / (recipe.servings || 2))
                  : null;

                return (
                  <button
                    key={recipe.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSelectUserRecipe(recipe)}
                    className="w-full text-left p-2.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-accent/10 transition-all flex items-center gap-3 group"
                  >
                    {recipe.image_url ? (
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                        <RecipeImage src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h5 className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {recipe.title}
                        </h5>
                        {analysis && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                              analysis.isCookable
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {analysis.isCookable ? "En stock" : `${analysis.missingCount} manquant${analysis.missingCount > 1 ? "s" : ""}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                        </span>
                        {recipe.difficulty && <span className="capitalize">{recipe.difficulty}</span>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </TabsContent>

          {/* TAB 2: Catalogue */}
          <TabsContent value="catalog" className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0 mt-0">
            {filteredCatalogRecipes.slice(0, 30).map((recipe) => {
              const analysis = recipe.ingredients
                ? analyzeRecipeStock(recipe.ingredients as any, stock, servings / (recipe.servings || 2))
                : null;

              return (
                <button
                  key={recipe.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectCatalogRecipe(recipe)}
                  className="w-full text-left p-2.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-accent/10 transition-all flex items-center gap-3 group"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <RecipeImage src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h5 className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {recipe.title}
                      </h5>
                      {analysis && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                            analysis.isCookable
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {analysis.isCookable ? "En stock" : `${analysis.missingCount} manquant${analysis.missingCount > 1 ? "s" : ""}`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                      </span>
                      {recipe.difficulty && <span className="capitalize">{recipe.difficulty}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </TabsContent>

          {/* TAB 3: Sur-mesure / Repas personnalisé */}
          <TabsContent value="custom" className="flex-1 flex flex-col justify-between py-2 min-h-0 mt-0">
            <form onSubmit={handleSaveCustomMeal} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Intitulé du repas</label>
                <Input
                  placeholder="Ex : Salade composée & restes, Soirée Pizza, Restaurant..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="text-xs"
                  autoFocus
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground w-full">Suggestions rapides :</span>
                {[
                  "Restes du frigo",
                  "Salade composée",
                  "Plat de pâtes minute",
                  "Soirée crêpes",
                  "Repas à emporter",
                  "Déjeuner sur le pouce"
                ].map((sugg) => (
                  <Badge
                    key={sugg}
                    variant="outline"
                    className="cursor-pointer text-[10px] hover:bg-accent/20"
                    onClick={() => setCustomTitle(sugg)}
                  >
                    {sugg}
                  </Badge>
                ))}
              </div>

              <Button type="submit" className="w-full mt-4" disabled={!customTitle.trim() || isSubmitting}>
                Ajouter au {slotLabel.toLowerCase()}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
