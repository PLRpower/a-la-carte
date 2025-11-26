import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: Infinity, // Profile data rarely changes, cache it indefinitely
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      await updateProfileMutation.mutateAsync(updates);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    profile,
    loading,
    error: error as Error | null,
    updateProfile,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
  };
};
