import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import { useStock } from "@/hooks/useStock";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecipeWithDetails } from "@/types/database";


const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recipes, loading: recipesLoading } = useRecipes();
  const { stock, loading: stockLoading } = useStock();
  const [suggestedRecipe, setSuggestedRecipe] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const featuredRecipe = recipes[0];
  const quickRecipes = recipes.filter(r =>
    (r.prep_time || 0) + (r.cook_time || 0) <= 30
  ).slice(0, 2);

  const generateAISuggestion = async () => {
    if (stock.length === 0) {
      toast({
        title: "Pas d'ingrédients",
        description: "Ajoutez d'abord des ingrédients à votre stock",
        variant: "destructive",
      });
      return;
    }

    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-recipe', {
        body: {
          ingredients: stock.map(s => ({
            name: s.ingredient?.name,
            quantity: s.quantity,
            unit: s.unit
          }))
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSuggestedRecipe(data.recipe);
      toast({
        title: "Recette générée !",
        description: "Découvrez votre recette suggérée par l'IA ci-dessous",
      });
    } catch (error: any) {
      console.error('AI suggestion error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Échec de la génération de la suggestion de recette",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-8 px-6">
        <h1 className="text-3xl font-bold mb-2">À la carte</h1>
        <p className="text-sm opacity-90">Cuisinez, gérez, savourez</p>
      </header>

      {/* AI Recipe Suggestion */}
      <section className="px-6 -mt-4">
        <Card className="bg-accent text-accent-foreground shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Suggestion de recette IA</h3>
                <p className="text-sm opacity-90 mb-3">
                  Obtenez une recette personnalisée basée sur vos ingrédients
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={generateAISuggestion}
                  disabled={loadingAI || stock.length === 0}
                >
                  {loadingAI ? "Génération..." : "Générer une recette"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* AI Generated Recipe */}
      {suggestedRecipe && (
        <section className="px-6 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">Recette suggérée par l'IA</h2>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{suggestedRecipe.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{suggestedRecipe.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {(suggestedRecipe.prep_time || 0) + (suggestedRecipe.cook_time || 0)} min
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  {suggestedRecipe.difficulty}
                </div>
                <Badge variant="outline" className="text-xs">
                  {suggestedRecipe.category}
                </Badge>
              </div>
              <Button size="sm" className="w-full" onClick={() => {
                // Save recipe logic would go here
                toast({
                  title: "Bientôt disponible",
                  description: "La sauvegarde des recettes IA arrive bientôt !",
                });
              }}>
                Sauvegarder la recette
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
              {featuredRecipe.image_url && (
                <>
                  <img
                    src={featuredRecipe.image_url}
                    alt={featuredRecipe.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge className="bg-accent text-accent-foreground mb-2">
                      {featuredRecipe.category}
                    </Badge>
                    <h3 className="text-lg font-bold text-white">{featuredRecipe.title}</h3>
                  </div>
                </>
              )}
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
                {recipe.image_url && (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-32 object-cover"
                  />
                )}
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
