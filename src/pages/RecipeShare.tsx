import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecipeForm, RecipeFormData } from "@/components/RecipeForm";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { uploadFile } from "@/lib/supabase-storage";
import { parseIngredientInput, findBestIngredientMatch } from "@/lib/ingredient-parser";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecipeShare = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { ingredients: allIngredients } = useIngredients();

    const [loading, setLoading] = useState(false);
    const [scrapedData, setScrapedData] = useState<Partial<RecipeFormData>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let sharedUrl = searchParams.get('url');
        const sharedTitle = searchParams.get('title');
        const sharedText = searchParams.get('text');

        // On mobile, the URL is often shared in the 'text' field instead of 'url'
        if (!sharedUrl && sharedText) {
            const urlMatch = sharedText.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
                sharedUrl = urlMatch[0];
            }
        }

        if (sharedUrl) {
            setLoading(true);
            const scrapeRecipe = async () => {
                try {
                    console.log("Scraping recipe from URL:", sharedUrl);
                    const { data, error } = await supabase.functions.invoke('scrape-recipe', {
                        body: { url: sharedUrl }
                    });

                    if (error) throw error;
                    if (data?.error) throw new Error(data.error);
                    if (!data?.recipe) throw new Error("Aucune donnée de recette reçue");

                    const recipe = data.recipe;

                    let ingredientsText = "";
                    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                        ingredientsText = recipe.ingredients
                            .map((ing: any) => ing.name || ing)
                            .join("\n");
                    }

                    setScrapedData({
                        title: recipe.title || sharedTitle || "",
                        description: recipe.description || sharedText || "",
                        difficulty: recipe.difficulty || "",
                        prepTime: recipe.prep_time?.toString() || "",
                        cookTime: recipe.cook_time?.toString() || "",
                        servings: recipe.servings?.toString() || "",
                        category: recipe.category || "",
                        steps: recipe.instructions || "",
                        ingredients: ingredientsText,
                    });

                    setLoading(false);
                } catch (scrapeError: any) {
                    console.error('Scrape error:', scrapeError);
                    setError("Impossible d'extraire la recette de cette page. Veuillez compléter manuellement.");
                    setLoading(false);
                    // Still set the title so user can edit manually
                    setScrapedData({
                        title: sharedTitle || "",
                        description: sharedText || ""
                    });
                }
            };

            scrapeRecipe();
        } else {
            // No URL shared, redirect to manual entry
            navigate("/recipes/add");
        }
    }, [searchParams, navigate]);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
                    <h1 className="text-2xl font-bold">Importation en cours...</h1>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Extraction de la recette...</h2>
                    <p className="text-muted-foreground max-w-md">
                        Notre chef IA analyse la page web pour extraire les ingrédients et les étapes de préparation. Cela peut prendre quelques secondes.
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
                        Recette partagée
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
                    initialData={scrapedData}
                    onSubmit={handleSave}
                    onCancel={() => navigate("/recipes")}
                    isSubmitting={saving}
                />
            </div>
        </div>
    );
};

export default RecipeShare;
