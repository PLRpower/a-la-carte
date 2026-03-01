import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Stock, StockWithIngredient, MeasurementUnit } from '@/types/database';
import { useAuth } from './useAuth';

export const useStock = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use a shared query key since data is shared
  const queryKey = ['stock'];

  const { data: stock = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return [];

      // 1. Fetch stock items (ALL items, shared)
      const { data: stockItems, error: stockError } = await supabase
        .from('stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (stockError) throw stockError;
      if (!stockItems || stockItems.length === 0) return [];

      // 2. Fetch related ingredients
      const ingredientIds = [...new Set(stockItems.map((item: any) => item.ingredient_id))];
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .in('id', ingredientIds);

      if (ingredientsError) throw ingredientsError;

      // 3. Combine
      const ingredientsMap = new Map(ingredients?.map((ing: any) => [ing.id, ing]));

      return stockItems.map((item: any) => ({
        ...item,
        ingredient: ingredientsMap.get(item.ingredient_id)
      })) as StockWithIngredient[];
    },
    enabled: !!user,
  });

  // Real-time subscription - Listen to ALL changes on stock table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock',
          // No filter by user_id
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

  const addStockMutation = useMutation({
    mutationFn: async ({
      ingredientId,
      quantity,
      unit,
      expirationDate,
      lowStock
    }: {
      ingredientId: string;
      quantity: number;
      unit: MeasurementUnit;
      expirationDate?: string;
      lowStock?: boolean;
    }) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('stock')
        .upsert({
          user_id: user.id,
          ingredient_id: ingredientId,
          quantity,
          unit,
          expiration_date: expirationDate,
          low_stock: lowStock || false
        }, {
          /*           onConflict: 'user_id,ingredient_id' */
          // We might want to just insert, or handle conflict differently if shared. 
          // For now, let's keep it as is, implying per-user entries are aggregates in the UI? 
          // No, UI just lists them. So duplicates will appear. 
          // User asked "liste de courses et le stock sont partagés".
          // Let's assume seeing "User A's Tomato" and "User B's Tomato" is okay for now, or maybe the intended behavior is to sum them up?
          // The prompt is simple: "partagés entre tout les utilisateurs". Viewing is the priority.
          onConflict: 'user_id,ingredient_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Stock> }) => {
      const { error } = await supabase
        .from('stock')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousStock = queryClient.getQueryData<StockWithIngredient[]>(queryKey);

      queryClient.setQueryData<StockWithIngredient[]>(queryKey, (old) =>
        old?.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      return { previousStock };
    },
    onError: (err, variables, context) => {
      if (context?.previousStock) {
        queryClient.setQueryData(queryKey, context.previousStock);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteStockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousStock = queryClient.getQueryData<StockWithIngredient[]>(queryKey);

      queryClient.setQueryData<StockWithIngredient[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== id)
      );

      return { previousStock };
    },
    onError: (err, id, context) => {
      if (context?.previousStock) {
        queryClient.setQueryData(queryKey, context.previousStock);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const addStock = async (
    ingredientId: string,
    quantity: number,
    unit: MeasurementUnit,
    expirationDate?: string,
    lowStock?: boolean
  ) => {
    try {
      await addStockMutation.mutateAsync({ ingredientId, quantity, unit, expirationDate, lowStock });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateStock = async (id: string, updates: Partial<Stock>) => {
    try {
      await updateStockMutation.mutateAsync({ id, updates });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteStock = async (id: string) => {
    try {
      await deleteStockMutation.mutateAsync(id);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    stock,
    loading,
    error: error as Error | null,
    addStock,
    updateStock,
    deleteStock,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['stock'] })
  };
};
