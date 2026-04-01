import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Family {
    id: string;
    name: string;
    share_code: string | null;
    created_at: string;
}

interface FamilyMember {
    id: string;
    family_id: string;
    user_id: string;
    role: string | null;
    created_at: string;
    profile?: {
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        email?: string | null;
    };
}

export const useFamily = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch user's families
    const { data: families = [], isLoading: loadingFamilies } = useQuery({
        queryKey: ['families', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('families')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                toast.error("Erreur lors de la récupération des familles");
                throw error;
            }
            return data as Family[];
        },
        enabled: !!user,
    });

    // Fetch members for the first family (assuming simple case for now - one family per user)
    const mainFamilyId = families[0]?.id;

    // Real-time subscription
    useEffect(() => {
        if (!user) return;

        // Channel for family members changes
        const membersChannel = supabase
            .channel('family-members-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'family_members',
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['families', user?.id] });
                    if (mainFamilyId) {
                        queryClient.invalidateQueries({ queryKey: ['family_members', mainFamilyId] });
                    }
                }
            )
            .subscribe();

        // Channel for families changes (in case name or code changes)
        const familiesChannel = supabase
            .channel('families-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'families',
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['families', user?.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(membersChannel);
            supabase.removeChannel(familiesChannel);
        };
    }, [user, mainFamilyId, queryClient]);

    const { data: members = [], isLoading: loadingMembers } = useQuery({
        queryKey: ['family_members', mainFamilyId],
        queryFn: async () => {
            if (!mainFamilyId) return [];

            const { data: membersData, error: membersError } = await supabase
                .from('family_members')
                .select('*')
                .eq('family_id', mainFamilyId);

            if (membersError) {
                toast.error("Erreur lors de la récupération des membres de la famille");
                throw membersError;
            }

            if (!membersData || membersData.length === 0) return [];

            const userIds = membersData.map(m => m.user_id);

            const { data: profilesData, error: profilesError } = await (supabase
                .from('profiles' as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)
                .select('id, first_name, last_name, avatar_url, email') as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)
                .in('id', userIds);

            if (profilesError) {
                toast.error("Erreur lors de la récupération des profils de la famille");
                throw profilesError;
            }

            const combinedData = membersData.map(member => {
                const profile = profilesData.find(p => p.id === member.user_id);
                return {
                    ...member,
                    profile: profile ? {
                        first_name: profile.first_name,
                        last_name: profile.last_name,
                        avatar_url: profile.avatar_url,
                        email: profile.email
                    } : undefined
                };
            });

            return combinedData as unknown as FamilyMember[];
        },
        enabled: !!user && !!mainFamilyId,
    });

    // Create Family Mutation
    const createFamilyMutation = useMutation({
        mutationFn: async (name: string) => {
            const { data, error } = await supabase.rpc('create_family', { p_name: name });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families', user?.id] });
            toast.success("Famille créée avec succès !");
        },
        onError: (error) => {
            toast.error("Impossible de créer la famille.");
            console.error(error);
        }
    });

    // Join Family Mutation
    const joinFamilyMutation = useMutation({
        mutationFn: async (shareCode: string) => {
            const { data, error } = await supabase.rpc('join_family_with_code', { p_share_code: shareCode });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families', user?.id] });
            toast.success("Vous avez rejoint la famille avec succès !");
        },
        onError: (error) => {
            toast.error("Code de partage invalide ou erreur.");
            console.error(error);
        }
    });

    // Add Member by Email Mutation
    const addMemberByEmailMutation = useMutation({
        mutationFn: async ({ email, familyId, shareCode }: { email: string, familyId: string, shareCode: string }) => {
            const { data, error } = await supabase.functions.invoke('invite-family', {
                body: { email, familyId, shareCode }
            });
            if (error) {
                const fallback = await supabase.rpc('add_family_member_by_email', { p_email: email, p_family_id: familyId });
                if (fallback.error) throw error;
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family_members', mainFamilyId] });
            toast.success("Invitation envoyée !");
        },
        onError: (error) => {
            toast.error("Impossible d'ajouter le membre ou d'envoyer l'email.");
            console.error(error);
        }
    });

    // Remove Member Mutation
    const removeMemberMutation = useMutation({
        mutationFn: async (userIdToRemove: string) => {
            if (!mainFamilyId) throw new Error("No family ID");
            const { error } = await supabase
                .from('family_members')
                .delete()
                .eq('family_id', mainFamilyId)
                .eq('user_id', userIdToRemove);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family_members', mainFamilyId] });
            toast.success("Membre retiré de la famille.");
        },
        onError: (error) => {
            toast.error("Erreur lors de la suppression du membre.");
            console.error(error);
        }
    });

    // Leave Family Mutation
    const leaveFamilyMutation = useMutation({
        mutationFn: async () => {
            if (!mainFamilyId || !user?.id) throw new Error("No family or user ID");
            const { error } = await supabase
                .from('family_members')
                .delete()
                .eq('family_id', mainFamilyId)
                .eq('user_id', user.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['family_members', mainFamilyId] });
            toast.success("Vous avez quitté la famille.");
        },
        onError: (error) => {
            toast.error("Erreur, impossible de quitter la famille.");
            console.error(error);
        }
    });

    return {
        families,
        loadingFamilies,
        members,
        loadingMembers,
        createFamily: createFamilyMutation.mutate,
        isCreating: createFamilyMutation.isPending,
        joinFamily: joinFamilyMutation.mutate,
        isJoining: joinFamilyMutation.isPending,
        addMemberByEmail: addMemberByEmailMutation.mutate,
        isAddingMember: addMemberByEmailMutation.isPending,
        removeMember: removeMemberMutation.mutate,
        isRemovingMember: removeMemberMutation.isPending,
        leaveFamily: leaveFamilyMutation.mutate,
        isLeaving: leaveFamilyMutation.isPending,
    };
};
