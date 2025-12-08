import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecipeForm, RecipeFormData } from "@/components/RecipeForm";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { uploadFile } from "@/lib/supabase-storage";
import { parseIngredientInput, findBestIngredientMatch } from "@/lib/ingredient-parser";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecipeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { ingredients: allIngredients } = useIngredients();

    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<Partial<RecipeFormData>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) return;
            try {
                const { data: recipe, error } = await supabase
                    .from('recipes')
                    .select(`
            *,
            recipe_ingredients (
              quantity,
              unit,
              name,
              ingredient:ingredients (
                name
              )
            )
          `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                let ingredientsText = "";
                if (recipe.recipe_ingredients && Array.isArray(recipe.recipe_ingredients)) {
                    ingredientsText = recipe.recipe_ingredients
                        .map((ri: any) => {
                            const unit = ri.unit === 'piece' ? '' : ri.unit;
                            const quantity = ri.quantity || '';
                            // Prioritize the saved name, fallback to linked ingredient name
                            const name = ri.name || ri.ingredient?.name || '';
                            return `${quantity} ${unit} ${name}`.trim();
                        })
                        .join("\n");
                }

                setInitialData({
                    title: recipe.title,
                    description: recipe.description || "",
                    difficulty: recipe.difficulty || "",
                    prepTime: recipe.prep_time?.toString() || "",
                    cookTime: recipe.cook_time?.toString() || "",
                    servings: recipe.servings?.toString() || "",
                    category: recipe.category || "",
                    steps: recipe.instructions || "",
                    ingredients: ingredientsText,
                    imageUrl: recipe.image_url
                });
            } catch (err: any) {
                console.error('Error fetching recipe:', err);
                setError("Impossible de charger la recette.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    const handleSave = async (formData: RecipeFormData) => {
        if (!user || !id) return;

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
            let imageUrl = formData.imageUrl;
            if (formData.imageFile) {
                const { url, error: uploadError } = await uploadFile('recipe-images', formData.imageFile, user.id);
                if (uploadError) throw uploadError;
                imageUrl = url;
            }

            const { error: recipeError } = await supabase
                .from('recipes')
                .update({
                    title: formData.title,
                    description: formData.description,
                    difficulty: formData.difficulty as any || null,
                    prep_time: formData.prepTime ? parseInt(formData.prepTime) : null,
                    cook_time: formData.cookTime ? parseInt(formData.cookTime) : null,
                    servings: formData.servings ? parseInt(formData.servings) : null,
                    category: formData.category as any || null,
                    instructions: formData.steps,
                    image_url: imageUrl,
                })
                .eq('id', id);

            if (recipeError) throw recipeError;

            // Delete existing ingredients
            const { error: deleteError } = await supabase
                .from('recipe_ingredients')
                .delete()
                .eq('recipe_id', id);

            if (deleteError) throw deleteError;

            // Add new ingredients
            const ingredientLines = formData.ingredients.split('\n').filter(line => line.trim());
            for (const line of ingredientLines) {
                const { name: parsedName, quantity, unit } = parseIngredientInput(line);
                if (!parsedName) continue;

                let ingredientId: string | null = null;
                const match = findBestIngredientMatch(parsedName, allIngredients);

                if (match) {
                    ingredientId = match.id;
                }
                // If no match, we just save the name without an ingredient_id

                await supabase.from('recipe_ingredients').insert([{
                    recipe_id: id,
                    ingredient_id: ingredientId,
                    name: parsedName,
                    quantity: quantity || 1,
                    unit: unit as any,
                }]);
            }

            toast({
                title: "Recette modifiée !",
                description: "Votre recette a été mise à jour avec succès",
            });
            navigate(`/recipe/${id}`);
        } catch (error: any) {
            console.error('Save error:', error);
            toast({
                title: "Erreur",
                description: error.message || "Échec de la modification de la recette",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                        onClick={() => navigate(`/recipe/${id}`)}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold">Modifier la recette</h1>
                </div>
            </header>

            <div className="px-6 py-8">
                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}
                <RecipeForm
                    initialData={initialData}
                    onSubmit={handleSave}
                    onCancel={() => navigate(`/recipe/${id}`)}
                    isSubmitting={saving}
                    submitLabel="Mettre à jour"
                />
            </div>
        </div>
    );
};

export default RecipeEdit;
