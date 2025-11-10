import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, Lightbulb, Sparkles, ShoppingBasket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tipRecipe = {
  id: "1",
  title: "Creamy Mushroom Risotto",
  time: "35 min",
  difficulty: "Medium",
  image: "https://img-3.journaldesfemmes.fr/EP0XCaoHsL7OsF8OPCYkq-eUxmg=/750x500/e3bbf2e440ea4914a56bc5427a8081f6/ccmcms-jdf/39904280.jpg",
};

const recipeOfMoment = {
  id: "1",
  title: "Creamy Mushroom Risotto",
  time: "35 min",
  difficulty: "Medium",
  category: "Italian",
  image: "https://img-3.journaldesfemmes.fr/EP0XCaoHsL7OsF8OPCYkq-eUxmg=/750x500/e3bbf2e440ea4914a56bc5427a8081f6/ccmcms-jdf/39904280.jpg",
  availableIngredients: 3,
  totalIngredients: 10,
  ingredients: [
    { name: "Mushrooms", icon: "🍄", available: true },
    { name: "Arborio Rice", icon: "🌾", available: false },
    { name: "Parmesan", icon: "🧀", available: true },
  ],
};

const suggestedRecipe = {
  id: "2",
  title: "Mediterranean Grilled Salmon",
  time: "25 min",
  difficulty: "Easy",
  category: "Seafood",
  image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
  availableIngredients: 5,
  totalIngredients: 7,
  ingredients: [
    { name: "Salmon", icon: "🐟", available: true },
    { name: "Lemon", icon: "🍋", available: true },
    { name: "Olive Oil", icon: "🫒", available: true },
  ],
};

const quickEasyRecipes = [
  {
    id: "3",
    title: "Classic Caesar Salad",
    time: "15 min",
    difficulty: "Easy",
    category: "Salad",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
  },
  {
    id: "4",
    title: "Chocolate Brownies",
    time: "30 min",
    difficulty: "Easy",
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-12 pb-8 px-6">
        <h1 className="text-3xl font-bold mb-2">À la carte</h1>
        <p className="text-sm opacity-90">Cuisinez, gérez, savourez</p>
      </header>

      {/* Daily Suggestion */}
      <section className="px-6 -mt-4">
        <Card className="bg-accent text-accent-foreground shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ChefHat className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Today's Suggestion</h3>
                <p className="text-sm opacity-90">
                  Try our Creamy Mushroom Risotto - perfect for a cozy evening!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tip of the Day */}
      <section className="px-6 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold">Tip of the day</h2>
        </div>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
          onClick={() => navigate(`/recipe/${tipRecipe.id}`)}
        >
          <div className="flex gap-3 p-3">
            <img
              src={tipRecipe.image}
              alt={tipRecipe.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1 line-clamp-2">{tipRecipe.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tipRecipe.time}
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  {tipRecipe.difficulty}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Recipe of the Moment */}
      <section className="px-6 mt-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold">Recipe of the moment</h2>
        </div>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
          onClick={() => navigate(`/recipe/${recipeOfMoment.id}`)}
        >
          <div className="relative">
            <img
              src={recipeOfMoment.image}
              alt={recipeOfMoment.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <Badge className="bg-accent text-accent-foreground mb-2">
                {recipeOfMoment.category}
              </Badge>
              <h3 className="text-lg font-bold text-white">{recipeOfMoment.title}</h3>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {recipeOfMoment.time}
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                  {recipeOfMoment.difficulty}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Key ingredients:
              </p>
              <div className="flex gap-2 flex-wrap">
                {recipeOfMoment.ingredients.map((ingredient, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                      ingredient.available
                        ? "bg-accent/10 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>{ingredient.icon}</span>
                    <span>{ingredient.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Suggested Based on Stock */}
      <section className="px-6 mt-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold">Based on your ingredients</h2>
        </div>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
          onClick={() => navigate(`/recipe/${suggestedRecipe.id}`)}
        >
          <div className="flex gap-3 p-3">
            <img
              src={suggestedRecipe.image}
              alt={suggestedRecipe.title}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {suggestedRecipe.category}
                </Badge>
                <Badge className="bg-accent/10 text-accent text-xs">
                  {suggestedRecipe.availableIngredients}/{suggestedRecipe.totalIngredients} in stock
                </Badge>
              </div>
              <h3 className="font-semibold mb-1 line-clamp-2">{suggestedRecipe.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {suggestedRecipe.time}
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  {suggestedRecipe.difficulty}
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                {suggestedRecipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                  <span key={idx} className="text-base">
                    {ingredient.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Quick & Easy */}
      <section className="px-6 mt-8 pb-6">
        <h2 className="text-xl font-semibold mb-3">Quick & Easy</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickEasyRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            >
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-32 object-cover"
              />
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                  {recipe.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.time}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
