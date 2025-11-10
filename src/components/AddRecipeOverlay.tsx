import { useState } from "react";
import { Camera, FileText, X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface AddRecipeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRecipeOverlay = ({ isOpen, onClose }: AddRecipeOverlayProps) => {
  const [method, setMethod] = useState<"photo" | "manual" | null>(null);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
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
    handleClose();
  };

  const handleClose = () => {
    setMethod(null);
    setTitle("");
    setIngredients("");
    setSteps("");
    setDifficulty("");
    setTime("");
    setCategory("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="fixed inset-x-0 bottom-0 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300">
        <div className="bg-background rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <h2 className="text-xl font-bold">Add New Recipe</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-6 py-6">
            {!method ? (
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
            ) : method === "photo" ? (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setMethod(null)}
                  className="mb-4 -ml-2"
                >
                  ← Back
                </Button>
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
              </div>
            ) : (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setMethod(null)}
                  className="mb-4 -ml-2"
                >
                  ← Back
                </Button>
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
                    onClick={handleClose}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
