import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, RecipeWithDetails, RecipeCategory, RecipeDifficulty } from '@/types/database';
import { useAuth } from './useAuth';

interface RecipeFilters {
  category?: RecipeCategory;
  difficulty?: RecipeDifficulty;
  searchQuery?: string;
}

export const useRecipes = (filters?: RecipeFilters) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, [filters, user]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients(
            id,
            quantity,
            unit,
            notes,
            ingredient:ingredients(*)
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.searchQuery) {
        query = query.ilike('title', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check if recipes are favorited by current user
      if (user) {
        const { data: favorites } = await supabase
          .from('favorites')
          .select('recipe_id')
          .eq('user_id', user.id);

        const favoritedIds = new Set(favorites?.map(f => f.recipe_id) || []);
        
        const recipesWithFavorites = data.map(recipe => ({
          ...recipe,
          is_favorited: favoritedIds.has(recipe.id)
        }));

        setRecipes(recipesWithFavorites);
      } else {
        setRecipes(data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createRecipe = async (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({ ...recipe, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      await fetchRecipes();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchRecipes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchRecipes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!user) return { error: new Error('No user') };

    try {
      const recipe = recipes.find(r => r.id === recipeId);
      
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

      await fetchRecipes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { 
    recipes, 
    loading, 
    error, 
    createRecipe, 
    updateRecipe, 
    deleteRecipe,
    toggleFavorite,
    refetch: fetchRecipes 
  };
};
