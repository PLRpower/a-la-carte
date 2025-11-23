import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Clock, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useRecipes } from "@/hooks/useRecipes";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, toggleFavorite } = useRecipes();
  const [servings, setServings] = useState(4);

  const recipe = recipes.find(r => r.id === id);

  useEffect(() => {
    if (recipe?.servings) {
      setServings(recipe.servings);
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chargement de la recette...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen">
      {/* Image Header */}
      <div className="relative">
        {recipe.image_url && (
          <>
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
          onClick={() => toggleFavorite(recipe.id)}
        >
          <Heart
            className={`w-5 h-5 ${recipe.is_favorited ? "fill-accent text-accent" : "text-accent"
              }`}
          />
        </Button>

        <div className="absolute bottom-4 left-6 right-6">
          <h1 className="text-2xl font-bold text-white mb-2">{recipe.title}</h1>
          <div className="flex items-center gap-3 text-white text-sm">
            {recipe.category && (
              <Badge className="bg-accent text-accent-foreground">
                {recipe.category}
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
            </div>
            {recipe.difficulty && (
              <div className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                {recipe.difficulty}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {recipe.description && (
        <section className="px-6 mt-4">
          <p className="text-muted-foreground">{recipe.description}</p>
        </section>
      )}

      {/* Ingredients */}
      <section className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Ingrédients</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              -
            </button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {servings} portions
            </span>
            <button
              onClick={() => setServings(servings + 1)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <ul className="space-y-3">
              {recipe.ingredients?.map((ing, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="text-sm">
                    {ing.quantity} {ing.unit} {ing.ingredient?.name}
                    {ing.notes && <span className="text-muted-foreground"> ({ing.notes})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Preparation Steps */}
      {recipe.instructions && (
        <section className="px-6 mt-6 pb-6">
          <h2 className="text-xl font-semibold mb-4">Étapes de préparation</h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm whitespace-pre-wrap">{recipe.instructions}</p>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default RecipeDetail;
