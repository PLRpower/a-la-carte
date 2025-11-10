import { useState } from "react";
import { Camera, FileText, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AddRecipe = () => {
  const [method, setMethod] = useState<"photo" | "manual" | null>(null);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!title || !ingredients || !steps) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Recipe added!",
      description: "Your recipe has been saved successfully",
    });
    navigate("/recipes");
  };

  if (!method) {
    return (
      <div className="pb-20 min-h-screen">
        <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
          <h1 className="text-2xl font-bold">Add New Recipe</h1>
          <p className="text-sm opacity-90 mt-1">Choose how to add your recipe</p>
        </header>

        <section className="px-6 mt-6">
          <div className="space-y-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setMethod("photo")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">From Photo</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a photo to detect text or use as reference
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setMethod("manual")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Manual Entry</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill in the details with a structured form
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  if (method === "photo") {
    return (
      <div className="pb-20 min-h-screen">
        <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setMethod(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Add from Photo</h1>
          </div>
        </header>

        <section className="px-6 mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Upload Recipe Photo</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Take a photo or choose from gallery
              </p>
              <Button className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button variant="outline" className="w-full mt-3">
                Choose from Gallery
              </Button>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-4">
            We'll detect text from your image to help fill in the recipe details
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setMethod(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Manual Entry</h1>
        </div>
      </header>

      <section className="px-6 mt-6 pb-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="title">Recipe Title *</Label>
              <Input
                id="title"
                placeholder="Enter recipe name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Time (min) *</Label>
                <Input
                  id="time"
                  type="number"
                  placeholder="30"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="seafood">Seafood</SelectItem>
                  <SelectItem value="salad">Salad</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ingredients">Ingredients *</Label>
              <Textarea
                id="ingredients"
                placeholder="Enter each ingredient on a new line"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={6}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="steps">Preparation Steps *</Label>
              <Textarea
                id="steps"
                placeholder="Enter each step on a new line"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                rows={8}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="photo">Recipe Photo (optional)</Label>
              <Button variant="outline" className="w-full mt-1.5">
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
          <Button onClick={handleSubmit} className="w-full">
            Save Recipe
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/recipes")}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AddRecipe;
