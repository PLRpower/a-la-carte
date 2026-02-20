import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ingredient, IngredientCategory } from '@/types/database';

export const useIngredients = () => {
  const queryClient = useQueryClient();

  const { data: ingredients = [], isLoading: loading, error } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Ingredient[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const searchIngredients = async (query: string) => {
    try {
      const { data, error } = await supabase
        .rpc('search_ingredients_with_synonyms', { _query: query });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const getOrCreateIngredientMutation = useMutation({
    mutationFn: async ({ name, category }: { name: string; category?: IngredientCategory }) => {
      const trimmedName = name.trim();
      const { data, error } = await supabase
        .rpc('get_or_create_ingredient', {
          _name: trimmedName,
          _category: category || 'autre'
        })
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });

  const getOrCreateIngredient = async (name: string, category?: IngredientCategory) => {
    try {
      const data = await getOrCreateIngredientMutation.mutateAsync({ name, category });
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  return {
    ingredients,
    loading,
    error: error as Error | null,
    searchIngredients,
    getOrCreateIngredient,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] })
  };
};
