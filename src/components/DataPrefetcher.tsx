import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Ce composant gère le préchargement proactif des données essentielles 
 * dès que l'utilisateur est authentifié. Sur mobile, cela permet d'éviter 
 * les écrans de chargement lors du premier passage d'un onglet à l'autre.
 */
export const DataPrefetcher = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        // Prefetch Recipes (General list)
        queryClient.prefetchQuery({
            queryKey: ['recipes', user.id, undefined, undefined],
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('recipes')
                    .select('*, ingredients:recipe_ingredients(id, quantity, unit, name, ingredient:ingredients(*))')
                    .order('created_at', { ascending: false });
                if (error) throw error;

                // Prefetch images for the first 5 recipes to make the initial view faster
                data.slice(0, 8).forEach(recipe => {
                    if (recipe.image_url) {
                        const img = new Image();
                        img.src = recipe.image_url;
                    }
                });

                const { data: favorites } = await supabase
                    .from('favorites')
                    .select('recipe_id')
                    .eq('user_id', user.id);
                const favoritedIds = new Set(favorites?.map(f => f.recipe_id) || []);

                return data.map(recipe => ({
                    ...recipe,
                    is_favorited: favoritedIds.has(recipe.id)
                }));
            }
        });

        // Prefetch Stock (Shared stock matching useStock hook)
        queryClient.prefetchQuery({
            queryKey: ['stock'],
            queryFn: async () => {
                const { data: stockItems, error: stockError } = await supabase
                    .from('stock')
                    .select('*, ingredient:ingredients(*)')
                    .order('created_at', { ascending: false });

                if (stockError) throw stockError;
                return (stockItems || []) as StockWithIngredient[];
            }
        });

        // Prefetch Shopping List
        queryClient.prefetchQuery({
            queryKey: ['shopping-list'],
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('shopping_list')
                    .select('*, ingredient:ingredients(*)')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                return data;
            }
        });

    }, [user, queryClient]);

    return null; // Composant invisible
};
