import { useNavigate } from "react-router-dom";
import { RecipeImage } from "@/components/RecipeImage";
import { ArrowLeft, Clock, Heart, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecipes } from "@/hooks/useRecipes";
import { calculateRecipeCost } from "@/lib/recipe-cost";

const FavoriteRecipes = () => {
    const navigate = useNavigate();
    const { recipes, loading, toggleFavorite } = useRecipes();

    // Filter only favorite recipes
    // Note: useRecipes hook already sets is_favorited flag based on current user
    const favoriteRecipes = recipes.filter(r => r.is_favorited);

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary-foreground hover:bg-white/20 -ml-2"
                        onClick={() => navigate("/profile")}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Recettes favorites
                    </h1>
                </div>
            </header>

            <div className="px-6 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-4">Chargement de vos favoris...</p>
                    </div>
                ) : favoriteRecipes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h2 className="text-lg font-semibold mb-2">Aucun favori pour le moment</h2>
                        <p className="mb-6">Marquez des recettes comme favorites pour les retrouver ici.</p>
                        <Button onClick={() => navigate("/recipes")}>
                            Explorer les recettes
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {favoriteRecipes.map((recipe, index) => (
                            <Card
                                key={recipe.id}
                                className="overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                            >
                                <div className="relative h-40">
                                    <RecipeImage
                                        src={recipe.image_url}
                                        alt={recipe.title}
                                        className="w-full h-full"
                                        loading={index < 2 ? "eager" : "lazy"}
                                        // @ts-expect-error ignoring typings for now
                                        fetchPriority={index < 2 ? "high" : "auto"}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(recipe.id);
                                        }}
                                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                                    >
                                        <Heart
                                            className="w-5 h-5 fill-accent text-accent"
                                        />
                                    </button>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-semibold line-clamp-1">{recipe.title}</h3>
                                        <div className="flex flex-wrap gap-1">
                                            {recipe.tags && recipe.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="flex-shrink-0 text-[10px] px-1.5 py-0">
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
                                        {recipe.difficulty && <div>{recipe.difficulty}</div>}
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Coins className="w-3.5 h-3.5" />
                                            {calculateRecipeCost(recipe).formattedCostPerServing}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteRecipes;
