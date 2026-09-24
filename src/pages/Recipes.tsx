import { useState, useEffect, useMemo } from "react";
import { RecipeImage } from "@/components/RecipeImage";
import {
  Search,
  Clock,
  Heart,
  Filter,
  Plus,
  Book,
  GraduationCap,
  Globe,
  ChefHat,
  Camera,
  Sparkles,
  Check,
  Download,
  BookOpen,
  Compass,
  Coins,
  PiggyBank,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import RecipeFilters from "@/components/RecipeFilters";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeCategory, RecipeDifficulty } from "@/types/database";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { CATALOG_RECIPES, CatalogRecipe } from "@/data/recipesCatalog";
import { STARTER_THEMES } from "@/data/starterPacks";
import { cloneRecipeToUser } from "@/lib/recipe-clone";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { useStock } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { StarterPackModal } from "@/components/StarterPackModal";
import { AuthPromptDialog } from "@/components/AuthPromptDialog";
import { analyzeRecipeStock, RecipeIngredientLike } from "@/lib/stock-matching";
import { calculateRecipeCost } from "@/lib/recipe-cost";

const THEME_FILTERS = [
  { id: "all", label: "Tous", emoji: "🍽️" },
  { id: "rapide", label: "Rapide (<20 min)", emoji: "⚡" },
  { id: "etudiant", label: "Étudiant / Budget", emoji: "🎓" },
  { id: "vegetarien", label: "Végétarien", emoji: "🥗" },
  { id: "famille", label: "Famille", emoji: "👨‍👩‍👧‍👦" },
  { id: "batch_cooking", label: "Batch Cooking", emoji: "🍱" },
  { id: "dessert", label: "Desserts & Goûters", emoji: "🍰" },
];

const Recipes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { ingredients: allIngredients } = useIngredients();
  const { stock } = useStock();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Active Tab: 'carnet' (My Notebook) or 'discover' (Public Library)
  const initialTab = searchParams.get("tab") === "discover" ? "discover" : "carnet";
  const [activeTab, setActiveTab] = useState<"carnet" | "discover">(initialTab);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [category, setCategory] = useState<RecipeCategory | "all" | string>("all");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty | "all">("all");
  const [onlyCookable, setOnlyCookable] = useState(false);
  const [onlyBudget, setOnlyBudget] = useState(false);

  // Modals
  const [showStarterPackModal, setShowStarterPackModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptText, setAuthPromptText] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });

  // Track recipes being cloned right now to show spinner
  const [cloningId, setCloningId] = useState<string | null>(null);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "discover" && activeTab !== "discover") {
      setActiveTab("discover");
    } else if (tab === "carnet" && activeTab !== "carnet") {
      setActiveTab("carnet");
    }
  }, [searchParams]);

  const switchTab = (tab: "carnet" | "discover") => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      prev.set("tab", tab);
      return prev;
    });
  };

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setCategory(cat as RecipeCategory);
    }
  }, [searchParams]);

  // Fetch personal recipes from Supabase
  const {
    recipes: personalRecipes,
    allRecipes,
    loading: personalLoading,
    toggleFavorite,
  } = useRecipes({
    searchQuery: activeTab === "carnet" ? searchQuery : undefined,
    category: category === "all" ? undefined : category,
    difficulty: difficulty === "all" ? undefined : difficulty,
  });

  // Set of titles already present in user's notebook for fast 1-click check
  const carnetTitlesLower = useMemo(() => {
    return new Set(
      allRecipes.map((r) =>
        r.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
      )
    );
  }, [allRecipes]);

  // Filter Catalog Recipes for "Découvrir" tab
  const filteredCatalogRecipes = useMemo(() => {
    return CATALOG_RECIPES.filter((r) => {
      // Theme filter
      if (selectedTheme !== "all") {
        if (selectedTheme === "dessert") {
          if (r.category !== "dessert" && !r.tags.includes("dessert")) return false;
        } else if (!r.tags.includes(selectedTheme)) {
          return false;
        }
      }

      // Category filter
      if (category !== "all") {
        const categories = category.includes(",") ? category.split(",") : [category];
        if (!categories.includes(r.category) && !r.tags.some((t) => categories.includes(t))) {
          return false;
        }
      }

      // Difficulty filter
      if (difficulty !== "all" && r.difficulty !== difficulty) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
        const titleMatch = r.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(q);
        const descMatch = (r.description || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(q);
        const tagMatch = r.tags.some((t) => t.toLowerCase().includes(q));
        const ingMatch = r.ingredients.some((i) =>
          i.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(q)
        );
        return titleMatch || descMatch || tagMatch || ingMatch;
      }

      return true;
    });
  }, [selectedTheme, category, difficulty, searchQuery]);

  // Pre-calculate Frigo Match analysis for personal recipes
  const personalStockAnalyses = useMemo(() => {
    const map = new Map<string, ReturnType<typeof analyzeRecipeStock>>();
    for (const r of allRecipes) {
      map.set(r.id, analyzeRecipeStock((r.ingredients || []) as RecipeIngredientLike[], stock, 1));
    }
    return map;
  }, [allRecipes, stock]);

  // Pre-calculate Frigo Match analysis for catalog recipes
  const catalogStockAnalyses = useMemo(() => {
    const map = new Map<string, ReturnType<typeof analyzeRecipeStock>>();
    for (const r of CATALOG_RECIPES) {
      map.set(r.id, analyzeRecipeStock(r.ingredients as RecipeIngredientLike[], stock, 1));
    }
    return map;
  }, [stock]);

  // Pre-calculate Budget & Cost per serving for personal recipes
  const personalCostAnalyses = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateRecipeCost>>();
    for (const r of allRecipes) {
      map.set(r.id, calculateRecipeCost(r));
    }
    return map;
  }, [allRecipes]);

  // Pre-calculate Budget & Cost per serving for catalog recipes
  const catalogCostAnalyses = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateRecipeCost>>();
    for (const r of CATALOG_RECIPES) {
      map.set(r.id, calculateRecipeCost(r));
    }
    return map;
  }, []);

  // Filter recipes by "Cuisinable maintenant" and "Petit budget" if active
  const displayPersonalRecipes = useMemo(() => {
    return personalRecipes.filter((r) => {
      if (onlyCookable) {
        const analysis = personalStockAnalyses.get(r.id);
        if (!analysis?.isCookable) return false;
      }
      if (onlyBudget) {
        const cost = personalCostAnalyses.get(r.id);
        if (!cost?.isBudget) return false;
      }
      return true;
    });
  }, [personalRecipes, onlyCookable, onlyBudget, personalStockAnalyses, personalCostAnalyses]);

  const displayCatalogRecipes = useMemo(() => {
    return filteredCatalogRecipes.filter((r) => {
      if (onlyCookable) {
        const analysis = catalogStockAnalyses.get(r.id);
        if (!analysis?.isCookable) return false;
      }
      if (onlyBudget) {
        const cost = catalogCostAnalyses.get(r.id);
        if (!cost?.isBudget) return false;
      }
      return true;
    });
  }, [filteredCatalogRecipes, onlyCookable, onlyBudget, catalogStockAnalyses, catalogCostAnalyses]);

  const renderFrigoBadge = (analysis?: ReturnType<typeof analyzeRecipeStock>) => {
    if (!analysis || stock.length === 0) return null;

    if (analysis.isCookable) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs border-0 shrink-0">
          <Check className="w-3 h-3" />
          <span>Prêt à cuisiner (100%)</span>
        </Badge>
      );
    }

    if (analysis.missingCount === 1) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/90 text-white border-0 text-[10px] font-medium shadow-xs shrink-0"
        >
          Manque 1 ingrédient
        </Badge>
      );
    }

    if (analysis.missingCount === 2) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/90 text-white border-0 text-[10px] font-medium shadow-xs shrink-0"
        >
          Manque 2 ingrédients
        </Badge>
      );
    }

    if (analysis.matchPercentage >= 50) {
      return (
        <Badge
          variant="outline"
          className="bg-black/60 text-white border-0 text-[10px] shadow-xs shrink-0"
        >
          {analysis.matchPercentage}% en stock
        </Badge>
      );
    }

    return null;
  };

  const handleResetFilters = () => {
    setCategory("all");
    setDifficulty("all");
    setSelectedTheme("all");
    setOnlyCookable(false);
    setOnlyBudget(false);
  };

  // 1-Click clone recipe into user's personal notebook
  const handleCloneRecipe = async (e: React.MouseEvent, catalogRecipe: CatalogRecipe) => {
    e.stopPropagation();

    if (!user) {
      setAuthPromptText({
        title: "Ajoutez cette recette à votre carnet",
        description: "Créez votre compte gratuit en 1 clic pour sauvegarder cette recette, planifier vos repas et gérer vos ingrédients.",
      });
      setShowAuthPrompt(true);
      return;
    }

    setCloningId(catalogRecipe.id);
    try {
      await cloneRecipeToUser(catalogRecipe, user.id, allIngredients);
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({
        title: "Recette ajoutée ! 🍳",
        description: `"${catalogRecipe.title}" est maintenant dans votre carnet.`,
      });
    } catch (err) {
      console.error("Error cloning recipe:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la recette à votre carnet.",
        variant: "destructive",
      });
    } finally {
      setCloningId(null);
    }
  };

  const isRecipeInCarnet = (catalogRecipe: CatalogRecipe) => {
    const cleanTitle = catalogRecipe.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    return carnetTitlesLower.has(cleanTitle);
  };

  return (
    <div className="pb-20 min-h-screen relative bg-background">
      {/* Modals */}
      <StarterPackModal
        open={showStarterPackModal}
        onOpenChange={setShowStarterPackModal}
        onSuccess={() => switchTab("carnet")}
      />
      <AuthPromptDialog
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        title={authPromptText.title}
        description={authPromptText.description}
      />

      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-7 pb-4 px-6 md:px-8 sticky top-0 md:top-16 z-30 md:rounded-2xl md:my-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Recettes</h1>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/15 hover:bg-white/25 text-white border-0 text-xs font-medium h-9"
              onClick={() => setShowStarterPackModal(true)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-accent" />
              Starter Pack
            </Button>

            {user && (
              <Button
                size="icon"
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 w-9 shrink-0 shadow-sm"
                onClick={() => navigate("/recipes/new-method")}
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Tab Switcher: Mon Carnet vs Découvrir */}
        <div className="flex p-1 bg-black/15 rounded-xl mb-3 max-w-md">
          <button
            type="button"
            onClick={() => switchTab("carnet")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "carnet"
                ? "bg-white text-primary shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Mon carnet {user && !personalLoading && `(${personalRecipes.length})`}
          </button>

          <button
            type="button"
            onClick={() => switchTab("discover")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "discover"
                ? "bg-white text-primary shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Découvrir (108)
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === "carnet"
                  ? "Rechercher dans mon carnet..."
                  : "Rechercher parmi 108 recettes..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-background text-foreground text-sm rounded-xl border-none shadow-inner"
            />
          </div>

          <Button
            variant="secondary"
            className="shrink-0 h-10 px-3 bg-white/20 hover:bg-white/30 text-white border-0 text-xs rounded-xl"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            Filtres
          </Button>
        </div>

        {/* Quick Filters Pill Bar (Frigo Match + Budget + Themes) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 -mx-6 md:mx-0 px-6 md:px-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setOnlyCookable(!onlyCookable)}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
              onlyCookable
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            <span>🥗</span>
            <span>Cuisinable maintenant</span>
            {onlyCookable && <Check className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => setOnlyBudget(!onlyBudget)}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
              onlyBudget
                ? "bg-amber-600 text-white font-semibold shadow-xs"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            <span>💰</span>
            <span>Petit budget (&lt; 2,50 €)</span>
            {onlyBudget && <Check className="w-3 h-3" />}
          </button>

          {activeTab === "discover" &&
            THEME_FILTERS.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  <span>{theme.emoji}</span>
                  <span>{theme.label}</span>
                </button>
              );
            })}
        </div>
      </header>

      {showFilters && (
        <RecipeFilters
          category={category}
          difficulty={difficulty}
          maxTime="all"
          onlyCookable={onlyCookable}
          onlyBudget={onlyBudget}
          onCategoryChange={(val) => setCategory(val as RecipeCategory | "all")}
          onDifficultyChange={(val) => setDifficulty(val as RecipeDifficulty | "all")}
          onMaxTimeChange={() => {}}
          onOnlyCookableChange={setOnlyCookable}
          onOnlyBudgetChange={setOnlyBudget}
          onReset={handleResetFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* TAB CONTENT 1: MON CARNET */}
      {activeTab === "carnet" && (
        <section className="px-6 mt-6 pb-6">
          {personalLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden shadow-sm border-none">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {displayPersonalRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayPersonalRecipes.map((recipe, index) => (
                    <Card
                      key={recipe.id}
                      className="overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-shadow border-border/70"
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                      <div className="relative h-40">
                        <RecipeImage
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                          loading={index < 2 ? "eager" : "lazy"}
                        />

                        {/* Frigo Match Badge */}
                        {renderFrigoBadge(personalStockAnalyses.get(recipe.id)) && (
                          <div className="absolute top-3 left-3">
                            {renderFrigoBadge(personalStockAnalyses.get(recipe.id))}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) {
                              setShowAuthPrompt(true);
                              return;
                            }
                            toggleFavorite(recipe.id);
                          }}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-xs"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              recipe.is_favorited
                                ? "fill-accent text-accent"
                                : "text-accent"
                            }`}
                          />
                        </button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-base leading-snug">
                            {recipe.title}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {recipe.tags &&
                              recipe.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="flex-shrink-0 text-[10px] px-1.5 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                          </div>
                          {recipe.difficulty && (
                            <div className="flex items-center gap-1">
                              <ChefHat className="w-3.5 h-3.5" />
                              {recipe.difficulty}
                            </div>
                          )}
                          {personalCostAnalyses.get(recipe.id) && (
                            <div
                              className={`flex items-center gap-1 font-medium ${
                                personalCostAnalyses.get(recipe.id)?.isBudget
                                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>{personalCostAnalyses.get(recipe.id)?.formattedCostPerServing}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : personalRecipes.length > 0 && (onlyCookable || onlyBudget) ? (
                <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border p-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto text-amber-600">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-foreground">
                      Aucun plat correspondant à vos critères
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      {onlyBudget && onlyCookable
                        ? "Aucune recette de votre carnet n'est à la fois cuisinable et à moins de 2,50 € / portion."
                        : onlyBudget
                        ? "Aucune recette à moins de 2,50 € / portion dans votre carnet."
                        : "Aucune recette de votre carnet ne dispose de tous les ingrédients en stock actuellement."}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Désactiver les filtres
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  {/* Empty state with prominent Starter Pack Banner */}
                  <div className="bg-accent/10 border border-accent/25 rounded-2xl p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3 text-accent">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base mb-1 text-foreground">
                      Votre carnet est vide
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4 leading-relaxed">
                      Résolvez le syndrome de la page blanche en 1 clic ! Choisissez
                      votre Pack de bienvenue thématique pour charger 12 recettes
                      instantanément.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                      <Button
                        onClick={() => setShowStarterPackModal(true)}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-xs"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Choisir mon Starter Pack
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => switchTab("discover")}
                        className="text-xs"
                      >
                        <Compass className="w-4 h-4 mr-1.5" />
                        Explorer 108 recettes publiques
                      </Button>
                    </div>
                  </div>

                  {user && (
                    <div className="text-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/recipes/new-method")}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Ou créer manuellement ma propre recette
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* TAB CONTENT 2: DÉCOUVRIR (PUBLIC CATALOG) */}
      {activeTab === "discover" && (
        <section className="px-6 mt-5 pb-6">
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <span>{displayCatalogRecipes.length} recettes trouvées</span>
            <button
              type="button"
              className="text-accent font-medium hover:underline flex items-center gap-1"
              onClick={() => setShowStarterPackModal(true)}
            >
              <Sparkles className="w-3 h-3" />
              Générer un pack
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayCatalogRecipes.map((recipe, index) => {
              const inCarnet = isRecipeInCarnet(recipe);
              const isCloningThis = cloningId === recipe.id;

              return (
                <Card
                  key={recipe.id}
                  className="overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-shadow border-border/70"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  <div className="relative h-44">
                    <RecipeImage
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      loading={index < 3 ? "eager" : "lazy"}
                    />

                    {/* Frigo Match Badge */}
                    {renderFrigoBadge(catalogStockAnalyses.get(recipe.id)) && (
                      <div className="absolute top-3 left-3">
                        {renderFrigoBadge(catalogStockAnalyses.get(recipe.id))}
                      </div>
                    )}

                    {/* Clone / In-Carnet Button */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {inCarnet ? (
                        <div className="bg-primary/90 text-primary-foreground backdrop-blur-md rounded-full px-3 py-1 text-xs font-semibold shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3 text-accent" />
                          <span>Dans mon carnet</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isCloningThis}
                          onClick={(e) => handleCloneRecipe(e, recipe)}
                          className="h-8 bg-white/95 text-foreground hover:bg-white text-xs font-semibold shadow-md backdrop-blur-md border border-black/5"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1 text-accent" />
                          {isCloningThis ? "Ajout..." : "Ajouter au carnet"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-base text-foreground leading-snug">
                        {recipe.title}
                      </h3>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {recipe.prep_time + recipe.cook_time} min
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                          <ChefHat className="w-3.5 h-3.5" />
                          {recipe.difficulty}
                        </div>
                        {catalogCostAnalyses.get(recipe.id) && (
                          <div
                            className={`flex items-center gap-1 font-medium ${
                              catalogCostAnalyses.get(recipe.id)?.isBudget
                                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>{catalogCostAnalyses.get(recipe.id)?.formattedCostPerServing}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {displayCatalogRecipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm mb-3">
                {onlyCookable && onlyBudget
                  ? "Aucune recette du catalogue n'est à la fois 100% cuisinable et à moins de 2,50 € / portion."
                  : onlyBudget
                  ? "Aucune recette à moins de 2,50 € / portion ne correspond à ces critères."
                  : onlyCookable
                  ? "Aucune recette du catalogue n'est 100% cuisinable avec votre stock actuel."
                  : "Aucune recette ne correspond à ces critères."}
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Recipes;
