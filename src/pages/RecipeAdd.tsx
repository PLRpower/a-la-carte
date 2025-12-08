import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecipeForm, RecipeFormData } from "@/components/RecipeForm";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { uploadFile } from "@/lib/supabase-storage";
import { parseIngredientInput, findBestIngredientMatch } from "@/lib/ingredient-parser";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecipeAdd = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { ingredients: allIngredients } = useIngredients();

    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState<Partial<RecipeFormData>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const file = location.state?.file as File;
        if (file) {
            setScanning(true);
            const scanImage = async () => {
                try {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64 = reader.result as string;

                        try {
                            console.log("Calling scan-recipe-image function...");
                            const { data, error } = await supabase.functions.invoke('scan-recipe-image', {
                                body: { imageBase64: base64 }
                            });

                            if (error) throw error;
                            if (data?.error) throw new Error(data.error);
                            if (!data?.recipe) throw new Error("Aucune donnée de recette reçue");

                            const recipe = data.recipe;

                            let ingredientsText = "";
                            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                                ingredientsText = recipe.ingredients
                                    .map((ing: any) => ing.name)
                                    .join("\n");
                            }

                            setScannedData({
                                title: recipe.title || "",
                                description: recipe.description || "",
                                difficulty: recipe.difficulty || "",
                                prepTime: recipe.prep_time?.toString() || "",
                                cookTime: recipe.cook_time?.toString() || "",
                                servings: recipe.servings?.toString() || "",
                                category: recipe.category || "",
                                steps: recipe.instructions || "",
                                ingredients: ingredientsText,
                                imageFile: file
                            });

                            setScanning(false);
                        } catch (scanError: any) {
                            console.error('Scan processing error:', scanError);
                            setError("L'IA n'a pas pu extraire toutes les données. Veuillez compléter manuellement.");
                            setScanning(false);
                            // Still set the file so user can edit manually
                            setScannedData({ imageFile: file });
                        }
                    };
                    reader.readAsDataURL(file);
                } catch (err: any) {
                    console.error('File reading error:', err);
                    setError("Impossible de lire le fichier image.");
                    setScanning(false);
                }
            };

            scanImage();
        }
    }, [location.state]);

    const handleSave = async (formData: RecipeFormData) => {
        if (!user) return;

        if (!formData.title || !formData.ingredients || !formData.steps) {
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
            if (formData.imageFile) {
                const { url, error: uploadError } = await uploadFile('recipe-images', formData.imageFile, user.id);
                if (uploadError) throw uploadError;
                imageUrl = url;
            }

            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .insert([{
                    user_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    difficulty: formData.difficulty as any || null,
                    prep_time: formData.prepTime ? parseInt(formData.prepTime) : null,
                    cook_time: formData.cookTime ? parseInt(formData.cookTime) : null,
                    servings: formData.servings ? parseInt(formData.servings) : null,
                    category: formData.category as any || null,
                    instructions: formData.steps,
                    image_url: imageUrl,
                    is_public: true,
                }])
                .select()
                .single();

            if (recipeError) throw recipeError;

            const ingredientLines = formData.ingredients.split('\n').filter(line => line.trim());
            for (const line of ingredientLines) {
                const { name: parsedName, quantity, unit } = parseIngredientInput(line);
                if (!parsedName) continue;

                let ingredientId: string | null = null;
                const match = findBestIngredientMatch(parsedName, allIngredients);

                if (match) {
                    ingredientId = match.id;
                }

                await supabase.from('recipe_ingredients').insert([{
                    recipe_id: recipe.id,
                    ingredient_id: ingredientId,
                    name: parsedName,
                    quantity: quantity || 1,
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

    if (scanning) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
                    <h1 className="text-2xl font-bold">Analyse en cours...</h1>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Analyse de votre recette...</h2>
                    <p className="text-muted-foreground max-w-md">
                        Notre chef IA lit votre photo pour extraire les ingrédients et les étapes de préparation. Cela peut prendre quelques secondes.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 sticky top-0 z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary-foreground hover:text-primary-foreground/80 -ml-2"
                        onClick={() => navigate("/recipes")}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {location.state?.file ? "Vérifier la recette" : "Nouvelle recette"}
                    </h1>
                </div>
            </header>

            <div className="px-6 py-8">
                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}
                <RecipeForm
                    initialData={scannedData}
                    onSubmit={handleSave}
                    onCancel={() => navigate("/recipes")}
                    isSubmitting={saving}
                />
            </div>
        </div>
    );
};

export default RecipeAdd;
