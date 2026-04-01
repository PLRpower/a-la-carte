import { useState, useEffect } from "react";
import { RecipeImage } from "@/components/RecipeImage";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Clock, ChefHat, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useRecipes } from "@/hooks/useRecipes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, toggleFavorite, deleteRecipe } = useRecipes();
  const { toast } = useToast();
  const [servings, setServings] = useState(4);
  const [photos, setPhotos] = useState<string[]>([]);

  const recipe = recipes.find(r => r.id === id);

  useEffect(() => {
    if (recipe?.servings) {
      setServings(recipe.servings);
    }

    // Fetch photos
    const fetchPhotos = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('recipe_photos')
        .select('url')
        .eq('recipe_id', id);

      if (data) {
        setPhotos(data.map(p => p.url));
      }
    };

    fetchPhotos();
  }, [recipe, id]);

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
      <div className="relative h-64 w-full bg-muted">
        <RecipeImage
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white"
          onClick={() => navigate('/recipes')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={() => toggleFavorite(recipe.id)}
          >
            <Heart
              className={`w-5 h-5 ${recipe.is_favorited ? "fill-accent text-accent" : "text-accent"
                }`}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/recipes/edit/${id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (!id) return;
                  const { error } = await deleteRecipe(id);

                  if (error) {
                    toast({
                      title: "Erreur",
                      description: "Impossible de supprimer la recette",
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Recette supprimée",
                      description: "La recette a été supprimée avec succès",
                    });
                    navigate('/recipes');
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute bottom-4 left-6 right-6">
          <h1 className="text-2xl font-bold text-white mb-2">{recipe.title}</h1>
          <div className="flex items-center gap-3 text-white text-sm">
            <div className="flex flex-wrap gap-1">
              {recipe.tags && recipe.tags.map((tag) => (
                <Badge key={tag} className="bg-accent text-accent-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
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
              {recipe.ingredients?.map((ing, index) => {
                const initialServings = recipe.servings || 1;
                const scale = servings / initialServings;
                const quantity = ing.quantity ? (ing.quantity * scale) : null;
                const formattedQuantity = quantity ? Number(quantity.toFixed(2)).toString() : '';

                return (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-sm">
                      {formattedQuantity} {ing.unit !== 'piece' && ing.unit} {ing.name}
                    </span>
                  </li>
                );
              })}
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

      {/* Photos Section */}
      {photos.length > 0 && (
        <section className="px-6 mt-2 pb-8">
          <h2 className="text-xl font-semibold mb-4">Photos originales</h2>
          <div className="flex flex-col gap-4">
            {photos.map((url, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden border bg-muted">
                <img
                  src={url}
                  alt={`Photo originale ${idx + 1}`}
                  className="w-full h-auto object-contain max-h-[500px]"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RecipeDetail;
