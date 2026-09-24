import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecipeForm, RecipeFormData } from "@/components/RecipeForm";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { uploadFile } from "@/lib/supabase-storage";
import { parseIngredientInput, findBestIngredientMatch } from "@/lib/ingredient-parser";
import { saveRecipeIngredients } from "@/lib/recipe-helpers";
import { compressImage } from "@/utils/imageOptimizer";
import { Loader2, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecipeAdd = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { ingredients: allIngredients } = useIngredients();

    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState<Partial<RecipeFormData>>({
        source: (location.state?.source as string)
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pendingRecipes, setPendingRecipes] = useState<any[]>([]);
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const convertAiRecipeToFormData = (recipe: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, imageFile: File | null): Partial<RecipeFormData> => {
        let ingredientsText = "";
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            ingredientsText = recipe.ingredients
                .map((ing: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ing.name)
                .join("\n");
        }

        return {
            title: recipe.title || "",
            description: recipe.description || "",
            difficulty: recipe.difficulty || "",
            prepTime: recipe.prep_time?.toString() || "",
            cookTime: recipe.cook_time?.toString() || "",
            servings: recipe.servings?.toString() || "",
            tags: recipe.tags || (recipe.category ? [recipe.category] : []),
            category: recipe.category || "",
            steps: recipe.instructions || "",
            ingredients: ingredientsText,
            imageFiles: imageFile ? [imageFile] : [],
            source: (location.state?.source as string) || 'cooking_class'
        };
    };

    useEffect(() => {
        const rawFile = location.state?.file as File;
        if (rawFile) {
            setScanning(true);
            setOriginalImageFile(rawFile);

            const scanImage = async () => {
                try {
                    const file = await compressImage(rawFile, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
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

                            // Handle new array format or fallback to single
                            const recipes = data?.recipes || (data?.recipe ? [data.recipe] : []);

                            if (recipes.length === 0) throw new Error("Aucune donnée de recette reçue");

                            const firstRecipe = recipes[0];
                            const remainingRecipes = recipes.slice(1);

                            setPendingRecipes(remainingRecipes);
                            setScannedData(convertAiRecipeToFormData(firstRecipe, file));
                            setScanning(false);

                            if (remainingRecipes.length > 0) {
                                toast({
                                    title: "Plusieurs recettes détectées",
                                    description: `${recipes.length} recettes trouvées. Vous allez les vérifier une par une.`,
                                });
                            }

                        } catch (scanError: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
                            console.error('Scan processing error:', scanError);
                            setError("L'IA n'a pas pu extraire toutes les données. Veuillez compléter manuellement.");
                            setScanning(false);
                            setScannedData({ imageFiles: [file] });
                        }
                    };
                    reader.readAsDataURL(file);
                } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
                    console.error('File reading error:', err);
                    setError("Impossible de lire le fichier image.");
                    setScanning(false);
                }
            };

            scanImage();
        } else if (location.state?.prefilledRecipe) {
            setScannedData(convertAiRecipeToFormData(location.state.prefilledRecipe, null));
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
            // Upload multiple images
            let mainImageUrl = formData.imageUrl || null;
            const uploadedImageUrls: string[] = [];

            if (formData.imageFiles && formData.imageFiles.length > 0) {
                for (const file of formData.imageFiles) {
                    // If it's a new file (not just a placeholder), upload it
                    const { url, error: uploadError } = await uploadFile('recipe-images', file, user.id);
                    if (uploadError) throw uploadError;
                    uploadedImageUrls.push(url);
                }
                // Use first uploaded image as main image if none exists
                if (!mainImageUrl && uploadedImageUrls.length > 0) {
                    mainImageUrl = uploadedImageUrls[0];
                }
            }

            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .insert([{
                    user_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    difficulty: formData.difficulty as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ || null,
                    prep_time: formData.prepTime ? parseInt(formData.prepTime) : null,
                    cook_time: formData.cookTime ? parseInt(formData.cookTime) : null,
                    servings: formData.servings ? parseInt(formData.servings) : null,
                    category: (formData.tags?.[0] || null) as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
                    tags: formData.tags || [],
                    instructions: formData.steps,
                    image_url: mainImageUrl, // Main image for thumbnails
                    source: formData.source as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ || null,
                }])
                .select()
                .single();

            if (recipeError) throw recipeError;

            // Insert photos into recipe_photos table
            if (uploadedImageUrls.length > 0) {
                const photoInserts = uploadedImageUrls.map(url => ({
                    recipe_id: recipe.id,
                    url: url
                }));
                // Use upsert or insert? Insert is fine.
                const { error: photosError } = await supabase
                    .from('recipe_photos')
                    .insert(photoInserts);
                if (photosError) console.error("Error saving photos:", photosError); // Non-blocking
            }

            await saveRecipeIngredients(recipe.id, formData.ingredients, allIngredients);

            // check pending recipes
            if (pendingRecipes.length > 0) {
                toast({
                    title: "Recette sauvegardée !",
                    description: `Passage à la recette suivante (${pendingRecipes.length} restantes)...`,
                });

                const nextRecipe = pendingRecipes[0];
                const remaining = pendingRecipes.slice(1);

                // We reuse the original image file for subsequent recipes as well,
                // passing it to the form so it is uploaded/associated again.
                // Note: This means we re-upload the same file. Efficient? No. 
                // Reliable? Yes. Optimization would be to upload once, get URL, pass URL.
                // But RecipeForm expects imageFile or imageUrl.
                // Let's rely on re-upload for simplicity now or pass scannedData.imageFile
                const nextFormData = convertAiRecipeToFormData(nextRecipe, scannedData.imageFiles?.[0] || null);

                setPendingRecipes(remaining);
                setScannedData(nextFormData);
                window.scrollTo(0, 0);
            } else {
                toast({
                    title: "Recette ajoutée !",
                    description: "Toutes les recettes ont été sauvegardées.",
                });
                navigate("/recipes");
            }
        } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
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
        <div className="min-h-screen bg-background pb-20 md:pb-12">
            <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 md:px-8 sticky top-0 md:top-16 z-10 md:rounded-2xl md:my-6 shadow-xs">
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
                        {location.state?.file || location.state?.prefilledRecipe ? "Vérifier la recette" : "Nouvelle recette"}
                        {pendingRecipes.length > 0 && <span className="text-sm font-normal ml-2 opacity-80">(+{pendingRecipes.length} autres)</span>}
                    </h1>
                </div>
            </header>

            <div className="px-6 py-8 max-w-4xl mx-auto">
                {error && (
                    <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-r-lg mb-6 flex items-start gap-3 relative shadow-sm">
                        <div className="flex-1">
                            <p className="font-medium">Une erreur est survenue lors de l'analyse</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="p-1 hover:bg-destructive/20 rounded-full transition-colors"
                            aria-label="Fermer le message d'erreur"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {pendingRecipes.length > 0 && (
                    <div className="bg-primary/10 text-primary p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Il reste {pendingRecipes.length} autre(s) recette(s) détectée(s) à vérifier après celle-ci.
                    </div>
                )}

                <RecipeForm
                    initialData={scannedData}
                    onSubmit={handleSave}
                    onCancel={() => navigate("/recipes")}
                    isSubmitting={saving}
                    submitLabel={pendingRecipes.length > 0 ? "Sauvegarder et suivante" : "Sauvegarder la recette"}
                />
            </div>
        </div>
    );
};

export default RecipeAdd;
