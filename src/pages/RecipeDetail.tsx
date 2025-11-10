import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Clock, ChefHat, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const recipeData: Record<string, any> = {
  "1": {
    title: "Creamy Mushroom Risotto",
    image: "https://images.unsplash.com/photo-1476124369491-c0df5c6e8f2c?w=800",
    time: "35 min",
    difficulty: "Medium",
    category: "Italian",
    servings: 4,
    ingredients: [
      "2 cups Arborio rice",
      "500g mixed mushrooms",
      "1 onion, finely chopped",
      "3 cloves garlic, minced",
      "6 cups vegetable stock",
      "1/2 cup white wine",
      "1/2 cup parmesan cheese",
      "3 tbsp butter",
      "2 tbsp olive oil",
      "Salt and pepper to taste",
      "Fresh parsley for garnish",
    ],
    steps: [
      "Heat the vegetable stock in a saucepan and keep it warm over low heat.",
      "In a large pan, heat olive oil and 1 tbsp butter. Sauté the chopped onion until translucent.",
      "Add the sliced mushrooms and cook until golden brown. Set aside half of the mushrooms.",
      "Add garlic and rice to the pan, stirring for 2 minutes until rice is slightly toasted.",
      "Pour in the white wine and stir until absorbed.",
      "Add stock one ladle at a time, stirring constantly. Wait until each addition is absorbed before adding more.",
      "Continue for about 20 minutes until rice is creamy and al dente.",
      "Stir in remaining butter, parmesan cheese, and reserved mushrooms.",
      "Season with salt and pepper. Garnish with fresh parsley and serve immediately.",
    ],
  },
};

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [servings, setServings] = useState(4);

  const recipe = recipeData[id || "1"];

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Recipe not found</p>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen">
      {/* Image Header */}
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? "fill-accent text-accent" : "text-accent"
            }`}
          />
        </Button>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-6 right-6">
          <h1 className="text-2xl font-bold text-white mb-2">{recipe.title}</h1>
          <div className="flex items-center gap-3 text-white text-sm">
            <Badge className="bg-accent text-accent-foreground">
              {recipe.category}
            </Badge>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.time}
            </div>
            <div className="flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
              {recipe.difficulty}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Stock Button */}
      <div className="px-6 mt-4">
        <Button className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredients to Stock
        </Button>
      </div>

      {/* Ingredients */}
      <section className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              -
            </button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {servings} servings
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
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="text-sm">{ingredient}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Preparation Steps */}
      <section className="px-6 mt-6 pb-6">
        <h2 className="text-xl font-semibold mb-4">Preparation Steps</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {recipe.steps.map((step: string, index: number) => (
                <div key={index}>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-sm pt-0.5">{step}</p>
                  </div>
                  {index < recipe.steps.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default RecipeDetail;
