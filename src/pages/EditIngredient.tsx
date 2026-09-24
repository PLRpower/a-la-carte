import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStock } from "@/hooks/useStock";
import { MeasurementUnit } from "@/types/database";

const EditIngredient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stock, updateStock, deleteStock, loading } = useStock();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<MeasurementUnit>("piece");
  const [expirationDate, setExpirationDate] = useState("");

  // Find the item in the loaded stock
  // Notes: this relies on 'stock' being already loaded or loading.
  const item = stock.find((i) => i.id === id);

  useEffect(() => {
    if (item) {
      setName(item.ingredient?.name || "");
      setQuantity(item.quantity?.toString() || "");
      setUnit((item.unit as MeasurementUnit) || "piece");
      setExpirationDate(item.expiration_date ? new Date(item.expiration_date).toISOString().split('T')[0] : "");
    }
  }, [item]);

  // If not loading and not found, maybe redirect or show error?
  // relying on user knowing how they got here

  const handleSave = async () => {
    if (!id || !item) return;

    // We update the stock entry. Note: updating the ingredient name itself is generally a separate action
    // but here we might want to update the displayed ingredient name? 
    // The stock table links to ingredients table. "name" is on ingredient.
    // If user changes name, do we rename the global ingredient? Or map to a new one?
    // For simplicity, let's assume we proceed with quantity/unit/expiration updates for now.
    // Changing the NAME of the ingredient might be complex if it's shared.
    // Let's stick to updating the customized fields for this stock entry (quantity, unit, exp).

    // What if user wants to rename? The UI shows a name input.
    // If we want to support renaming, we'd need an endpoint to update the ingredient or re-assign.
    // Given the prompt "ne fonctionne pas du tout", let's make it work for stock properties first.
    // Actually, "Modifier l'ingrédient" implies modifying the stock entry.
    // Let's disable name editing for now or clarify.
    // The original mockup had name editable.
    // If I edit name, I should probably update the ingredient name IF I own it / created it? or creates a new one?
    // Let's implement basics: updates to quantity, unit, expiration.

    const { error } = await updateStock(id, {
      quantity: parseFloat(quantity),
      unit: unit,
      expiration_date: expirationDate || null
    });

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success("Ingrédient mis à jour avec succès !");
      navigate("/stock");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await deleteStock(id);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Ingrédient supprimé avec succès !");
      navigate("/stock");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!item) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Ingrédient introuvable</p>
        <Button onClick={() => navigate("/stock")}>Retour au stock</Button>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-12 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 md:px-8 md:rounded-2xl md:my-6 shadow-xs">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/stock")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Modifier l'ingrédient</h1>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-6 max-w-xl mx-auto">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom (Ingrédient)</Label>
              <Input
                id="name"
                value={name}
                disabled
                className="bg-muted"
              // onChange={(e) => setName(e.target.value)} // Disabled for now to prevent global rename issues
              />
              <p className="text-xs text-muted-foreground">Le nom ne peut pas être modifié ici.</p>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Select value={unit} onValueChange={(val: MeasurementUnit) => setUnit(val)}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grammes (g)</SelectItem>
                    <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                    <SelectItem value="ml">Millilitres (ml)</SelectItem>
                    <SelectItem value="l">Litres (L)</SelectItem>
                    <SelectItem value="piece">Pièces</SelectItem>
                    {/* Add other units as per DB enum if necessary */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expired Category handling as it belongs to Ingredient not Stock usually, remove or disable */}

            <div className="space-y-2">
              <Label htmlFor="expiration">Date d'expiration (optionnel)</Label>
              <Input
                id="expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button onClick={handleSave} className="w-full" size="lg">
            Enregistrer les modifications
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" size="lg">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer l'ingrédient
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Cela supprimera définitivement cet ingrédient de votre stock.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
};

export default EditIngredient;
