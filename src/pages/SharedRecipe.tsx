import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CATALOG_RECIPES } from "@/data/recipesCatalog";
import { RecipeWithDetails, MeasurementUnit } from "@/types/database";
import { RecipeImage } from "@/components/RecipeImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { parseRecipeSteps } from "@/lib/recipe-step-parser";
import { PrintableRecipeSheet } from "@/components/recipe/PrintableRecipeSheet";
import { ShareRecipeModal } from "@/components/recipe/ShareRecipeModal";
import {
  Clock,
  ChefHat,
  Share2,
  Printer,
  Sparkles,
  ArrowRight,
  Loader2,
  BookOpen,
} from "lucide-react";

const SharedRecipe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(4);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Identifiant de recette manquant");
      setLoading(false);
      return;
    }

    // 1. Check if it's a catalog recipe
    const catRecipe = CATALOG_RECIPES.find((r) => r.id === id);
    if (catRecipe) {
      const formatted: RecipeWithDetails = {
        id: catRecipe.id,
        user_id: "",
        title: catRecipe.title,
        description: catRecipe.description,
        image_url: catRecipe.image_url,
        difficulty: catRecipe.difficulty,
        prep_time: catRecipe.prep_time,
        cook_time: catRecipe.cook_time,
        servings: catRecipe.servings,
        category: catRecipe.category,
        tags: catRecipe.tags,
        source: catRecipe.source,
        instructions: catRecipe.instructions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ingredients: catRecipe.ingredients.map((ing, idx) => ({
          id: `shared-cat-${idx}`,
          quantity: ing.quantity,
          unit: ing.unit,
          name: ing.name,
          ingredient: {
            id: `ing-${idx}`,
            name: ing.name,
            category: ing.category || "autre",
            image_url: null,
            created_at: new Date().toISOString(),
          },
        })),
      };
      setRecipe(formatted);
      if (formatted.servings) setServings(formatted.servings);
      setLoading(false);
      return;
    }

    // 2. Fetch from Supabase via get_shared_recipe RPC or recipes table
    const fetchSharedRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try RPC first
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "get_shared_recipe",
          { p_recipe_id: id }
        );

        if (!rpcError && rpcData && typeof rpcData === "object" && "title" in rpcData) {
          const raw = rpcData as any;
          const formatted: RecipeWithDetails = {
            id: raw.id,
            user_id: "",
            title: raw.title,
            description: raw.description,
            image_url: raw.image_url,
            difficulty: raw.difficulty,
            prep_time: raw.prep_time,
            cook_time: raw.cook_time,
            servings: raw.servings,
            category: raw.category,
            tags: raw.tags,
            source: raw.source,
            instructions: raw.instructions,
            created_at: raw.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ingredients: (raw.ingredients || []).map((ing: any, idx: number) => ({
              id: ing.id || `shared-ing-${idx}`,
              quantity: ing.quantity,
              unit: ing.unit as MeasurementUnit,
              name: ing.name,
              ingredient: {
                id: ing.id || `ing-${idx}`,
                name: ing.name,
                category: "autre",
                image_url: null,
                created_at: new Date().toISOString(),
              },
            })),
          };
          setRecipe(formatted);
          if (formatted.servings) setServings(formatted.servings);
          setLoading(false);
          return;
        }

        // Fallback: direct table query
        const { data: dbRecipe, error: dbError } = await supabase
          .from("recipes")
          .select(`
            *,
            ingredients:recipe_ingredients(*)
          `)
          .eq("id", id)
          .maybeSingle();

        if (dbError) throw dbError;
        if (!dbRecipe) {
          throw new Error("Recette introuvable");
        }

        const formatted: RecipeWithDetails = {
          ...dbRecipe,
          ingredients: ((dbRecipe as any).ingredients || []).map((ing: any) => ({
            id: ing.id,
            quantity: ing.quantity,
            unit: ing.unit,
            name: ing.name,
            ingredient: {
              id: ing.ingredient_id || ing.id,
              name: ing.name,
              category: "autre",
              image_url: null,
              created_at: new Date().toISOString(),
            },
          })),
        };
        setRecipe(formatted);
        if (formatted.servings) setServings(formatted.servings);
      } catch (err: any) {
        console.error("Failed to load shared recipe:", err);
        setError("Cette recette n'est pas disponible ou le lien est invalide.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedRecipe();
  }, [id]);

  const initialServings = recipe?.servings || 4;
  const servingsScale = servings / initialServings;

  const steps = useMemo(() => {
    return parseRecipeSteps(recipe?.instructions || "");
  }, [recipe?.instructions]);

  const toggleCheck = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
        <p className="text-sm text-muted-foreground">Chargement de la recette...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          <BookOpen className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Recette indisponible</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error || "Nous n'avons pas pu trouver cette recette."}
        </p>
        <Button onClick={() => navigate("/")} className="bg-accent text-accent-foreground">
          Découvrir les recettes
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Printable clean sheet (only visible on print) */}
      <PrintableRecipeSheet
        recipe={recipe}
        servings={servings}
        shareUrl={window.location.href}
      />

      {/* Main Public Web Page (hidden on print) */}
      <div className="print:hidden min-h-screen pb-20 bg-background text-foreground">
        {/* Public Top Navbar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/70 px-4 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground font-serif font-bold text-base hover:opacity-90">
            <span className="w-7 h-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-sans text-sm font-black">
              À
            </span>
            <span>À la carte</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted"
              title="Imprimer ou exporter en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer / PDF</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="h-8 text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager</span>
            </Button>
          </div>
        </header>

        {/* Recipe Image & Overlay */}
        <div className="relative h-64 sm:h-80 w-full bg-muted">
          <RecipeImage
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 pointer-events-none" />

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {recipe.tags &&
                recipe.tags.map((tag) => (
                  <Badge key={tag} className="bg-accent text-accent-foreground text-xs shadow-xs">
                    {tag}
                  </Badge>
                ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold leading-tight font-serif mb-2 text-white">
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
            </div>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <section className="px-6 mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{recipe.description}"
            </p>
          </section>
        )}

        {/* Ingredients section with dynamic servings */}
        <section className="px-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold">Ingrédients</h2>
              <p className="text-[11px] text-muted-foreground">Cochez au fur et à mesure</p>
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

          <Card className="border-border/70 shadow-xs">
            <CardContent className="p-4">
              <ul className="space-y-2.5">
                {recipe.ingredients?.map((ing, index) => {
                  const quantity = ing.quantity ? ing.quantity * servingsScale : null;
                  const formattedQuantity = quantity
                    ? Number(quantity.toFixed(1)).toString()
                    : "";
                  const isChecked = checkedIngredients.has(index);

                  return (
                    <li
                      key={index}
                      onClick={() => toggleCheck(index)}
                      className={`flex items-center gap-3 text-sm py-1 cursor-pointer select-none transition-opacity ${
                        isChecked ? "opacity-50 line-through" : ""
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCheck(index)}
                        className="rounded-xs"
                      />
                      <span className="font-medium">
                        {formattedQuantity}{" "}
                        {ing.unit !== "piece" && ing.unit}{" "}
                        <span className="text-muted-foreground font-normal">
                          {ing.name}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Preparation steps */}
        {recipe.instructions && (
          <section className="px-6 mt-6">
            <h2 className="text-lg font-bold mb-3">Étapes de préparation</h2>
            <Card className="border-border/70 shadow-xs">
              <CardContent className="p-4">
                <ol className="space-y-4 text-sm leading-relaxed">
                  {steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 whitespace-pre-wrap">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Call-to-action banner for unauthenticated guests */}
        <section className="px-6 mt-8">
          <div className="p-5 rounded-2xl bg-primary text-primary-foreground flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-accent-foreground/90">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Cuisinez malin avec À la carte</span>
              </div>
              <h3 className="font-serif font-bold text-base">
                Vous avez aimé cette recette ?
              </h3>
              <p className="text-xs text-primary-foreground/80 max-w-sm">
                Créez votre carnet, scannez votre frigo, planifiez vos repas de la semaine et générez vos listes de courses automatiques.
              </p>
            </div>

            <Button
              onClick={() => navigate("/auth", { state: { isSignup: true } })}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 text-xs font-semibold h-10 px-4 shadow-sm"
            >
              Rejoindre gratuitement <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </section>

        {/* Share modal */}
        <ShareRecipeModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          recipe={recipe}
          onPrint={handlePrint}
        />
      </div>
    </>
  );
};

export default SharedRecipe;
