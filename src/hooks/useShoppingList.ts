import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingListItem, ShoppingListItemWithIngredient, MeasurementUnit } from '@/types/database';
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
          fetchShoppingList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchShoppingList = async () => {
    if (!user) return;

    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const addItem = async (
    name: string,
    quantity?: number,
    unit?: MeasurementUnit,
    ingredientId?: string
  ) => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('shopping_list')
        .insert({
          user_id: user.id,
          name,
          quantity,
          unit,
          ingredient_id: ingredientId,
          checked: false
        });

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateItem = async (id: string, updates: Partial<ShoppingListItem>) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    return updateItem(id, { checked });
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const clearCheckedItems = async () => {
    if (!user) return { error: new Error('No user') };

    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('user_id', user.id)
        .eq('checked', true);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { 
    items, 
    loading, 
    error, 
    addItem, 
    updateItem, 
    toggleItem,
    deleteItem,
    clearCheckedItems,
    refetch: fetchShoppingList 
  };
};
