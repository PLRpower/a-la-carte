import { useState, useRef } from "react";
import { Camera, FileText, ArrowLeft, Upload } from "lucide-react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { uploadFile } from "@/lib/supabase-storage";

const AddRecipeWithAI = () => {
  const location = useLocation();
  const [method, setMethod] = useState<"photo" | "manual" | null>(location.state?.method || null);
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { getOrCreateIngredient } = useIngredients();

  const handleImageUpload = async (file: File) => {
    setImageFile(file);

    if (method === "photo") {
      setScanning(true);
      try {
        // Convert image to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;

          const { data, error } = await supabase.functions.invoke('scan-recipe-image', {
            body: { imageBase64: base64 }
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          const recipe = data.recipe;
          setTitle(recipe.title || "");
          setDescription(recipe.description || "");
          setDifficulty(recipe.difficulty || "");
          setPrepTime(recipe.prep_time?.toString() || "");
          setCookTime(recipe.cook_time?.toString() || "");
          setServings(recipe.servings?.toString() || "");
          setCategory(recipe.category || "");
          setSteps(recipe.instructions || "");

          // Format ingredients
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
          setMethod("manual");
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        console.error('Scan error:', error);
        toast({
          title: "Erreur",
          description: error.message || "Échec du scan de la recette",
          variant: "destructive",
        });
      } finally {
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
      // Upload image if exists
      let imageUrl = null;
      if (imageFile) {
        const { url, error: uploadError } = await uploadFile('recipe-images', imageFile, user.id);
        if (uploadError) throw uploadError;
        imageUrl = url;
      }

      // Create recipe
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

      // Parse and add ingredients
      const ingredientLines = ingredients.split('\n').filter(line => line.trim());
      for (const line of ingredientLines) {
        // Simple parsing: "quantity unit name"
        const parts = line.trim().split(' ');
        if (parts.length < 2) continue;

        const quantity = parseFloat(parts[0]) || 1;
        const unit = parts[1];
        const name = parts.slice(2).join(' ') || parts[1];

        // Get or create ingredient
        const { data: ingredient } = await getOrCreateIngredient(name);
        if (!ingredient) continue;

        // Add to recipe_ingredients
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
      navigate("/recipes");
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

  if (!method) {
    return (
      <div className="pb-20 min-h-screen">
        <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
          <h1 className="text-2xl font-bold">Ajouter une nouvelle recette</h1>
          <p className="text-sm opacity-90 mt-1">Choisissez comment ajouter votre recette</p>
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
                    <h3 className="font-semibold mb-1">Depuis une photo (IA)</h3>
                    <p className="text-sm text-muted-foreground">
                      Téléchargez une photo de recette et laissez l'IA extraire les détails
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
        </section>
      </div>
    );
  }

  if (method === "photo" && !title) {
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
            <h1 className="text-2xl font-bold">Ajouter depuis une photo</h1>
          </div>
        </header>

        <section className="px-6 mt-6">
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

          <p className="text-xs text-muted-foreground text-center mt-4">
            Nous utiliserons l'IA pour détecter et extraire les informations de la recette à partir de votre image
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
          <h1 className="text-2xl font-bold">Détails de la recette</h1>
        </div>
      </header>

      <section className="px-6 mt-6 pb-6">
        <Card>
          <CardContent className="p-4 space-y-4">
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
                    <SelectItem value="easy">Facile</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="hard">Difficile</SelectItem>
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
                    <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                    <SelectItem value="lunch">Déjeuner</SelectItem>
                    <SelectItem value="dinner">Dîner</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="snack">En-cas</SelectItem>
                    <SelectItem value="vegetarian">Végétarien</SelectItem>
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
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={saving}
          >
            {saving ? "Sauvegarde..." : "Sauvegarder la recette"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/recipes")}
            className="w-full"
          >
            Annuler
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AddRecipeWithAI;
