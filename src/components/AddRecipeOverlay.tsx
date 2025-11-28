import { useState, useRef } from "react";
import { Camera, FileText, X, ArrowLeft, Upload } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { uploadFile } from "@/lib/supabase-storage";

interface AddRecipeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRecipeOverlay = ({ isOpen, onClose }: AddRecipeOverlayProps) => {
  const [method, setMethod] = useState<"photo" | "manual" | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { getOrCreateIngredient } = useIngredients();

  if (!isOpen) return null;

  const resetForm = () => {
    setMethod(null);
    setTitle("");
    setDescription("");
    setIngredients("");
    setSteps("");
    setDifficulty("");
    setPrepTime("");
    setCookTime("");
    setServings("");
    setCategory("");
    setImageFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageUpload = async (file: File) => {
    setImageFile(file);

    if (method === "photo") {
      setScanning(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;

          try {
            console.log("Calling scan-recipe-image function...");
            const { data, error } = await supabase.functions.invoke('scan-recipe-image', {
              body: { imageBase64: base64 }
            });

            if (error) {
              console.error("Supabase function error:", error);
              throw error;
            }

            if (data?.error) {
              console.error("Function returned error:", data.error);
              throw new Error(data.error);
            }

            if (!data?.recipe) {
              console.error("No recipe data received");
              throw new Error("Aucune donnée de recette reçue");
            }

            const recipe = data.recipe;
            setTitle(recipe.title || "");
            setDescription(recipe.description || "");
            setDifficulty(recipe.difficulty || "");
            setPrepTime(recipe.prep_time?.toString() || "");
            setCookTime(recipe.cook_time?.toString() || "");
            setServings(recipe.servings?.toString() || "");
            setCategory(recipe.category || "");
            setSteps(recipe.instructions || "");

            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
              const ingredientsText = recipe.ingredients
                .map((ing: any) => `${ing.quantity} ${ing.unit} ${ing.name}`)
                .join("\n");
              setIngredients(ingredientsText);
            }

            toast({
              title: "Recette scannée !",
              description: "Vérifiez et modifiez les détails avant de sauvegarder",
            });
          } catch (scanError: any) {
            console.error('Scan processing error:', scanError);
            toast({
              title: "Scan partiel ou échoué",
              description: "L'IA n'a pas pu extraire toutes les données. Veuillez compléter manuellement.",
              variant: "destructive",
            });
            // Even if scan fails, we want to let the user continue manually with the photo
          } finally {
            setMethod("manual");
            setScanning(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        console.error('File reading error:', error);
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier image.",
          variant: "destructive",
        });
        setScanning(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Veuillez vous connecter pour ajouter des recettes",
        variant: "destructive",
      });
      return;
    }

    if (!title || !ingredients || !steps) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const { url, error: uploadError } = await uploadFile('recipe-images', imageFile, user.id);
        if (uploadError) throw uploadError;
        imageUrl = url;
      }

      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([{
          user_id: user.id,
          title,
          description,
          difficulty: difficulty as any || null,
          prep_time: prepTime ? parseInt(prepTime) : null,
          cook_time: cookTime ? parseInt(cookTime) : null,
          servings: servings ? parseInt(servings) : null,
          category: category as any || null,
          instructions: steps,
          image_url: imageUrl,
          is_public: true,
        }])
        .select()
        .single();

      if (recipeError) throw recipeError;

      const ingredientLines = ingredients.split('\n').filter(line => line.trim());
      for (const line of ingredientLines) {
        const parts = line.trim().split(' ');
        if (parts.length < 2) continue;

        const quantity = parseFloat(parts[0]) || 1;
        const unit = parts[1];
        const name = parts.slice(2).join(' ') || parts[1];

        const { data: ingredient } = await getOrCreateIngredient(name);
        if (!ingredient) continue;

        await supabase.from('recipe_ingredients').insert([{
          recipe_id: recipe.id,
          ingredient_id: ingredient.id,
          quantity,
          unit: unit as any,
        }]);
      }

      toast({
        title: "Recette ajoutée !",
        description: "Votre recette a été sauvegardée avec succès",
      });
      handleClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Échec de la sauvegarde de la recette",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="fixed inset-x-0 bottom-0 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-background rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
            <div className="flex items-center gap-2">
              {method && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMethod(null)}
                  className="mr-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h2 className="text-xl font-bold">
                {method === "photo" ? "Scanner une recette" :
                  method === "manual" ? "Détails de la recette" :
                    "Ajouter une nouvelle recette"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-6 py-6 pb-10">
            {!method && (
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
                        <h3 className="font-semibold mb-1">Depuis une photo (IA)</h3>
                        <p className="text-sm text-muted-foreground">
                          Téléchargez une photo pour détecter le texte ou l'utiliser comme référence
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
                        <h3 className="font-semibold mb-1">Saisie manuelle</h3>
                        <p className="text-sm text-muted-foreground">
                          Remplissez les détails avec un formulaire structuré
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {method === "photo" && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                      <Camera className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Télécharger une photo de recette</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      L'IA va scanner et extraire les détails de la recette
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <Button
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={scanning}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {scanning ? "Scan en cours..." : "Choisir une photo"}
                    </Button>
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground text-center">
                  Nous utiliserons l'IA pour détecter et extraire les informations de la recette à partir de votre image
                </p>
              </div>
            )}

            {method === "manual" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre de la recette *</Label>
                  <Input
                    id="title"
                    placeholder="Entrez le nom de la recette"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brève description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulté *</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facile">Facile</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="difficile">Difficile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petit_dejeuner">Petit-déjeuner</SelectItem>
                        <SelectItem value="dejeuner">Déjeuner</SelectItem>
                        <SelectItem value="diner">Dîner</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                        <SelectItem value="encas">En-cas</SelectItem>
                        <SelectItem value="vegetarien">Végétarien</SelectItem>
                        <SelectItem value="vegan">Végétalien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prepTime">Prép (min)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      placeholder="15"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cookTime">Cuisson (min)</Label>
                    <Input
                      id="cookTime"
                      type="number"
                      placeholder="30"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="servings">Portions</Label>
                    <Input
                      id="servings"
                      type="number"
                      placeholder="4"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ingredients">Ingrédients *</Label>
                  <Textarea
                    id="ingredients"
                    placeholder="1 tasse de farine&#10;2 oeufs&#10;100 g de sucre"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows={6}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez chaque ingrédient sur une nouvelle ligne (ex: "2 tasses de farine")
                  </p>
                </div>

                <div>
                  <Label htmlFor="steps">Étapes de préparation *</Label>
                  <Textarea
                    id="steps"
                    placeholder="1. Première étape&#10;2. Deuxième étape&#10;3. Troisième étape"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    rows={8}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="photo">Photo de la recette</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setImageFile(file);
                    }}
                  />
                  <Button
                    variant="outline"
                    className="w-full mt-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {imageFile ? "Changer la photo" : "Télécharger une photo"}
                  </Button>
                  {imageFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {imageFile.name}
                    </p>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder la recette"}
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
