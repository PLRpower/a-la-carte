import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface RecipeFiltersProps {
  category: string;
  difficulty: string;
  maxTime: string;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onMaxTimeChange: (value: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const RecipeFilters = ({
  category,
  difficulty,
  maxTime,
  onCategoryChange,
  onDifficultyChange,
  onMaxTimeChange,
  onReset,
  onClose,
}: RecipeFiltersProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in">
      <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-lg animate-in slide-in-from-bottom max-h-[80vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="seafood">Seafood</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="salad">Salad</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={onDifficultyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maximum preparation time</Label>
              <Select value={maxTime} onValueChange={onMaxTimeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button onClick={onClose} className="w-full" size="lg">
              Apply Filters
            </Button>
            <Button onClick={onReset} variant="outline" className="w-full" size="lg">
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeFilters;
