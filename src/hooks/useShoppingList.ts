import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingListItem, ShoppingListItemWithIngredient, Ingredient } from '@/types/database';
import { parseIngredientInput } from '@/lib/ingredient-parser';
import { useAuth } from './useAuth';

export const useShoppingList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading: loading, error } = useQuery({
    queryKey: ['shopping-list', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('shopping_list')
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShoppingListItemWithIngredient[];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

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
          queryClient.invalidateQueries({ queryKey: ['shopping-list', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const addSmartItemMutation = useMutation({
    mutationFn: async (input: string) => {
      if (!user) throw new Error('No user');

      const { name, quantity, unit } = parseIngredientInput(input);
      let finalIngredientId: string | null = null;

      // Fetch all ingredients to perform smart matching
      const ingredients = await queryClient.ensureQueryData({
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
      });

      // Client-side matching logic
      // We look for the longest ingredient name/synonym that is contained in the input
      const lowerInput = name.toLowerCase();
      let bestMatch: Ingredient | null = null;
      let maxLen = -1;

      for (const ing of ingredients) {
        // Check name
        if (lowerInput.includes(ing.name.toLowerCase())) {
          if (ing.name.length > maxLen) {
            maxLen = ing.name.length;
            bestMatch = ing;
          }
        }
        // Check synonyms
        if (ing.synonyms) {
          for (const syn of ing.synonyms) {
            if (lowerInput.includes(syn.toLowerCase())) {
              if (syn.length > maxLen) {
                maxLen = syn.length;
                bestMatch = ing;
              }
            }
          }
        }
      }

      if (bestMatch) {
        finalIngredientId = bestMatch.id;
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
      return data as ShoppingListItemWithIngredient;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-list', user?.id] });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(['shopping-list', user?.id]);

      const { name, quantity, unit } = parseIngredientInput(input);
      const optimisticItem: ShoppingListItemWithIngredient = {
        id: crypto.randomUUID(),
        user_id: user!.id,
        name,
        quantity: quantity || null,
        unit: unit || null,
        ingredient_id: null,
        checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ingredient: null
      };

      queryClient.setQueryData(['shopping-list', user?.id], (old: ShoppingListItemWithIngredient[] = []) => [optimisticItem, ...old]);

      return { previousItems };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['shopping-list', user?.id], context?.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase
        .from('shopping_list')
        .update({ checked })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-list', user?.id] });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(['shopping-list', user?.id]);

      queryClient.setQueryData(['shopping-list', user?.id], (old: ShoppingListItemWithIngredient[] = []) =>
        old.map(item => item.id === id ? { ...item, checked } : item)
      );

      return { previousItems };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['shopping-list', user?.id], context?.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-list', user?.id] });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(['shopping-list', user?.id]);

      queryClient.setQueryData(['shopping-list', user?.id], (old: ShoppingListItemWithIngredient[] = []) =>
        old.filter(item => item.id !== id)
      );

      return { previousItems };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['shopping-list', user?.id], context?.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
    },
  });

  const clearCheckedItemsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('user_id', user.id)
        .eq('checked', true);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['shopping-list', user?.id] });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(['shopping-list', user?.id]);

      queryClient.setQueryData(['shopping-list', user?.id], (old: ShoppingListItemWithIngredient[] = []) =>
        old.filter(item => !item.checked)
      );

      return { previousItems };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['shopping-list', user?.id], context?.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
    },
  });

  const finishShoppingMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      // 1. Get checked items
      const { data: checkedItems, error: fetchError } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', user.id)
        .eq('checked', true);

      if (fetchError) throw fetchError;
      if (!checkedItems || checkedItems.length === 0) return;

      // 2. Process each item
      for (const item of checkedItems) {
        let targetIngredientId = item.ingredient_id;

        // If no ingredient linked, try to find/create one
        if (!targetIngredientId) {
          // Try to find by name
          const { data: found } = await supabase
            .from('ingredients')
            .select('id')
            .ilike('name', item.name)
            .maybeSingle();

          if (found) {
            targetIngredientId = found.id;
          } else {
            // Create new ingredient
            const { data: newIng } = await supabase
              .from('ingredients')
              .insert({ name: item.name, category: 'other' })
              .select('id')
              .single();

            if (newIng) targetIngredientId = newIng.id;
          }
        }

        if (targetIngredientId) {
          // Check if exists in stock
          const { data: existingStock } = await supabase
            .from('stock')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('ingredient_id', targetIngredientId)
            .maybeSingle();

          if (existingStock) {
            // Update stock
            await supabase
              .from('stock')
              .update({
                quantity: Number(existingStock.quantity) + (Number(item.quantity) || 0),
                updated_at: new Date().toISOString()
              })
              .eq('id', existingStock.id);
          } else {
            // Insert into stock
            await supabase
              .from('stock')
              .insert({
                user_id: user.id,
                ingredient_id: targetIngredientId,
                quantity: Number(item.quantity) || 0,
                unit: item.unit || 'piece',
                low_stock: false
              });
          }
        }
      }

      // 3. Delete checked items
      const { error: deleteError } = await supabase
        .from('shopping_list')
        .delete()
        .eq('user_id', user.id)
        .eq('checked', true);

      if (deleteError) throw deleteError;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['shopping-list', user?.id] });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(['shopping-list', user?.id]);

      // Optimistically remove checked items
      queryClient.setQueryData(['shopping-list', user?.id], (old: ShoppingListItemWithIngredient[] = []) =>
        old.filter(item => !item.checked)
      );

      return { previousItems };
    },
    onSuccess: () => {
      // Invalidate both shopping list and stock as items moved there
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['stock', user?.id] });
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['shopping-list', user?.id], context?.previousItems);
    },
  });

  // Wrapper functions to match original interface
  const addSmartItem = async (input: string) => {
    try {
      await addSmartItemMutation.mutateAsync(input);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    try {
      await toggleItemMutation.mutateAsync({ id, checked });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteItemMutation.mutateAsync(id);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const clearCheckedItems = async () => {
    try {
      await clearCheckedItemsMutation.mutateAsync();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const finishShopping = async () => {
    try {
      await finishShoppingMutation.mutateAsync();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    items,
    loading,
    error: error as Error | null,
    addSmartItem,
    toggleItem,
    deleteItem,
    clearCheckedItems,
    finishShopping,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] })
  };
};
