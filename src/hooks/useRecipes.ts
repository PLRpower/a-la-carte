import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, RecipeWithDetails, RecipeCategory, RecipeDifficulty } from '@/types/database';
import { useAuth } from './useAuth';

interface RecipeFilters {
  category?: RecipeCategory | string;
  difficulty?: RecipeDifficulty;
  searchQuery?: string;
}

export const useRecipes = (filters?: RecipeFilters) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { category, difficulty, searchQuery } = filters || {};

  const queryKey = ['recipes', user?.id, category, difficulty];

  const { data: allRecipes = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients(
            id,
            quantity,
            unit,
            name,
            ingredient:ingredients(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (category) {
        const categories = category.includes(',') ? category.split(',') : [category];
        query = query.overlaps('tags', categories);
      }

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check if recipes are favorited by current user
      const { data: favorites } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user.id);

      const favoritedIds = new Set(favorites?.map(f => f.recipe_id) || []);

      return data.map(recipe => ({
        ...recipe,
        is_favorited: favoritedIds.has(recipe.id)
      })) as RecipeWithDetails[];
    },
    enabled: !!user,
  });

  const createRecipeMutation = useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('No user');
      const { data, error } = await supabase
        .from('recipes')
        .insert({ ...recipe, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  const updateRecipeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Recipe> }) => {
      const { error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      if (!user) throw new Error('No user');

      const recipe = allRecipes.find(r => r.id === recipeId);

      if (recipe?.is_favorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, recipe_id: recipeId });
        if (error) throw error;
      }
    },
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousRecipes = queryClient.getQueryData<RecipeWithDetails[]>(queryKey);

      queryClient.setQueryData<RecipeWithDetails[]>(queryKey, (old) =>
        old?.map(r => r.id === recipeId ? { ...r, is_favorited: !r.is_favorited } : r)
      );

      return { previousRecipes };
    },
    onError: (err, recipeId, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(queryKey, context.previousRecipes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const createRecipe = async (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await createRecipeMutation.mutateAsync(recipe);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      await updateRecipeMutation.mutateAsync({ id, updates });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await deleteRecipeMutation.mutateAsync(id);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    try {
      await toggleFavoriteMutation.mutateAsync(recipeId);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const normalizeText = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const recipes = searchQuery && allRecipes
    ? allRecipes.filter(recipe =>
      normalizeText(recipe.title).includes(normalizeText(searchQuery))
    )
    : allRecipes;

  return {
    recipes,
    allRecipes, // Also export all recipes
    loading,
    error: error as Error | null,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['recipes'] })
  };
};
