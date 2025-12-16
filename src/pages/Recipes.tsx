import { useState } from "react";
import { Search, Clock, Heart, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RecipeFilters from "@/components/RecipeFilters";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeCategory, RecipeDifficulty } from "@/types/database";
import { AddRecipeOverlay } from "@/components/AddRecipeOverlay";

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isAddOverlayOpen, setIsAddOverlayOpen] = useState(false);
  const [category, setCategory] = useState<RecipeCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty | "all">("all");
  const navigate = useNavigate();

  const { recipes, loading, toggleFavorite } = useRecipes({
    searchQuery,
    category: category === "all" ? undefined : category,
    difficulty: difficulty === "all" ? undefined : difficulty,
  });

  const handleResetFilters = () => {
    setCategory("all");
    setDifficulty("all");
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <h1 className="text-2xl font-bold mb-4">Toutes les recettes</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des recettes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background text-foreground"
          />
        </div>

        {/* Filter Button */}
        <Button
          variant="secondary"
          className="w-full mt-3"
          size="sm"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </header>

      <AddRecipeOverlay
        isOpen={isAddOverlayOpen}
        onClose={() => setIsAddOverlayOpen(false)}
      />

      {showFilters && (
        <RecipeFilters
          category={category}
          difficulty={difficulty}
          maxTime="all"
          onCategoryChange={(val) => setCategory(val as RecipeCategory | "all")}
          onDifficultyChange={(val) => setDifficulty(val as RecipeDifficulty | "all")}
          onMaxTimeChange={() => { }}
          onReset={handleResetFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Recipe Grid */}
      <section className="px-6 mt-6 pb-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des recettes...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe, index) => (
              <Card
                key={recipe.id}
                className="overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <div className="relative">
                  {recipe.image_url && (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-40 object-cover"
                      loading={index < 2 ? "eager" : "lazy"}
                      {...({ fetchPriority: index < 2 ? "high" : "auto" } as any)}
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.id);
                    }}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${recipe.is_favorited
                        ? "fill-accent text-accent"
                        : "text-accent"
                        }`}
                    />
                  </button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{recipe.title}</h3>
                    {recipe.category && (
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                        {recipe.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                    </div>
                    {recipe.difficulty && <div>{recipe.difficulty}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && recipes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune recette trouvée</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Recipes;
