import { useEffect, useState } from "react";
import { RecipeImage } from "@/components/RecipeImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Sparkles, Book, GraduationCap, Globe, Lightbulb, Save, RefreshCw, Coffee, Utensils, IceCream, Apple, Heart, ArrowRight, Salad } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import { useStock } from "@/hooks/useStock";
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


const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { recipes, loading: recipesLoading, refetch: refetchRecipes } = useRecipes();
  const { stock, loading: stockLoading } = useStock();
  const { ingredients: allIngredients } = useIngredients();

  const [suggestedRecipe, setSuggestedRecipe] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);

  // AI Preferences
  const [creativity, setCreativity] = useState("original");
  const [mealType, setMealType] = useState("any");
  const [focus, setFocus] = useState("use_stock");

  const featuredRecipe = recipes[0];
  const quickRecipes = recipes.filter(r =>
    (r.prep_time || 0) + (r.cook_time || 0) <= 60 && r.difficulty === 'facile'
  ).slice(0, 4);

  const handleGenerateClick = () => {
    if (stock.length === 0) {
      toast({
        title: "Pas d'ingrédients",
        description: "Ajoutez d'abord des ingrédients à votre stock",
        variant: "destructive",
      });
      return;
    }
    setShowAIOptions(true);
  };

  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const generateAISuggestion = async () => {
    setShowAIOptions(false);
    setLoadingAI(true);

    // If we already have a suggestion shown, add it to history before generating new one
    let currentHistory = [...generatedTitles];
    if (suggestedRecipe?.title && !currentHistory.includes(suggestedRecipe.title)) {
      currentHistory.push(suggestedRecipe.title);
      setGeneratedTitles(currentHistory);
    }

    setSuggestedRecipe(null);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-recipe', {
        body: {
          ingredients: stock.map(s => ({
            name: s.ingredient?.name,
            quantity: s.quantity,
            unit: s.unit
          })),
          preferences: {
            creativity,
            mealType,
            focus
          },
          avoidRecipes: currentHistory
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSuggestedRecipe(data.recipe);
      toast({
        title: "Recette générée !",
        description: "Voici une suggestion basée sur vos préférences.",
      });
    } catch (error: any) {
      console.error('AI suggestion error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer une recette pour le moment.",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const saveSuggestedRecipe = async () => {
    if (!suggestedRecipe || !user) return;
    setSavingRecipe(true);

    try {
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([{
          user_id: user.id,
          title: suggestedRecipe.title,
          description: suggestedRecipe.description,
          difficulty: suggestedRecipe.difficulty || 'moyen',
          prep_time: suggestedRecipe.prep_time || 15,
          cook_time: suggestedRecipe.cook_time || 15,
          servings: suggestedRecipe.servings || 2,
          category: (suggestedRecipe.category || 'diner') as any,
          tags: [suggestedRecipe.category || 'diner'],
          instructions: suggestedRecipe.instructions,
          is_public: true, // Default to public or private? Let's say public
          source: 'website' // Mark as from web/AI
        }])
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Process ingredients
      if (suggestedRecipe.ingredients && Array.isArray(suggestedRecipe.ingredients)) {
        for (const ing of suggestedRecipe.ingredients) {
          // Try to match existing ingredients
          let ingredientId: string | null = null;
          const match = findBestIngredientMatch(ing.name, allIngredients);

          if (match) {
            ingredientId = match.id;
          } else {
            // Create new ingredient if needed, but let's just stick to name if no match?
            // The system usually requires ingredient_id if we want strict tracking.
            // For now, let's create it if missing or just use name if schema allows null id.
            // If ingredient_id is null, it's just text.
          }

          await supabase.from('recipe_ingredients').insert({
            recipe_id: recipe.id,
            ingredient_id: ingredientId,
            name: ing.name,
            quantity: typeof ing.quantity === 'number' ? ing.quantity : 1, // basic fallback
            unit: ing.unit || 'piece'
          });
        }
      }

      toast({
        title: "Recette sauvegardée !",
        description: "Vous pouvez maintenant la retrouver dans votre carnet.",
      });

      await refetchRecipes();
      navigate(`/recipe/${recipe.id}`);

    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la recette.",
        variant: "destructive",
      });
    } finally {
      setSavingRecipe(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-8 px-6 mb-6 flex items-center gap-4">
        <img src="/logo-transparent.png" alt="Logo" className="w-14 h-14 object-contain" />
        <div>
          <h1 className="text-3xl font-bold mb-1">À la carte</h1>
          <p className="text-sm opacity-90">Cuisinez, gérez, savourez</p>
        </div>
      </header>

      {/* Categories */}
      <section className="px-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Parcourir</h2>
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => navigate('/recipes?category=dejeuner,diner')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
            <div className="p-2 bg-white rounded-full shadow-sm text-primary">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-center">Plats</span>
          </button>
          <button onClick={() => navigate('/recipes?category=dessert')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
            <div className="p-2 bg-white rounded-full shadow-sm text-primary">
              <IceCream className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-center">Desserts</span>
          </button>
          <button onClick={() => navigate('/recipes?category=encas')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
            <div className="p-2 bg-white rounded-full shadow-sm text-primary">
              <Apple className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-center">En-cas</span>
          </button>
          <button onClick={() => navigate('/recipes?category=vegetarien')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
            <div className="p-2 bg-white rounded-full shadow-sm text-primary">
              <Salad className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-center">Végé</span>
          </button>
        </div>
      </section>

      {/* AI Configure Dialog */}
      <Dialog open={showAIOptions} onOpenChange={setShowAIOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurer l'IA</DialogTitle>
            <DialogDescription>
              Personnalisez la suggestion de recette selon vos envies du moment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Créativité</Label>
              <RadioGroup value={creativity} onValueChange={setCreativity} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classic" id="r1" />
                  <Label htmlFor="r1">Classique</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="original" id="r2" />
                  <Label htmlFor="r2">Originale</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="crazy" id="r3" />
                  <Label htmlFor="r3">Fusion</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Type de repas</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Peu importe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Peu importe</SelectItem>
                  <SelectItem value="petit_dejeuner">Petit-déjeuner</SelectItem>
                  <SelectItem value="dejeuner">Déjeuner</SelectItem>
                  <SelectItem value="diner">Dîner</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="encas">En-cas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2 pt-2">
              <Label htmlFor="focus-mode" className="flex flex-col space-y-1">
                <span>Mode "Frigo vide"</span>
                <span className="font-normal text-xs text-muted-foreground">
                  {focus === 'use_stock' ? "Essaie de n'utiliser QUE vos ingrédients" : "S'autorise quelques ingrédients en plus"}
                </span>
              </Label>
              <Switch
                id="focus-mode"
                checked={focus === 'use_stock'}
                onCheckedChange={(c) => setFocus(c ? 'use_stock' : 'discovery')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIOptions(false)}>Annuler</Button>
            <Button onClick={generateAISuggestion} disabled={loadingAI}>
              {loadingAI ? <span className="animate-pulse">Réflexion...</span> : "Générer la recette"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Suggestion Card */}
      <section className="px-6 -mt-4">
        <Card className="bg-accent text-accent-foreground shadow-lg border-none">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 mt-0.5 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Inspiration du Chef</h3>
                <p className="text-sm opacity-90 mb-3">
                  En panne d'inspiration ? Laissez le chef IA inventer une recette avec vos restes.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={handleGenerateClick}
                  disabled={loadingAI || stock.length === 0}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Générer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Favorites Preview */}
      {recipes.some(r => r.is_favorited) && (
        <section className="px-6 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Vos favoris</h2>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/profile/favorites')}>
              Voir tout <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x scroll-pl-6">
            {recipes.filter(r => r.is_favorited).slice(0, 3).map(recipe => (
              <Card
                key={recipe.id}
                className="flex-shrink-0 w-60 snap-start cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <div className="relative h-32">
                  <RecipeImage
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm">
                    <Heart className="w-3.5 h-3.5 fill-accent text-accent" />
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1">{recipe.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* AI Result */}
      {suggestedRecipe && (
        <section className="px-6 mt-6 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Suggestion</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={handleGenerateClick}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Autre idée
            </Button>
          </div>
          <Card className="overflow-hidden border-accent/20 border-2">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{suggestedRecipe.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 italic">"{suggestedRecipe.description}"</p>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                <Badge variant="outline" className="flex gap-1 items-center">
                  <Clock className="w-3 h-3" />
                  {(suggestedRecipe.prep_time || 0) + (suggestedRecipe.cook_time || 0)} min
                </Badge>
                <Badge variant="outline" className="flex gap-1 items-center">
                  <ChefHat className="w-3 h-3" />
                  {suggestedRecipe.difficulty}
                </Badge>
                <div className="flex flex-wrap gap-1">
                  {suggestedRecipe.category && (
                    <Badge variant="outline">{suggestedRecipe.category}</Badge>
                  )}
                  {/* If suggested recipe has tags, we could map them here too, but AI suggested usually has one category for now */}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm">Ingrédients clés :</h4>
                <ul className="text-sm list-disc list-inside text-muted-foreground">
                  {suggestedRecipe.ingredients?.slice(0, 4).map((i: any, idx: number) => (
                    <li key={idx}>{i.quantity} {i.unit} {i.name}</li>
                  ))}
                  {(suggestedRecipe.ingredients?.length || 0) > 4 && <li>...et {(suggestedRecipe.ingredients?.length || 0) - 4} autres</li>}
                </ul>
              </div>

              <Button
                onClick={saveSuggestedRecipe}
                className="w-full"
                disabled={savingRecipe}
              >
                {savingRecipe ? (
                  "Sauvegarde..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder et cuisiner
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Featured Recipe */}
      {featuredRecipe && !recipesLoading && (
        <section className="px-6 mt-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xl font-semibold">Recette du moment</h2>
          </div>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
            onClick={() => navigate(`/recipe/${featuredRecipe.id}`)}
          >
            <div className="relative">
              <RecipeImage
                src={featuredRecipe.image_url}
                alt={featuredRecipe.title}
                className="w-full h-48"
                loading="eager"
                // @ts-ignore
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {featuredRecipe.tags?.map(tag => (
                    <Badge key={tag} className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-white">{featuredRecipe.title}</h3>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {(featuredRecipe.prep_time || 0) + (featuredRecipe.cook_time || 0)} min
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                  {featuredRecipe.difficulty}
                </div>
                {featuredRecipe.source && (
                  <div className="flex items-center gap-1">
                    {featuredRecipe.source === 'book' && <Book className="w-4 h-4" />}
                    {featuredRecipe.source === 'cooking_class' && <GraduationCap className="w-4 h-4" />}
                    {featuredRecipe.source === 'website' && <Globe className="w-4 h-4" />}
                    <span className="capitalize text-xs">
                      {featuredRecipe.source === 'book' ? 'Livre' :
                        featuredRecipe.source === 'cooking_class' ? 'Cours de cuisine' :
                          featuredRecipe.source === 'website' ? 'Web' : featuredRecipe.source}
                    </span>
                  </div>
                )}
              </div>
              {featuredRecipe.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {featuredRecipe.description}
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Quick & Easy */}
      {quickRecipes.length > 0 && !recipesLoading && (
        <section className="px-6 mt-8 pb-6">
          <h2 className="text-xl font-semibold mb-3">Rapide & Facile</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <div className="h-32 w-full">
                  <RecipeImage
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {recipesLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des recettes...</p>
        </div>
      )}
    </div>
  );
};

export default Home;
