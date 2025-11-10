import { Heart, Clock, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const featuredRecipes = [
  {
    id: 1,
    title: "Creamy Mushroom Risotto",
    image: "https://images.unsplash.com/photo-1476124369491-c0df5c6e8f2c?w=800",
    time: "35 min",
    difficulty: "Medium",
    category: "Italian",
  },
  {
    id: 2,
    title: "Grilled Salmon with Herbs",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
    time: "25 min",
    difficulty: "Easy",
    category: "Seafood",
  },
];

const quickRecipes = [
  { id: 3, title: "Avocado Toast", time: "10 min", difficulty: "Easy" },
  { id: 4, title: "Caesar Salad", time: "15 min", difficulty: "Easy" },
  { id: 5, title: "Tomato Pasta", time: "20 min", difficulty: "Easy" },
];

const Home = () => {
  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <h1 className="text-3xl font-bold mb-2">À la carte</h1>
        <p className="text-sm opacity-90">Your personal recipe companion</p>
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

      {/* Featured Recipes */}
      <section className="px-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Featured Recipes</h2>
        <div className="space-y-4">
          {featuredRecipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden shadow-sm">
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
                <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 text-accent" />
                </button>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{recipe.title}</h3>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {recipe.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.time}
                  </div>
                  <div>{recipe.difficulty}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick & Easy */}
      <section className="px-6 mt-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Quick & Easy</h2>
        <div className="space-y-3">
          {quickRecipes.map((recipe) => (
            <Card key={recipe.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium mb-1">{recipe.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {recipe.time}
                      </div>
                      <div>{recipe.difficulty}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
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
