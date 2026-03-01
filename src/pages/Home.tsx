import { useEffect, useState } from "react";
import { RecipeImage } from "@/components/RecipeImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Sparkles, Book, GraduationCap, Globe, Lightbulb, Save, RefreshCw, Coffee, Utensils, IceCream, Apple, Heart, ArrowRight, Salad, Camera, Carrot, Users, Plus, ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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


const HomeSkeleton = () => (
  <div className="px-6 space-y-8 animate-pulse">
    <div className="space-y-3">
      <div className="h-6 w-1/3 bg-muted rounded" />
      <div className="h-4 w-2/3 bg-muted rounded" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
    </div>
    <div className="h-40 bg-muted rounded-xl" />
    <div className="space-y-3">
      <div className="h-6 w-1/4 bg-muted rounded" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2].map(i => <div key={i} className="h-48 w-60 shrink-0 bg-muted rounded-xl" />)}
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

  const [suggestedRecipe, setSuggestedRecipe] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);

  const [creativity, setCreativity] = useState("original");
  const [mealType, setMealType] = useState("any");
  const [focus, setFocus] = useState("use_stock");

  const featuredRecipe = allRecipes?.[0];
  const quickRecipes = allRecipes?.filter(r =>
    (r.prep_time || 0) + (r.cook_time || 0) <= 60 && r.difficulty === 'facile'
  ).slice(0, 4);

  const handleGenerateClick = () => {
    setShowAIOptions(true);
  };

  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const generateAISuggestion = async () => {
    setShowAIOptions(false);
    setLoadingAI(true);
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
          preferences: { creativity, mealType, focus },
          avoidRecipes: currentHistory
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSuggestedRecipe(data.recipe);
      toast({ title: "Recette générée !", description: "Voici une suggestion basée sur vos préférences." });
    } catch (error: any) {
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
        category: (suggestedRecipe.category || 'diner') as any,
        tags: [suggestedRecipe.category || 'diner'],
        instructions: suggestedRecipe.instructions,
        is_public: true,
        source: 'website'
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
    } catch (error: any) {
      console.error("Save error:", error);
      toast({ title: "Erreur de sauvegarde", description: "Impossible de sauvegarder la recette.", variant: "destructive" });
    } finally {
      setSavingRecipe(false);
    }
  };

  const isLoading = (recipesLoading || stockLoading || profileLoading) && recipes.length === 0;

  return (
    <div className="pb-20 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-8 px-6 mb-6 flex items-center gap-4">
        <img src="/logo-transparent.png" alt="Logo" className="w-14 h-14 object-contain" />
        <div>
          <h1 className="text-3xl font-bold mb-1">À la carte</h1>
          <p className="text-sm opacity-90">Cuisinez, gérez, savourez</p>
        </div>
      </header>

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <>
          <section className="px-6 mb-8">
            {recipes.length === 0 && stock.length === 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-lg font-medium text-foreground mb-1">
                    👋 Bienvenue {(profile as any)?.first_name ? (profile as any).first_name : ""} !
                  </p>
                  <p className="text-sm text-muted-foreground">Prêt à transformer vos repas ? Voici par où commencer.</p>
                </div>
                <h2 className="text-xl font-semibold mb-3">Vos premiers pas</h2>
                <div className="grid grid-cols-2 gap-3">
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

          {/* AI Cards and rest of content... */}
          <section className="px-6 -mt-4 mb-8">
            <Card className="bg-accent text-accent-foreground shadow-lg border-none">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Inspiration du Chef</h3>
                    <p className="text-sm opacity-90 mb-3">
                      {stock.length === 0
                        ? "Générez une recette incroyable, même sans ingrédients !"
                        : "En panne d'inspiration ? Laissez le chef IA inventer une recette avec vos restes."}
                    </p>
                    <Button size="sm" variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0" onClick={handleGenerateClick} disabled={loadingAI}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Générer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

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
                  <Card key={recipe.id} className="flex-shrink-0 w-60 snap-start cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                    <div className="relative h-32">
                      <RecipeImage src={recipe.image_url} alt={recipe.title} className="w-full h-full" />
                      <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm"><Heart className="w-3.5 h-3.5 fill-accent text-accent" /></div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">{recipe.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</div>
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
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{suggestedRecipe.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{suggestedRecipe.description}"</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                    <Badge variant="outline" className="flex gap-1 items-center"><Clock className="w-3 h-3" />{(suggestedRecipe.prep_time || 0) + (suggestedRecipe.cook_time || 0)} min</Badge>
                    <Badge variant="outline" className="flex gap-1 items-center"><ChefHat className="w-3 h-3" />{suggestedRecipe.difficulty}</Badge>
                    {suggestedRecipe.category && <Badge variant="outline">{suggestedRecipe.category}</Badge>}
                  </div>
                  <Button onClick={saveSuggestedRecipe} className="w-full" disabled={savingRecipe}>{savingRecipe ? "Sauvegarde..." : <><Save className="w-4 h-4 mr-2" />Sauvegarder et cuisiner</>}</Button>
                </CardContent>
              </Card>
            </section>
          )}

          {featuredRecipe ? (
            <section className="px-6 mt-8">
              <h2 className="text-xl font-semibold mb-3">Recette du moment</h2>
              <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={() => navigate(`/recipe/${featuredRecipe.id}`)}>
                <div className="relative">
                  <RecipeImage src={featuredRecipe.image_url} alt={featuredRecipe.title} className="w-full h-48" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex flex-wrap gap-1 mb-2">{featuredRecipe.tags?.map(tag => <Badge key={tag} className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">{tag}</Badge>)}</div>
                    <h3 className="text-lg font-bold text-white">{featuredRecipe.title}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{(featuredRecipe.prep_time || 0) + (featuredRecipe.cook_time || 0)} min</div>
                    <div className="flex items-center gap-1"><ChefHat className="w-4 h-4" />{featuredRecipe.difficulty}</div>
                  </div>
                  {featuredRecipe.description && <p className="text-sm text-muted-foreground line-clamp-2">{featuredRecipe.description}</p>}
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
    </div>
  );
};

export default Home;
