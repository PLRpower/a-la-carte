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
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes instead of Infinity
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('No user');
      // Use upsert to handle cases where the profile row might be missing
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...updates,
          id: user.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.refetchQueries({ queryKey: ['profile', user?.id] });
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
