import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecipeForm, RecipeFormData } from "@/components/RecipeForm";
import { useAuth } from "@/hooks/useAuth";
import { useIngredients } from "@/hooks/useIngredients";
import { uploadFile } from "@/lib/supabase-storage";
import { parseIngredientInput, findBestIngredientMatch } from "@/lib/ingredient-parser";
import { Recipe, RecipeCategory, RecipeDifficulty, RecipeSource, MeasurementUnit } from "@/types/database";
import {useRecipes} from "@/hooks/useRecipes.ts";
import {ArrowLeft, Loader2, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";

interface RecipeIngredientWithRelation {
    quantity: number | null;
    unit: MeasurementUnit | null;
    name: string | null;
    ingredient: {
        name: string;
    } | null;
}

const RecipeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { ingredients: allIngredients } = useIngredients();
    const { deleteRecipe } = useRecipes();

    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<Partial<RecipeFormData>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
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

                if (error) {
                    console.error('Error fetching recipe:', error);
                    setError("Impossible de charger la recette.");
                    setLoading(false);
                    return;
                }
                const recipe = data as Recipe & { recipe_ingredients: RecipeIngredientWithRelation[] };
// ... rest of the logic

                let ingredientsText = "";
                if (recipe.recipe_ingredients && Array.isArray(recipe.recipe_ingredients)) {
                    ingredientsText = recipe.recipe_ingredients
                        .map((ri) => {
                            const unit = ri.unit === 'piece' ? '' : (ri.unit || '');
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
                    tags: recipe.tags || (recipe.category ? [recipe.category] : []),
                    steps: recipe.instructions || "",
                    ingredients: ingredientsText,
                    imageUrl: recipe.image_url,
                    source: recipe.source || null,
                });
            } catch (err: unknown) {
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
                const uploadResult = await uploadFile('recipe-images', formData.imageFile, user.id);
                if (uploadResult.error) {
                    toast({
                        title: "Erreur",
                        description: "Échec du téléchargement de l'image",
                        variant: "destructive",
                    });
                    setSaving(false);
                    return;
                }
                imageUrl = uploadResult.url;
            }

            const { error: recipeError } = await supabase
                .from('recipes')
                .update({
                    title: formData.title,
                    description: formData.description,
                    difficulty: (formData.difficulty || null) as RecipeDifficulty | null,
                    prep_time: formData.prepTime ? parseInt(formData.prepTime) : null,
                    cook_time: formData.cookTime ? parseInt(formData.cookTime) : null,
                    servings: formData.servings ? parseInt(formData.servings) : null,
                    category: (formData.tags?.[0] || null) as RecipeCategory | null,
                    tags: formData.tags || [],
                    instructions: formData.steps,
                    image_url: imageUrl,
                    source: (formData.source || null) as RecipeSource | null,
                })
                .eq('id', id);

            if (recipeError) {
                toast({
                    title: "Erreur",
                    description: "Impossible de mettre à jour la recette",
                    variant: "destructive",
                });
                setSaving(false);
                return;
            }

            // Delete existing ingredients
            const { error: deleteError } = await supabase
                .from('recipe_ingredients')
                .delete()
                .eq('recipe_id', id);

            if (deleteError) {
                toast({
                    title: "Erreur",
                    description: "Impossible de mettre à jour les ingrédients",
                    variant: "destructive",
                });
                setSaving(false);
                return;
            }

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

                await supabase.from('recipe_ingredients').insert([{
                    recipe_id: id,
                    ingredient_id: ingredientId,
                    name: parsedName,
                    quantity: quantity || 1,
                    unit: (unit || 'piece') as MeasurementUnit,
                }]);
            }

            toast({
                title: "Recette modifiée !",
                description: "Votre recette a été mise à jour avec succès",
            });
            navigate(`/recipe/${id}`);
        } catch (error: unknown) {
            console.error('Save error:', error);
            const errorMessage = error instanceof Error ? error.message : "Échec de la modification de la recette";
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette recette ? Cette action est irréversible.")) {
            setDeleting(true);
            const { error: deleteError } = await deleteRecipe(id);

            if (deleteError) {
                const errorMessage = deleteError instanceof Error ? deleteError.message : "Impossible de supprimer la recette";
                toast({
                    title: "Erreur",
                    description: errorMessage,
                    variant: "destructive",
                });
                setDeleting(false);
                return;
            }

            toast({
                title: "Recette supprimée",
                description: "La recette a été supprimée avec succès",
            });
            navigate('/recipes');
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
        <div className="min-h-screen bg-background pb-20 md:pb-12">
            <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 md:px-8 sticky top-0 md:top-16 z-10 md:rounded-2xl md:my-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary-foreground hover:text-primary-foreground/80 -ml-2"
                        onClick={() => navigate(`/recipe/${id}`, { replace: true })}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold">Modifier la recette</h1>
                </div>
            </header>

            <div className="px-6 py-8 max-w-4xl mx-auto">
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

                <div className="mt-12 pt-6 border-t border-border">
                    <h2 className="text-lg font-semibold text-destructive mb-2">Zone de danger</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        La suppression de la recette est définitive et supprimera également les images associées.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={handleDelete}
                        disabled={saving || deleting}
                    >
                        {deleting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Supprimer la recette
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RecipeEdit;
