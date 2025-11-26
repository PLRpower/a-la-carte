import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
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

const EditIngredient = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("Tomatoes");
  const [quantity, setQuantity] = useState("500");
  const [unit, setUnit] = useState("g");
  const [category, setCategory] = useState("vegetables");
  const [expirationDate, setExpirationDate] = useState("");

  const handleSave = () => {
    toast.success("Ingrédient mis à jour avec succès !");
    navigate("/stock");
  };

  const handleDelete = () => {
    toast.success("Ingrédient supprimé avec succès !");
    navigate("/stock");
  };

  return (
    <div className="pb-20 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Modifier l'ingrédient</h1>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex : Tomates"
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grammes (g)</SelectItem>
                    <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                    <SelectItem value="ml">Millilitres (ml)</SelectItem>
                    <SelectItem value="l">Litres (L)</SelectItem>
                    <SelectItem value="units">Unités</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
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
                  <SelectItem value="other">Autre</SelectItem>
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
