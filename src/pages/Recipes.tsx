import { useState, useEffect } from "react";
import { RecipeImage } from "@/components/RecipeImage";
import { Search, Clock, Heart, Filter, Plus, Book, GraduationCap, Globe, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import RecipeFilters from "@/components/RecipeFilters";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeCategory, RecipeDifficulty } from "@/types/database";

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState<RecipeCategory | "all" | string>("all");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty | "all">("all");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setCategory(cat as RecipeCategory);
    }
  }, [searchParams]);


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
    <div className="pb-20 min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Toutes les recettes</h1>
          <Button
            size="icon"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate("/recipes/new-method")}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des recettes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background text-foreground"
            />
          </div>

          <Button
            variant="secondary"
            className="shrink-0"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>
      </header>

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
                <div className="relative h-40">
                  <RecipeImage
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full"
                    loading={index < 2 ? "eager" : "lazy"}
                    // @ts-ignore
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
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags && recipe.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex-shrink-0 text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                    </div>
                    {recipe.difficulty && (
                      <div className="flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5" />
                        {recipe.difficulty}
                      </div>
                    )}
                    {recipe.source && (
                      <div className="flex items-center gap-1">
                        {recipe.source === 'book' && <Book className="w-3.5 h-3.5" />}
                        {recipe.source === 'cooking_class' && <GraduationCap className="w-3.5 h-3.5" />}
                        {recipe.source === 'website' && <Globe className="w-3.5 h-3.5" />}
                        <span className="capitalize text-xs">
                          {recipe.source === 'book' ? 'Livre' :
                            recipe.source === 'cooking_class' ? 'Cours de cuisine' :
                              recipe.source === 'website' ? 'Web' : recipe.source}
                        </span>
                      </div>
                    )}
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
