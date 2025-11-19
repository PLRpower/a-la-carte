import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Stock, StockWithIngredient, MeasurementUnit } from '@/types/database';
import { useAuth } from './useAuth';

export const useStock = () => {
  const { user } = useAuth();
  const [stock, setStock] = useState<StockWithIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setStock([]);
      setLoading(false);
      return;
    }

    fetchStock();

    // Set up real-time subscription
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
          fetchStock();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchStock = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock')
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStock(data as StockWithIngredient[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (
    ingredientId: string,
    quantity: number,
    unit: MeasurementUnit,
    expirationDate?: string,
    lowStock?: boolean
  ) => {
    if (!user) return { error: new Error('No user') };

    try {
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
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateStock = async (id: string, updates: Partial<Stock>) => {
    try {
      const { error } = await supabase
        .from('stock')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteStock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { 
    stock, 
    loading, 
    error, 
    addStock, 
    updateStock, 
    deleteStock,
    refetch: fetchStock 
  };
};
