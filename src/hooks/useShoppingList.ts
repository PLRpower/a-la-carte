import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingListItem, ShoppingListItemWithIngredient, MeasurementUnit } from '@/types/database';
import { parseIngredientInput } from '@/lib/ingredient-parser';
import { useAuth } from './useAuth';

export const useShoppingList = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingListItemWithIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    fetchShoppingList();

    // Set up real-time subscription
    const channel = supabase
      .channel('shopping-list-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_list',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchShoppingList(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchShoppingList = async (silent = false) => {
    if (!user) return;

    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('shopping_list')
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data as ShoppingListItemWithIngredient[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const addSmartItem = async (input: string) => {
    if (!user) return { error: new Error('No user') };

    const { name, quantity, unit } = parseIngredientInput(input);

    const tempId = crypto.randomUUID();
    const optimisticItem: ShoppingListItemWithIngredient = {
      id: tempId,
      user_id: user.id,
      name,
      quantity: quantity || null,
      unit: unit || null,
      ingredient_id: null,
      checked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ingredient: null
    };

    // Optimistic update
    setItems(prev => [optimisticItem, ...prev]);

    try {
      let finalIngredientId: string | null = null;

      // Try to find ingredient by name or synonym using direct query
      // We search for exact match on name OR name in synonyms array
      const { data: matchedIngredients, error: matchError } = await supabase
        .from('ingredients')
        .select('id, name, synonyms')
        .or(`name.ilike.${name},synonyms.cs.{${name}}`)
        .limit(1);

      if (!matchError && matchedIngredients && matchedIngredients.length > 0) {
        finalIngredientId = (matchedIngredients[0] as any).id;
      }

      const { data, error } = await supabase
        .from('shopping_list')
        .insert({
          user_id: user.id,
          name,
          quantity,
          unit,
          ingredient_id: finalIngredientId,
          checked: false
        })
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .single();

      if (error) throw error;

      // Replace optimistic item with real one
      setItems(prev => prev.map(item => item.id === tempId ? (data as ShoppingListItemWithIngredient) : item));
      return { error: null };
    } catch (err) {
      // Rollback
      setItems(prev => prev.filter(item => item.id !== tempId));
      return { error: err as Error };
    }
  };

  const updateItem = async (id: string, updates: Partial<ShoppingListItem>) => {
    // Optimistic update
    const previousItems = [...items];
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

    try {
      const { error } = await supabase
        .from('shopping_list')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      // Rollback
      setItems(previousItems);
      return { error: err as Error };
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    return updateItem(id, { checked });
  };

  const deleteItem = async (id: string) => {
    // Optimistic update
    const previousItems = [...items];
    setItems(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      // Rollback
      setItems(previousItems);
      return { error: err as Error };
    }
  };

  const clearCheckedItems = async () => {
    if (!user) return { error: new Error('No user') };

    // Optimistic update
    const previousItems = [...items];
    setItems(prev => prev.filter(item => !item.checked));

    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('user_id', user.id)
        .eq('checked', true);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      // Rollback
      setItems(previousItems);
      return { error: err as Error };
    }
  };

  return {
    items,
    loading,
    error,
    addSmartItem,
    updateItem,
    toggleItem,
    deleteItem,
    clearCheckedItems,
    refetch: () => fetchShoppingList(false)
  };
};
