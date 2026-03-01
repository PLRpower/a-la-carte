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
                    .select('*')
                    .order('created_at', { ascending: false });

                if (stockError) throw stockError;
                if (!stockItems || stockItems.length === 0) return [];

                const ingredientIds = [...new Set(stockItems.map((item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => item.ingredient_id))];
                const { data: ingredients, error: ingredientsError } = await supabase
                    .from('ingredients')
                    .select('*')
                    .in('id', ingredientIds);

                if (ingredientsError) throw ingredientsError;

                const ingredientsMap = new Map(ingredients?.map((ing: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => [ing.id, ing]));

                return stockItems.map((item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({
                    ...item,
                    ingredient: ingredientsMap.get(item.ingredient_id)
                }));
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
