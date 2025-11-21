import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useStock } from "@/hooks/useStock";
import { useIngredients } from "@/hooks/useIngredients";
import { IngredientCategory, MeasurementUnit } from "@/types/database";

const AddIngredient = () => {
  const navigate = useNavigate();
  const { addStock } = useStock();
  const { getOrCreateIngredient } = useIngredients();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<MeasurementUnit>("g");
  const [category, setCategory] = useState<IngredientCategory>("other");
  const [expirationDate, setExpirationDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name || !quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get or create ingredient
      const { data: ingredient, error: ingError } = await getOrCreateIngredient(name, category);

      if (ingError || !ingredient) {
        throw new Error("Failed to process ingredient");
      }

      // 2. Add to stock
      const { error: stockError } = await addStock(
        ingredient.id,
        parseFloat(quantity),
        unit,
        expirationDate || undefined
      );

      if (stockError) throw stockError;

      toast.success("Ingredient added successfully!");
      navigate("/stock");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to add ingredient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Add Ingredient</h1>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tomatoes"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={unit} onValueChange={(val) => setUnit(val as MeasurementUnit)} disabled={isSubmitting}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="l">Liters (L)</SelectItem>
                    <SelectItem value="cup">Cup</SelectItem>
                    <SelectItem value="tbsp">Tablespoon</SelectItem>
                    <SelectItem value="tsp">Teaspoon</SelectItem>
                    <SelectItem value="oz">Ounces</SelectItem>
                    <SelectItem value="lb">Pounds</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as IngredientCategory)} disabled={isSubmitting}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="meat">Meat</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                  <SelectItem value="oils">Oils</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="fish">Fish</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date (optional)</Label>
              <Input
                id="expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add to Stock"}
        </Button>
      </section>
    </div>
  );
};

export default AddIngredient;
