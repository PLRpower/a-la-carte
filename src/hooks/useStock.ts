import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Stock, StockWithIngredient, MeasurementUnit } from '@/types/database';
import { useAuth } from './useAuth';

export const useStock = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stock = [], isLoading: loading, error } = useQuery({
    queryKey: ['stock', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // 1. Fetch stock items
      const { data: stockItems, error: stockError } = await supabase
        .from('stock')
        .select('*')
        .eq('user_id', user.id)
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

  // Real-time subscription
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
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['stock', user.id] });
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
          onConflict: 'user_id,ingredient_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', user?.id] });
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
      await queryClient.cancelQueries({ queryKey: ['stock', user?.id] });
      const previousStock = queryClient.getQueryData<StockWithIngredient[]>(['stock', user?.id]);

      queryClient.setQueryData(['stock', user?.id], (old: StockWithIngredient[] = []) =>
        old.map(item => item.id === id ? { ...item, ...updates } : item)
      );

      return { previousStock };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['stock', user?.id], context?.previousStock);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', user?.id] });
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
      await queryClient.cancelQueries({ queryKey: ['stock', user?.id] });
      const previousStock = queryClient.getQueryData<StockWithIngredient[]>(['stock', user?.id]);

      queryClient.setQueryData(['stock', user?.id], (old: StockWithIngredient[] = []) =>
        old.filter(item => item.id !== id)
      );

      return { previousStock };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['stock', user?.id], context?.previousStock);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', user?.id] });
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
    refetch: () => queryClient.invalidateQueries({ queryKey: ['stock', user?.id] })
  };
};
