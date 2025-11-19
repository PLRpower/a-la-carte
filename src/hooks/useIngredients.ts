import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ingredient, IngredientCategory } from '@/types/database';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      setIngredients(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const searchIngredients = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(10);

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const getOrCreateIngredient = async (name: string, category?: IngredientCategory) => {
    try {
      // First, try to find existing ingredient
      const { data: existing, error: searchError } = await supabase
        .from('ingredients')
        .select('*')
        .ilike('name', name)
        .single();

      if (existing) {
        return { data: existing, error: null };
      }

      // If not found, create new ingredient
      const { data, error } = await supabase
        .from('ingredients')
        .insert({ name, category })
        .select()
        .single();

      if (error) throw error;
      
      await fetchIngredients();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  return { 
    ingredients, 
    loading, 
    error, 
    searchIngredients,
    getOrCreateIngredient,
    refetch: fetchIngredients 
  };
};
