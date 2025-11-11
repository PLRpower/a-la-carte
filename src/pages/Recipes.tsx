import { useState } from "react";
import { Search, Clock, Heart, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RecipeFilters from "@/components/RecipeFilters";

const recipes = [
  {
    id: 1,
    title: "Creamy Mushroom Risotto",
    image: "https://img-3.journaldesfemmes.fr/EP0XCaoHsL7OsF8OPCYkq-eUxmg=/750x500/e3bbf2e440ea4914a56bc5427a8081f6/ccmcms-jdf/39904280.jpg",
    time: "35 min",
    difficulty: "Medium",
    category: "Italian",
    isFavorite: true,
  },
  {
    id: 2,
    title: "Grilled Salmon with Herbs",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
    time: "25 min",
    difficulty: "Easy",
    category: "Seafood",
    isFavorite: false,
  },
  {
    id: 3,
    title: "Classic Margherita Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
    time: "45 min",
    difficulty: "Medium",
    category: "Italian",
    isFavorite: true,
  },
  {
    id: 4,
    title: "Thai Green Curry",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600",
    time: "30 min",
    difficulty: "Medium",
    category: "Asian",
    isFavorite: false,
  },
  {
    id: 5,
    title: "Caesar Salad",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600",
    time: "15 min",
    difficulty: "Easy",
    category: "Salad",
    isFavorite: false,
  },
  {
    id: 6,
    title: "Chocolate Lava Cake",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600",
    time: "25 min",
    difficulty: "Hard",
    category: "Dessert",
    isFavorite: true,
  },
];

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([1, 3, 6]);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [maxTime, setMaxTime] = useState("all");
  const navigate = useNavigate();

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setCategory("all");
    setDifficulty("all");
    setMaxTime("all");
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || recipe.category.toLowerCase() === category;
    const matchesDifficulty = difficulty === "all" || recipe.difficulty.toLowerCase() === difficulty;
    const matchesTime =
      maxTime === "all" || parseInt(recipe.time) <= parseInt(maxTime);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesTime;
  });

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <h1 className="text-2xl font-bold mb-4">All Recipes</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
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
          Filters
        </Button>
      </header>

      {showFilters && (
        <RecipeFilters
          category={category}
          difficulty={difficulty}
          maxTime={maxTime}
          onCategoryChange={setCategory}
          onDifficultyChange={setDifficulty}
          onMaxTimeChange={setMaxTime}
          onReset={handleResetFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Recipe Grid */}
      <section className="px-6 mt-6 pb-6">
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                  }}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.includes(recipe.id)
                        ? "fill-accent text-accent"
                        : "text-accent"
                    }`}
                  />
                </button>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold">{recipe.title}</h3>
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {recipe.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {recipe.time}
                  </div>
                  <div>{recipe.difficulty}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No recipes found</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Recipes;
