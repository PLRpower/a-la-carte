import { useEffect, useState, useMemo } from "react";
import { RecipeImage } from "@/components/RecipeImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Sparkles, Book, GraduationCap, Globe, Lightbulb, Save, RefreshCw, Coffee, Utensils, IceCream, Apple, Heart, ArrowRight, Salad, Camera, Carrot, Users, Plus, ShoppingCart, CalendarDays, Flame, AlertTriangle, Coins, PiggyBank, User } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRecipes } from "@/hooks/useRecipes";
import { useStock } from "@/hooks/useStock";
import { useFamily } from "@/hooks/useFamily";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecipeWithDetails } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { parseIngredientInput, findBestIngredientMatch } from "@/lib/ingredient-parser";
import { useIngredients } from "@/hooks/useIngredients";
import { CATALOG_RECIPES } from "@/data/recipesCatalog";
import { StarterPackModal } from "@/components/StarterPackModal";
import { calculateRecipeCost } from "@/lib/recipe-cost";
import { getExpiringStockItems } from "@/lib/expiration-tracker";


const HomeSkeleton = () => (
  <div className="px-6 space-y-8 animate-pulse">
    <div className="space-y-3">
      <div className="h-6 w-1/3 bg-muted rounded" />
      <div className="h-4 w-2/3 bg-muted rounded" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
    </div>
    <div className="h-40 bg-muted rounded-xl" />
    <div className="space-y-3">
      <div className="h-6 w-1/4 bg-muted rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-muted rounded-xl" />)}
      </div>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { recipes, allRecipes, loading: recipesLoading, refetch: refetchRecipes } = useRecipes();
  const { stock, loading: stockLoading } = useStock();
  const { profile, loading: profileLoading } = useProfile();
  const { joinFamily } = useFamily();
  const { ingredients: allIngredients } = useIngredients();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('family_code');
    if (code) {
      joinFamily(code);
      window.history.replaceState({}, '', '/');
    }
  }, [location.search, joinFamily]);

  const urgentStock = useMemo(() => getExpiringStockItems(stock, 48), [stock]);
  const [prioritizeAntiGaspi, setPrioritizeAntiGaspi] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (location.state && (location.state as any).autoChefGaspi) {
      setPrioritizeAntiGaspi(true);
      setShowAIOptions(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [suggestedRecipe, setSuggestedRecipe] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [showStarterPackModal, setShowStarterPackModal] = useState(false);

  const [creativity, setCreativity] = useState("original");
  const [mealType, setMealType] = useState("any");
  const [focus, setFocus] = useState("use_stock");

  const featuredRecipe = allRecipes?.[0] || (CATALOG_RECIPES.length > 0 ? (CATALOG_RECIPES[0] as unknown as RecipeWithDetails) : null);
  const quickRecipes = allRecipes?.filter(r =>
    (r.prep_time || 0) + (r.cook_time || 0) <= 60 && r.difficulty === 'facile'
  ).slice(0, 4);

  const featuredCost = useMemo(() => {
    if (!featuredRecipe) return null;
    return calculateRecipeCost(featuredRecipe);
  }, [featuredRecipe]);

  const suggestedCost = useMemo(() => {
    if (!suggestedRecipe) return null;
    return calculateRecipeCost({
      servings: suggestedRecipe.servings || 2,
      category: suggestedRecipe.category,
      ingredients: suggestedRecipe.ingredients,
    });
  }, [suggestedRecipe]);

  const handleGenerateClick = () => {
    if (!user) {
      navigate("/auth?mode=signup", { state: { isSignup: true } });
      return;
    }
    setShowAIOptions(true);
  };

  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const generateAISuggestion = async () => {
    setShowAIOptions(false);
    setLoadingAI(true);
    const currentHistory = [...generatedTitles];
    if (suggestedRecipe?.title && !currentHistory.includes(suggestedRecipe.title)) {
      currentHistory.push(suggestedRecipe.title);
      setGeneratedTitles(currentHistory);
    }
    setSuggestedRecipe(null);

    const expiringPayload = prioritizeAntiGaspi && urgentStock.length > 0
      ? urgentStock.map((s) => ({
          name: s.ingredient?.name,
          quantity: s.quantity,
          unit: s.unit,
          expiration_date: s.expiration_date,
        }))
      : [];

    try {
      const { data, error } = await supabase.functions.invoke('suggest-recipe', {
        body: {
          ingredients: stock.map(s => ({
            name: s.ingredient?.name,
            quantity: s.quantity,
            unit: s.unit
          })),
          expiringIngredients: expiringPayload,
          preferences: { creativity, mealType, focus },
          avoidRecipes: currentHistory
        }
      });
      if (error) throw error;
      if (data?.error) {
        if (data.details) console.warn('AI suggestion details:', data.details);
        throw new Error(data.error);
      }
      setSuggestedRecipe(data.recipe);
      toast({ title: "Recette générée !", description: "Voici une suggestion basée sur vos préférences." });
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      console.error('AI suggestion error:', error);
      toast({ title: "Erreur", description: error.message || "Impossible de générer une recette.", variant: "destructive" });
    } finally {
      setLoadingAI(false);
    }
  };

  const saveSuggestedRecipe = async () => {
    if (!suggestedRecipe || !user) return;
    setSavingRecipe(true);
    try {
      const { data: recipe, error: recipeError } = await supabase.from('recipes').insert([{
        user_id: user.id,
        title: suggestedRecipe.title,
        description: suggestedRecipe.description,
        difficulty: suggestedRecipe.difficulty || 'moyen',
        prep_time: suggestedRecipe.prep_time || 15,
        cook_time: suggestedRecipe.cook_time || 15,
        servings: suggestedRecipe.servings || 2,
        category: (suggestedRecipe.category || 'diner') as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
        tags: [suggestedRecipe.category || 'diner'],
        instructions: suggestedRecipe.instructions,
        source: 'website',
        is_shared_with_family: false,
        is_public: false
      }]).select().single();

      if (recipeError) throw recipeError;

      if (suggestedRecipe.ingredients && Array.isArray(suggestedRecipe.ingredients)) {
        for (const ing of suggestedRecipe.ingredients) {
          let ingredientId: string | null = null;
          const match = findBestIngredientMatch(ing.name, allIngredients);
          if (match) ingredientId = match.id;
          await supabase.from('recipe_ingredients').insert({
            recipe_id: recipe.id,
            ingredient_id: ingredientId,
            name: ing.name,
            quantity: typeof ing.quantity === 'number' ? ing.quantity : 1,
            unit: ing.unit || 'piece'
          });
        }
      }
      toast({ title: "Recette sauvegardée !", description: "Elle est maintenant dans votre carnet." });
      await refetchRecipes();
      navigate(`/recipe/${recipe.id}`);
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      console.error("Save error:", error);
      toast({ title: "Erreur de sauvegarde", description: "Impossible de sauvegarder la recette.", variant: "destructive" });
    } finally {
      setSavingRecipe(false);
    }
  };

  const isLoading = (recipesLoading || stockLoading || profileLoading) && recipes.length === 0;

  return (
    <div className="pb-20 md:pb-12 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-8 px-6 md:px-8 mb-6 md:my-6 md:rounded-2xl flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <img src="/logo-transparent.png" alt="Logo" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-3xl font-bold mb-1">À la carte</h1>
            <p className="text-sm opacity-90">Cuisinez, gérez, savourez</p>
          </div>
        </div>
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold shadow-xs"
            onClick={() => navigate('/recipes/new-method')}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvelle recette
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/15 hover:bg-white/25 text-white border-0 text-xs"
            onClick={() => navigate('/stock/add')}
          >
            <Carrot className="w-4 h-4 mr-1.5" />
            Ajouter ingrédient
          </Button>
        </div>

        {/* Mobile: Profil header */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to={user ? "/profile" : "/auth?mode=signup"}
            state={user ? undefined : { isSignup: true }}
            className="flex items-center p-0.5 rounded-full hover:bg-white/10 active:scale-95 transition-transform"
            title={user ? "Mon profil" : "Créer un compte"}
          >
            <Avatar className="w-10 h-10 border-2 border-white/30 shadow-xs">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Profil" />
              ) : (
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                  {profile?.first_name?.[0] ||
                    profile?.last_name?.[0] ||
                    user?.email?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
        </div>
      </header>

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <>
          <section className="px-6 mb-8">
            {recipes.length === 0 && stock.length === 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-lg font-medium text-foreground mb-1">
                    👋 Bienvenue {profile?.first_name ? profile.first_name : ""} !
                  </p>
                  <p className="text-sm text-muted-foreground">Prêt à transformer vos repas ? Voici par où commencer.</p>
                </div>

                {/* Starter Pack banner */}
                <div className="mb-6 p-4 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 text-accent">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Pack de bienvenue</div>
                      <div className="text-[11px] text-muted-foreground">Activez 12 recettes en 1 clic</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold shrink-0"
                    onClick={() => setShowStarterPackModal(true)}
                  >
                    Choisir mon pack
                  </Button>
                </div>

                <h2 className="text-xl font-semibold mb-3">Vos premiers pas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  <button onClick={() => navigate('/stock/add')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors border border-accent/20 text-center">
                    <div className="p-3 bg-white rounded-full shadow-sm text-primary shrink-0"><Carrot className="w-6 h-6" /></div>
                    <div>
                      <div className="font-semibold text-sm mb-0.5 leading-tight">Remplir mon frigo</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2">Ajoutez vos ingrédients</div>
                    </div>
                  </button>
                  <button onClick={() => navigate('/recipes/new-method')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors border border-accent/20 text-center">
                    <div className="p-3 bg-white rounded-full shadow-sm text-primary shrink-0"><ChefHat className="w-6 h-6" /></div>
                    <div>
                      <div className="font-semibold text-sm mb-0.5 leading-tight">Première recette</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2">Créez vos idées</div>
                    </div>
                  </button>
                  <button onClick={() => navigate('/family')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors border border-accent/20 text-center">
                    <div className="p-3 bg-white rounded-full shadow-sm text-primary shrink-0"><Users className="w-6 h-6" /></div>
                    <div>
                      <div className="font-semibold text-sm mb-0.5 leading-tight">Ma famille</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2">Collaborez à plusieurs</div>
                    </div>
                  </button>
                  <button onClick={() => navigate('/shopping-list')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors border border-accent/20 text-center">
                    <div className="p-3 bg-white rounded-full shadow-sm text-primary shrink-0"><ShoppingCart className="w-6 h-6" /></div>
                    <div>
                      <div className="font-semibold text-sm mb-0.5 leading-tight">Liste de courses</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2">Rien n'est oublié</div>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-3">Parcourir</h2>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => navigate('/recipes?category=dejeuner,diner')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
                    <div className="p-2 bg-white rounded-full shadow-sm text-primary"><Utensils className="w-5 h-5" /></div>
                    <span className="text-[10px] font-medium text-center">Plats</span>
                  </button>
                  <button onClick={() => navigate('/recipes?category=dessert')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
                    <div className="p-2 bg-white rounded-full shadow-sm text-primary"><IceCream className="w-5 h-5" /></div>
                    <span className="text-[10px] font-medium text-center">Desserts</span>
                  </button>
                  <button onClick={() => navigate('/recipes?category=encas')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
                    <div className="p-2 bg-white rounded-full shadow-sm text-primary"><Apple className="w-5 h-5" /></div>
                    <span className="text-[10px] font-medium text-center">En-cas</span>
                  </button>
                  <button onClick={() => navigate('/recipes?category=vegetarien')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
                    <div className="p-2 bg-white rounded-full shadow-sm text-primary"><Salad className="w-5 h-5" /></div>
                    <span className="text-[10px] font-medium text-center">Végé</span>
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Anti-Gaspi Alert Banner (< 48h) */}
          {urgentStock.length > 0 && (
            <section className="px-6 mb-6">
              <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/20 shrink-0">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm">Anti-Gaspillage Proactif</h3>
                        <Badge className="bg-white/25 text-white border-0 text-[10px] px-1.5 py-0 font-medium">
                          DLC &lt; 48h
                        </Badge>
                      </div>
                      <p className="text-xs text-white/90 mb-3 leading-relaxed">
                        <span className="font-semibold">{urgentStock.length} ingrédient{urgentStock.length > 1 ? "s" : ""}</span> à consommer d'urgence :{" "}
                        {urgentStock.map((s) => s.ingredient?.name).filter(Boolean).slice(0, 3).join(", ")}
                        {urgentStock.length > 3 && ` (+${urgentStock.length - 3})`}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-8 text-xs font-semibold bg-white text-amber-700 hover:bg-white/90 shadow-sm"
                          onClick={() => {
                            setPrioritizeAntiGaspi(true);
                            setShowAIOptions(true);
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Sauver avec le Chef IA
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                          onClick={() => navigate("/stock")}
                        >
                          Gérer le stock
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* AI Cards and rest of content... */}
          <section className="px-6 -mt-4 mb-8">
            <Card className="bg-accent text-accent-foreground shadow-lg border-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 mt-0.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <h3 className="font-semibold mb-1 text-base md:text-lg">Inspiration du Chef</h3>
                      <p className="text-sm opacity-90">
                        {stock.length === 0
                          ? "Générez une recette incroyable, même sans ingrédients !"
                          : "En panne d'inspiration ? Laissez le chef IA inventer une recette avec vos restes."}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" className="w-full md:w-auto md:min-w-[140px] shrink-0 bg-white/20 hover:bg-white/30 text-white border-0" onClick={handleGenerateClick} disabled={loadingAI}>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Générer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Planification & Organisation (Forte Rétention) */}
          <section className="px-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Menu & Organisation</h2>
                <p className="text-xs text-muted-foreground">Anticipez la semaine et gagnez du temps</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/planning')}>
                Voir planning <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => navigate('/planning')}
                className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-sm transition-all text-left flex flex-col justify-between h-32 md:h-36 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">
                    Midi & Soir
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                    Menu de la semaine
                  </h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">
                    Planning 7 jours & liste de courses automatique
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/planning')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/25 hover:border-amber-500/50 hover:shadow-sm transition-all text-left flex flex-col justify-between h-32 md:h-36 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Flame className="w-4 h-4" />
                  </div>
                  <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0">
                    Week-end
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-foreground mb-0.5 group-hover:text-amber-600 transition-colors">
                    Batch Cooking
                  </h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">
                    Feuille de route unifiée : 3-4 repas prêts en 1h30
                  </p>
                </div>
              </button>
            </div>
          </section>

          {recipes.some(r => r.is_favorited) && (
            <section className="px-6 mt-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Vos favoris</h2>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/profile/favorites')}>
                  Voir tout <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <div className="flex md:grid gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-6 md:mx-0 px-6 md:px-0 no-scrollbar snap-x scroll-pl-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recipes.filter(r => r.is_favorited).slice(0, 4).map(recipe => (
                  <Card key={recipe.id} className="flex-shrink-0 w-60 md:w-auto snap-start cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                    <div className="relative h-36">
                      <RecipeImage src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm"><Heart className="w-3.5 h-3.5 fill-accent text-accent" /></div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">{recipe.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Coins className="w-3 h-3" />
                          {calculateRecipeCost(recipe).formattedCostPerServing}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {suggestedRecipe && (
            <section className="px-6 mt-6 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /><h2 className="text-xl font-semibold">Suggestion</h2></div>
                <Button variant="ghost" size="sm" onClick={handleGenerateClick}><RefreshCw className="w-4 h-4 mr-2" />Autre idée</Button>
              </div>
              <Card className="overflow-hidden border-accent/20 border-2">
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-semibold text-lg mb-2">{suggestedRecipe.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{suggestedRecipe.description}"</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                    <Badge variant="outline" className="flex gap-1 items-center"><Clock className="w-3 h-3" />{(suggestedRecipe.prep_time || 0) + (suggestedRecipe.cook_time || 0)} min</Badge>
                    <Badge variant="outline" className="flex gap-1 items-center"><ChefHat className="w-3 h-3" />{suggestedRecipe.difficulty}</Badge>
                    {suggestedRecipe.category && <Badge variant="outline">{suggestedRecipe.category}</Badge>}
                    {suggestedCost && (
                      <Badge variant="outline" className="flex gap-1 items-center font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        <Coins className="w-3 h-3" />
                        {suggestedCost.formattedCostPerServing}
                      </Badge>
                    )}
                    {suggestedRecipe.anti_gaspi_ingredients && suggestedRecipe.anti_gaspi_ingredients.length > 0 && (
                      <Badge className="bg-amber-600 text-white flex gap-1 items-center border-0 shadow-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Anti-gaspi : sauve {suggestedRecipe.anti_gaspi_ingredients.join(", ")}
                      </Badge>
                    )}
                  </div>
                  <Button onClick={saveSuggestedRecipe} className="w-full md:w-auto px-8" disabled={savingRecipe}>{savingRecipe ? "Sauvegarde..." : <><Save className="w-4 h-4 mr-2" />Sauvegarder et cuisiner</>}</Button>
                </CardContent>
              </Card>
            </section>
          )}

          {featuredRecipe ? (
            <section className="px-6 mt-8">
              <h2 className="text-xl font-semibold mb-3">Recette du moment</h2>
              <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden md:flex md:flex-row" onClick={() => navigate(`/recipe/${featuredRecipe.id}`)}>
                <div className="relative md:w-2/5 md:min-h-[220px]">
                  <RecipeImage src={featuredRecipe.image_url} alt={featuredRecipe.title} className="w-full h-48 md:h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                  <div className="absolute bottom-3 left-3 right-3 md:hidden">
                    <div className="flex flex-wrap gap-1 mb-2">{featuredRecipe.tags?.map(tag => <Badge key={tag} className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">{tag}</Badge>)}</div>
                    <h3 className="text-lg font-bold text-white">{featuredRecipe.title}</h3>
                  </div>
                </div>
                <CardContent className="p-4 md:p-6 md:w-3/5 flex flex-col justify-center">
                  <div className="hidden md:flex flex-wrap gap-1 mb-2">{featuredRecipe.tags?.map(tag => <Badge key={tag} className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">{tag}</Badge>)}</div>
                  <h3 className="hidden md:block text-xl font-bold text-foreground mb-2">{featuredRecipe.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 flex-wrap">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{(featuredRecipe.prep_time || 0) + (featuredRecipe.cook_time || 0)} min</div>
                    <div className="flex items-center gap-1"><ChefHat className="w-4 h-4" />{featuredRecipe.difficulty}</div>
                    {featuredCost && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Coins className="w-4 h-4" />
                        {featuredCost.formattedCostPerServing}
                      </div>
                    )}
                  </div>
                  {featuredRecipe.description && <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">{featuredRecipe.description}</p>}
                </CardContent>
              </Card>
            </section>
          ) : (
            <section className="px-6 mt-8">
              <h2 className="text-xl font-semibold mb-3">Recette du moment</h2>
              <Card className="bg-muted/30 border-dashed border-2 flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Book className="w-8 h-8 text-muted-foreground opacity-50" /></div>
                <p className="font-semibold text-foreground/80 mb-1">Votre carnet est vide</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/recipes/new-method')}><Plus className="w-4 h-4 mr-2" />Ajouter une recette</Button>
              </Card>
            </section>
          )}
        </>
      )}

      {/* AI Configure Dialog UI... */}
      <Dialog open={showAIOptions} onOpenChange={setShowAIOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Configurer l'IA</DialogTitle><DialogDescription>Personnalisez la suggestion de recette.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            {urgentStock.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <Label htmlFor="anti-gaspi-toggle" className="font-bold text-xs text-foreground flex items-center gap-1.5 cursor-pointer">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Priorité Anti-Gaspillage ({urgentStock.length} sous 48h)</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    Cuisiner d'urgence : {urgentStock.map(s => s.ingredient?.name).filter(Boolean).slice(0, 3).join(", ")}
                  </p>
                </div>
                <Switch
                  id="anti-gaspi-toggle"
                  checked={prioritizeAntiGaspi}
                  onCheckedChange={setPrioritizeAntiGaspi}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Créativité</Label>
              <RadioGroup value={creativity} onValueChange={setCreativity} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="classic" id="r1" /><Label htmlFor="r1">Classique</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="original" id="r2" /><Label htmlFor="r2">Originale</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="crazy" id="r3" /><Label htmlFor="r3">Fusion</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Type de repas</Label>
              <Select value={mealType} onValueChange={setMealType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Peu importe</SelectItem><SelectItem value="petit_dejeuner">Petit-déj</SelectItem><SelectItem value="dejeuner">Déjeuner</SelectItem><SelectItem value="diner">Dîner</SelectItem></SelectContent></Select>
            </div>
            <div className="flex items-center justify-between space-x-2 pt-2">
              <Label htmlFor="focus-mode" className="flex flex-col space-y-1"><span>Mode "Frigo vide"</span></Label>
              <Switch id="focus-mode" checked={focus === 'use_stock'} onCheckedChange={(c) => setFocus(c ? 'use_stock' : 'discovery')} />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAIOptions(false)}>Annuler</Button><Button onClick={generateAISuggestion} disabled={loadingAI}>{loadingAI ? "Réflexion..." : "Générer"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <StarterPackModal open={showStarterPackModal} onOpenChange={setShowStarterPackModal} />
    </div>
  );
};

export default Home;
