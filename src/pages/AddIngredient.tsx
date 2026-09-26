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
import { parseIngredientInput } from "@/lib/ingredient-parser";

const AddIngredient = () => {
  const navigate = useNavigate();
  const { addStock } = useStock();
  const { getOrCreateIngredient } = useIngredients();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<MeasurementUnit>("g");
  const [category, setCategory] = useState<IngredientCategory>("autre");
  const [expirationDate, setExpirationDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameBlur = () => {
    if (!name) return;
    const parsed = parseIngredientInput(name);

    // If we successfully parsed a quantity, update the fields
    if (parsed.quantity !== null) {
      // Only update if we actually extracted something (name changed)
      if (parsed.name !== name) {
        setName(parsed.name);
        setQuantity(parsed.quantity.toString());
        if (parsed.unit) {
          setUnit(parsed.unit);
        }
        toast.info("Quantité et unité détectées automatiquement !");
      }
    }
  };

  const handleSave = async () => {
    if (!name || !quantity) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get or create ingredient
      const { data: ingredient, error: ingError } = await getOrCreateIngredient(name, category);

      if (ingError || !ingredient) {
        throw new Error("Échec du traitement de l'ingrédient");
      }

      // 2. Add to stock
      const { error: stockError } = await addStock(
        ingredient.id,
        parseFloat(quantity),
        unit,
        expirationDate || undefined
      );

      if (stockError) throw stockError;

      toast.success("Ingrédient ajouté avec succès !");
      navigate("/stock");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Échec de l'ajout de l'ingrédient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20 md:pb-12 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 md:px-8 md:rounded-2xl md:my-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Ajouter un ingrédient</h1>
          </div>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-6 max-w-xl mx-auto">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                placeholder="ex : Tomates"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité *</Label>
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
                <Label htmlFor="unit">Unité</Label>
                <Select value={unit} onValueChange={(val) => setUnit(val as MeasurementUnit)} disabled={isSubmitting}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grammes (g)</SelectItem>
                    <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                    <SelectItem value="ml">Millilitres (ml)</SelectItem>
                    <SelectItem value="l">Litres (L)</SelectItem>
                    <SelectItem value="cuillere_soupe">Cuillère à soupe</SelectItem>
                    <SelectItem value="cuillere_the">Cuillère à café</SelectItem>
                    <SelectItem value="piece">Pièce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as IngredientCategory)} disabled={isSubmitting}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetables">Légumes</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="meat">Viande</SelectItem>
                  <SelectItem value="dairy">Produits laitiers</SelectItem>
                  <SelectItem value="grains">Céréales</SelectItem>
                  <SelectItem value="spices">Épices</SelectItem>
                  <SelectItem value="oils">Huiles</SelectItem>
                  <SelectItem value="beverages">Boissons</SelectItem>
                  <SelectItem value="fish">Poisson</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration">Date d'expiration (optionnel)</Label>
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
          {isSubmitting ? "Ajout en cours..." : "Ajouter au stock"}
        </Button>
      </section>
    </div>
  );
};

export default AddIngredient;
