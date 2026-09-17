import { useState, useEffect, useMemo } from "react";
import { RecipeImage } from "@/components/RecipeImage";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Clock,
  ChefHat,
  Edit,
  Plus,
  Check,
  Sparkles,
  Loader2,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Coins,
  PiggyBank,
  Share2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useRecipes } from "@/hooks/useRecipes";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { useStock } from "@/hooks/useStock";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useRecipeJournal } from "@/hooks/useRecipeJournal";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CATALOG_RECIPES } from "@/data/recipesCatalog";
import { cloneRecipeToUser } from "@/lib/recipe-clone";
import { AuthPromptDialog } from "@/components/AuthPromptDialog";
import { MeasurementUnit, RecipeWithDetails } from "@/types/database";
import {
  analyzeRecipeStock,
  calculateRecipeDestocking,
  RecipeIngredientLike,
  DestockingResult,
} from "@/lib/stock-matching";
import { calculateRecipeCost } from "@/lib/recipe-cost";
import { AddToShoppingListModal } from "@/components/recipe/AddToShoppingListModal";
import { CookRecipeModal } from "@/components/recipe/CookRecipeModal";
import { CookingModeModal } from "@/components/recipe/CookingModeModal";
import { CookingSubstitutionsModal } from "@/components/recipe/CookingSubstitutionsModal";
import { CookingTimerWidget } from "@/components/recipe/CookingTimerWidget";
import { RecipeJournalSection } from "@/components/recipe/RecipeJournalSection";
import { PrintableRecipeSheet } from "@/components/recipe/PrintableRecipeSheet";
import { ShareRecipeModal } from "@/components/recipe/ShareRecipeModal";
import { findIngredientSubstitution } from "@/lib/ingredient-substitutions";
import { segmentTextWithDurations } from "@/lib/cooking-timer";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recipes, toggleFavorite } = useRecipes();
  const { ingredients: allIngredients } = useIngredients();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [servings, setServings] = useState(4);
  const [photos, setPhotos] = useState<string[]>([]);
  const [cloning, setCloning] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showCookModal, setShowCookModal] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [showSubstitutionsModal, setShowSubstitutionsModal] = useState(false);
  const [selectedSubSearch, setSelectedSubSearch] = useState("");
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);
  const [activeTimerLabel, setActiveTimerLabel] = useState("Minuteur");
  const [showTimerWidget, setShowTimerWidget] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { stock, updateStock } = useStock();
  const { addItems } = useShoppingList();

  // 1. Look up recipe in user's saved recipes
  const userRecipe = useRecipes().recipes.find((r) => r.id === id);

  // 2. Look up recipe in public catalog if not in personal recipes
  const catalogRecipe = useMemo(() => {
    return CATALOG_RECIPES.find((r) => r.id === id);
  }, [id]);

  // Check if this catalog recipe is already cloned into user's personal recipes
  const clonedPersonalRecipe = useMemo(() => {
    if (!catalogRecipe) return null;
    const cleanCatalogTitle = catalogRecipe.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    return recipes.find(
      (r) =>
        r.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim() === cleanCatalogTitle
    );
  }, [catalogRecipe, recipes]);

  // Active recipe to display
  const recipe: RecipeWithDetails | null = useMemo(() => {
    if (userRecipe) return userRecipe;
    if (catalogRecipe) {
      return {
        id: catalogRecipe.id,
        user_id: "",
        title: catalogRecipe.title,
        description: catalogRecipe.description,
        image_url: catalogRecipe.image_url,
        difficulty: catalogRecipe.difficulty,
        prep_time: catalogRecipe.prep_time,
        cook_time: catalogRecipe.cook_time,
        servings: catalogRecipe.servings,
        category: catalogRecipe.category,
        tags: catalogRecipe.tags,
        source: catalogRecipe.source,
        instructions: catalogRecipe.instructions,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_favorited: !!clonedPersonalRecipe?.is_favorited,
        ingredients: catalogRecipe.ingredients.map((ing, idx) => ({
          id: `ing-${idx}`,
          quantity: ing.quantity,
          unit: ing.unit,
          name: ing.name,
          ingredient: {
            id: `ing-ref-${idx}`,
            name: ing.name,
            category: ing.category || "epicerie_salee",
            image_url: null,
            created_at: new Date().toISOString(),
          },
        })),
      };
    }
    return null;
  }, [userRecipe, catalogRecipe, clonedPersonalRecipe]);

  const { notes: personalNotes, cookedCount, incrementCooked } = useRecipeJournal(recipe?.id || id);

  useEffect(() => {
    if (recipe?.servings) {
      setServings(recipe.servings);
    }

    // Fetch user photos if from database
    const fetchPhotos = async () => {
      if (!id || !userRecipe) return;
      const { data } = await supabase
        .from("recipe_photos")
        .select("url")
        .eq("recipe_id", id);

      if (data) {
        setPhotos(data.map((p) => p.url));
      }
    };

    fetchPhotos();
  }, [recipe, id, userRecipe]);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <p className="text-muted-foreground mb-4">Recette introuvable.</p>
        <Button onClick={() => navigate("/recipes")}>Retour aux recettes</Button>
      </div>
    );
  }

  const isOwner = user && userRecipe && userRecipe.user_id === user.id;
  const isCatalog = !userRecipe && !!catalogRecipe;
  const alreadyInCarnet = !!clonedPersonalRecipe;

  const handleClone = async () => {
    if (!catalogRecipe) return;

    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    setCloning(true);
    try {
      const newId = await cloneRecipeToUser(catalogRecipe, user.id, allIngredients);
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({
        title: "Recette ajoutée ! 🍳",
        description: `"${catalogRecipe.title}" a été enregistrée dans votre carnet.`,
      });
      navigate(`/recipe/${newId}`, { replace: true });
    } catch (err) {
      console.error("Clone error:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la recette à votre carnet.",
        variant: "destructive",
      });
    } finally {
      setCloning(false);
    }
  };

  const handleFavoriteClick = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    if (userRecipe) {
      toggleFavorite(userRecipe.id);
    } else if (clonedPersonalRecipe) {
      toggleFavorite(clonedPersonalRecipe.id);
    } else if (catalogRecipe) {
      // Prompt user to add to notebook first
      handleClone();
    }
  };

  const initialServings = recipe.servings || 4;
  const servingsScale = servings / initialServings;

  const stockAnalysis = useMemo(() => {
    if (!recipe.ingredients) return null;
    return analyzeRecipeStock(recipe.ingredients as RecipeIngredientLike[], stock, servingsScale);
  }, [recipe.ingredients, stock, servingsScale]);

  const destockingResult = useMemo(() => {
    if (!recipe.ingredients) return null;
    return calculateRecipeDestocking(recipe.ingredients as RecipeIngredientLike[], stock, servingsScale);
  }, [recipe.ingredients, stock, servingsScale]);

  const costAnalysis = useMemo(() => {
    if (!recipe) return null;
    return calculateRecipeCost({
      servings,
      tags: recipe.tags,
      category: recipe.category,
      ingredients: recipe.ingredients?.map((i) => ({
        name: i.name,
        quantity: i.quantity * servingsScale,
        unit: i.unit,
        category: i.ingredient?.category,
      })),
    });
  }, [recipe, servings, servingsScale]);

  const handleOpenShoppingModal = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    setShowShoppingModal(true);
  };

  const handleConfirmAddToShoppingList = async (
    itemsToAdd: Array<{
      name: string;
      quantity: number | null;
      unit: MeasurementUnit | null;
      ingredient_id?: string | null;
    }>
  ) => {
    const { error } = await addItems(itemsToAdd);
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les articles à la liste de courses.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ajouté à la liste de courses ! 🛒",
        description: `${itemsToAdd.length} ingrédient${itemsToAdd.length > 1 ? "s" : ""} ajouté${itemsToAdd.length > 1 ? "s" : ""}.`,
      });
    }
  };

  const handleOpenCookModal = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    setShowCookModal(true);
  };

  const handleConfirmDestock = async () => {
    if (!destockingResult) return;

    for (const deduction of destockingResult.deductions) {
      await updateStock(deduction.stockId, {
        quantity: deduction.newQuantity,
        low_stock: deduction.isLowStock,
      });
    }

    await incrementCooked();

    toast({
      title: "Bon appétit ! 🍳",
      description: "Ingrédients déduits et réalisation enregistrée dans votre journal !",
    });
  };

  const handleAddDepletedToShoppingList = async (
    items: DestockingResult["depletedOrLowStockItems"]
  ) => {
    const rows = items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      ingredient_id: i.ingredientId,
    }));
    await addItems(rows);
    toast({
      title: "Liste de courses mise à jour ! 🛒",
      description: `${items.length} ingrédient${items.length > 1 ? "s" : ""} épuisé${items.length > 1 ? "s" : ""} ajouté${items.length > 1 ? "s" : ""} à vos courses.`,
    });
  };

  return (
    <>
      <PrintableRecipeSheet
        recipe={recipe}
        servings={servings}
        personalNotes={personalNotes}
      />

      <div className="pb-24 min-h-screen bg-background print:hidden">
        <AuthPromptDialog
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          title="Ajoutez cette recette à votre carnet"
          description="Créez votre compte gratuit en 10 secondes pour sauvegarder cette recette, planifier vos portions et gérer vos courses."
        />

        {/* Image Header */}
        <div className="relative h-72 w-full bg-muted">
          <RecipeImage
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20 pointer-events-none" />

          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 w-11 h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Top Right Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md text-foreground"
              onClick={() => setShowCookingMode(true)}
              title="Mode Cuisine (Mains-libres)"
            >
              <ChefHat className="w-5 h-5 text-accent" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md text-foreground"
              onClick={() => setShowShareModal(true)}
              title="Partager la recette (Lien & QR Code)"
            >
              <Share2 className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md text-foreground"
              onClick={() => window.print()}
              title="Imprimer la recette / Export PDF"
            >
              <Printer className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md"
              onClick={handleFavoriteClick}
            >
              <Heart
                className={`w-5 h-5 ${
                  recipe.is_favorited
                    ? "fill-accent text-accent"
                    : "text-accent"
                }`}
              />
            </Button>

            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-md"
                onClick={() => navigate(`/recipes/edit/${id}`)}
              >
                <Edit className="w-5 h-5 text-foreground" />
              </Button>
            )}
          </div>

        {/* Recipe Title & Badges Overlay */}
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {recipe.tags &&
              recipe.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-accent text-accent-foreground text-xs shadow-xs"
                >
                  {tag}
                </Badge>
              ))}

            {cookedCount > 0 && (
              <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-xs shadow-xs font-semibold flex items-center gap-1 border-0">
                <ChefHat className="w-3 h-3" />
                <span>Cuisiné {cookedCount} fois</span>
              </Badge>
            )}

            {costAnalysis?.isBudget && (
              <Badge className="bg-emerald-600 text-white text-xs shadow-xs flex items-center gap-1 border-0">
                <PiggyBank className="w-3 h-3" />
                <span>Petit budget (&lt; 2,50 €)</span>
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            {recipe.title}
          </h1>

          <div className="flex items-center gap-4 text-white/90 text-xs font-medium flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
            </div>
            {recipe.difficulty && (
              <div className="flex items-center gap-1 capitalize">
                <ChefHat className="w-3.5 h-3.5" />
                {recipe.difficulty}
              </div>
            )}
            {costAnalysis && (
              <div className="flex items-center gap-1 text-emerald-300 font-semibold" title="Prix indicatif par part">
                <Coins className="w-3.5 h-3.5" />
                <span>{costAnalysis.formattedCostPerServing}</span>
                <span className="text-white/60 font-normal">({costAnalysis.formattedTotalCost})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Catalog 1-Click Clone Bar */}
      {isCatalog && (
        <div className="px-6 pt-4">
          <div className="p-3 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">
                {alreadyInCarnet
                  ? "Cette recette est déjà dans votre carnet !"
                  : "Recette officielle de la bibliothèque"}
              </span>
            </div>

            {alreadyInCarnet ? (
              <Button
                size="sm"
                variant="secondary"
                disabled
                className="h-8 text-xs font-semibold shrink-0"
              >
                <Check className="w-3.5 h-3.5 mr-1 text-accent" />
                Dans mon carnet
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={cloning}
                onClick={handleClone}
                className="h-8 text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 shadow-xs"
              >
                {cloning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Plus className="w-3.5 h-3.5 mr-1" />
                )}
                Ajouter à mon carnet
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {recipe.description && (
        <section className="px-6 mt-4">
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{recipe.description}"
          </p>
        </section>
      )}

      {/* Ingredients Section */}
      <section className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Ingrédients</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSubSearch("");
                setShowSubstitutionsModal(true);
              }}
              className="h-7 px-2 text-[11px] font-medium rounded-full bg-background border-border/70 text-muted-foreground hover:text-foreground"
              title="Aide aux substitutions d'ingrédients"
            >
              <Sparkles className="w-3 h-3 mr-1 text-accent" />
              Substitutions
            </Button>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-full px-2 py-1 border border-border/50">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted font-bold text-sm"
              aria-label="Diminuer les portions"
            >
              -
            </button>
            <span className="text-xs font-semibold min-w-[65px] text-center">
              {servings} portions
            </span>
            <button
              onClick={() => setServings(servings + 1)}
              className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted font-bold text-sm"
              aria-label="Augmenter les portions"
            >
              +
            </button>
          </div>
        </div>

        {/* Frigo Match status banner */}
        {stockAnalysis && (
          <div className="mb-3 p-3 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {stockAnalysis.isCookable ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {stockAnalysis.isCookable
                    ? "Prêt à cuisiner ! (100% en stock)"
                    : `Frigo Match : ${stockAnalysis.availableCount}/${stockAnalysis.totalCount} en stock (${stockAnalysis.matchPercentage}%)`}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {stockAnalysis.missingCount === 0
                    ? "Tous les ingrédients sont disponibles"
                    : `${stockAnalysis.missingCount} ingrédient${stockAnalysis.missingCount > 1 ? "s" : ""} manquant${stockAnalysis.missingCount > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/planning')}
                className="h-8 text-xs font-medium bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border-border/80"
              >
                <CalendarDays className="w-3.5 h-3.5 mr-1" />
                Planifier
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenShoppingModal}
                className="h-8 text-xs font-medium bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border-border/80"
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                {stockAnalysis.missingCount > 0
                  ? `Courses (${stockAnalysis.missingCount})`
                  : "Courses"}
              </Button>
            </div>
          </div>
        )}

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <ul className="space-y-3">
              {recipe.ingredients?.map((ing, index) => {
                const initialServings = recipe.servings || 4;
                const scale = servings / initialServings;
                const quantity = ing.quantity ? ing.quantity * scale : null;
                const formattedQuantity = quantity
                  ? Number(quantity.toFixed(1)).toString()
                  : "";

                const status = stockAnalysis?.statuses.find((s) => s.name === ing.name);
                const sub = status && !status.isAvailable ? findIngredientSubstitution(ing.name) : null;

                return (
                  <li key={index} className="py-1">
                    <div className="flex items-center justify-between gap-3 text-sm py-0.5">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                        <span className="font-medium truncate">
                          {formattedQuantity}{" "}
                          {ing.unit !== "piece" && ing.unit}{" "}
                          <span className="text-muted-foreground font-normal">
                            {ing.name}
                          </span>
                        </span>
                      </div>

                      {status && (
                        <div className="shrink-0">
                          {status.isAvailable ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30 flex items-center gap-1 font-medium"
                            >
                              <Check className="w-2.5 h-2.5" />
                              <span>En stock ({status.stockQuantity} {status.stockUnit !== "piece" ? status.stockUnit : ""})</span>
                            </Badge>
                          ) : status.stockItem ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30 font-medium"
                            >
                              Manque {status.missingQuantity} {status.unit !== "piece" ? status.unit : ""}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground border-border/60"
                            >
                              Non en stock
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {sub && (
                      <div className="mt-1 ml-5 text-xs bg-amber-500/10 border border-amber-500/25 rounded-xl p-2 flex items-center justify-between gap-2 text-amber-800 dark:text-amber-200">
                        <span className="truncate text-[11px]">
                          💡 {sub.quickHint}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubSearch(sub.canonicalName);
                            setShowSubstitutionsModal(true);
                          }}
                          className="text-[11px] font-bold underline shrink-0 hover:text-accent"
                        >
                          Équivalences
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Preparation Steps */}
      {recipe.instructions && (
        <section className="px-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Étapes de préparation</h2>
            <Button
              size="sm"
              onClick={() => setShowCookingMode(true)}
              className="h-8 text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
            >
              <ChefHat className="w-3.5 h-3.5 mr-1.5" />
              Mode Cuisine
            </Button>
          </div>
          <Card className="border-border/70 shadow-xs">
            <CardContent className="p-4">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {segmentTextWithDurations(recipe.instructions).map((seg, idx) => {
                  if (seg.type === "duration" && seg.seconds) {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveTimerSeconds(seg.seconds!);
                          setActiveTimerLabel(seg.label || "Minuteur");
                          setShowTimerWidget(true);
                        }}
                        className="inline-flex items-center gap-1 font-semibold text-accent bg-accent/15 hover:bg-accent/25 px-2 py-0.5 rounded-lg text-xs mx-1 border border-accent/30 shadow-2xs transition-all align-baseline cursor-pointer"
                        title="Démarrer ce minuteur"
                      >
                        <Clock className="w-3 h-3 text-accent" />
                        {seg.content}
                      </button>
                    );
                  }
                  return <span key={idx}>{seg.content}</span>;
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Photos Section */}
      {photos.length > 0 && (
        <section className="px-6 mt-6">
          <h2 className="text-lg font-bold mb-3">Photos de préparation</h2>
          <div className="flex flex-col gap-4">
            {photos.map((url, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border bg-muted">
                <img
                  src={url}
                  alt={`Photo originale ${idx + 1}`}
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Journal de Cuisine & Notes Personnelles */}
      <RecipeJournalSection
        recipeId={recipe.id}
        recipeTitle={recipe.title}
      />

      {/* Section Déstockage : J'ai cuisiné ce plat */}
      <section className="px-6 mt-8">
        <Card className="bg-primary/5 border-primary/20 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Vous préparez ce plat ?</h3>
                <p className="text-xs text-muted-foreground">
                  Cuisinez les mains-libres ou déduisez automatiquement les ingrédients ({servings} portions) de votre stock.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowCookingMode(true)}
                variant="outline"
                className="flex-1 sm:flex-initial text-xs h-9 font-semibold border-primary/30 hover:bg-primary/10"
              >
                <ChefHat className="w-4 h-4 mr-1.5 text-primary" />
                Mode Cuisine
              </Button>
              <Button
                onClick={handleOpenCookModal}
                className="flex-1 sm:flex-initial bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs h-9 shadow-xs shrink-0"
              >
                <Check className="w-4 h-4 mr-1.5" />
                J'ai cuisiné
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Floating Timer Widget on RecipeDetail page */}
      {showTimerWidget && (
        <div className="fixed bottom-20 right-4 z-40 max-w-xs w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <CookingTimerWidget
            initialSeconds={activeTimerSeconds}
            label={activeTimerLabel}
            onClose={() => setShowTimerWidget(false)}
          />
        </div>
      )}

      {/* Fullscreen Hands-Free Cooking Mode */}
      <CookingModeModal
        open={showCookingMode}
        onClose={() => setShowCookingMode(false)}
        recipe={recipe}
        servings={servings}
        onFinishCook={() => {
          setShowCookingMode(false);
          handleOpenCookModal();
        }}
      />

      {/* Contextual Substitutions Modal */}
      <CookingSubstitutionsModal
        open={showSubstitutionsModal}
        onOpenChange={setShowSubstitutionsModal}
        recipeIngredients={recipe.ingredients || []}
        initialSearch={selectedSubSearch}
      />

      {/* Modals for Shopping List & Cook Destocking */}
      {stockAnalysis && (
        <AddToShoppingListModal
          open={showShoppingModal}
          onOpenChange={setShowShoppingModal}
          recipeTitle={recipe.title}
          servings={servings}
          statuses={stockAnalysis.statuses}
          onConfirm={handleConfirmAddToShoppingList}
        />
      )}

      {destockingResult && (
        <CookRecipeModal
          open={showCookModal}
          onOpenChange={setShowCookModal}
          recipeTitle={recipe.title}
          servings={servings}
          destockingResult={destockingResult}
          onConfirmDestock={handleConfirmDestock}
          onAddToShoppingList={handleAddDepletedToShoppingList}
        />
      )}

      {/* Share Modal with QR code and link */}
      <ShareRecipeModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        recipe={recipe}
        onPrint={() => window.print()}
      />
    </div>
  </>
);
};

export default RecipeDetail;
