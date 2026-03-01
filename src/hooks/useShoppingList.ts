import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingListItem, ShoppingListItemWithIngredient, Ingredient } from '@/types/database';
import { parseIngredientInput, findBestIngredientMatch } from '@/lib/ingredient-parser';
import { useAuth } from './useAuth';

const queryKey = ['shopping-list'];

export const useShoppingList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('shopping_list')
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        // .eq('user_id', user.id) // Removed to share list
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
          // filter: `user_id=eq.${user.id}` // Removed filter
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
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

      const ingredients = await queryClient.ensureQueryData({
        queryKey: ['ingredients'],
        queryFn: async () => {
          const { data, error } = await supabase.from('ingredients').select('*').order('name');
          if (error) throw error;
          return data as Ingredient[];
        },
        staleTime: 1000 * 60 * 60 * 24,
      });

      const bestMatch = findBestIngredientMatch(name, ingredients);
      if (bestMatch) finalIngredientId = bestMatch.id;

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
        .select(`*, ingredient:ingredients(*)`)
        .single();

      if (error) throw error;
      return data as ShoppingListItemWithIngredient;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(queryKey);

      const { name, quantity, unit } = parseIngredientInput(input);
      const tempId = crypto.randomUUID();
      const newItem: ShoppingListItemWithIngredient = {
        id: tempId,
        user_id: user?.id || '',
        name,
        quantity: quantity || null,
        unit: unit || null,
        ingredient_id: null,
        checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ingredient: null
      };

      queryClient.setQueryData<ShoppingListItemWithIngredient[]>(queryKey, (old) => [newItem, ...(old || [])]);
      return { previousItems };
    },
    onError: (err, newItem, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase.from('shopping_list').update({ checked }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(queryKey);

      queryClient.setQueryData<ShoppingListItemWithIngredient[]>(queryKey, (old) =>
        old?.map((item) => (item.id === id ? { ...item, checked } : item))
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shopping_list').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(queryKey);

      queryClient.setQueryData<ShoppingListItemWithIngredient[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== id)
      );

      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShoppingListItem> }) => {
      if (updates.name) {
        const ingredients = await queryClient.ensureQueryData({
          queryKey: ['ingredients'],
          queryFn: async () => {
            const { data, error } = await supabase.from('ingredients').select('*').order('name');
            if (error) throw error;
            return data as Ingredient[];
          },
          staleTime: 1000 * 60 * 60 * 24,
        });

        const bestMatch = findBestIngredientMatch(updates.name, ingredients);
        updates.ingredient_id = bestMatch?.id || null;
      }

      const { error } = await supabase.from('shopping_list').update(updates).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(queryKey);

      queryClient.setQueryData<ShoppingListItemWithIngredient[]>(queryKey, (old) =>
        old?.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const clearCheckedItemsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');
      const { error } = await supabase.from('shopping_list').delete().eq('checked', true);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItemWithIngredient[]>(queryKey);

      queryClient.setQueryData<ShoppingListItemWithIngredient[]>(queryKey, (old) =>
        old?.filter((item) => !item.checked)
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const finishShoppingMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      // 1. Get checked items (GLOBAL)
      const { data: checkedItems, error: fetchError } = await supabase
        .from('shopping_list')
        .select('*')
        // .eq('user_id', user.id) // Removed to process ALL checked items
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
              .insert({ name: item.name, category: 'autre' })
              .select('id')
              .single();

            if (newIng) targetIngredientId = newIng.id;
          }
        }

        if (targetIngredientId) {
          // Check if exists in stock (GLOBAL check, not just my user_id?
          // If stock is shared, we should check if ANYONE has it?
          // But stock table still has user_id. We probably want to consolidate.
          // For now, let's just add it to the current user's stock (who clicked "Finish")
          // OR if we want shared stock, we should probably pick one user or just add it.
          // Since the prompt says "stock sont partagés", querying by user.id is still "valid" if we just want to update *existing* entry for THIS user,
          // BUT if another user added it, we might create a duplicate.
          // Let's check generally if this ingredient exists in stock irrespective of user_id to update it?

          const { data: existingStock } = await supabase
            .from('stock')
            .select('id, quantity')
            .eq('ingredient_id', targetIngredientId)
            // .eq('user_id', user.id) // Try to find ANY entry for this ingredient
            .limit(1)
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
            // Insert into stock (as current user)
            await supabase
              .from('stock')
              .insert({
                user_id: user.id, // Marked as added by me, but shared view
                ingredient_id: targetIngredientId,
                quantity: Number(item.quantity) || 0,
                unit: item.unit || 'piece',
                low_stock: false
              });
          }
        }
      }

      // 3. Delete checked items (GLOBAL)
      const { error: deleteError } = await supabase
        .from('shopping_list')
        .delete()
        // .eq('user_id', user.id) // Removed
        .eq('checked', true);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      // Invalidate both shopping list and stock as items moved there
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
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

  const updateItem = async (id: string, updates: Partial<ShoppingListItem>) => {
    try {
      await updateItemMutation.mutateAsync({ id, updates });
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
    updateItem,
    deleteItem,
    clearCheckedItems,
    finishShopping,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['shopping-list'] })
  };
};
