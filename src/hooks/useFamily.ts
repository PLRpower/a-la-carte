import { useState, useEffect } from "react";
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

    const { data: members = [], isLoading: loadingMembers } = useQuery({
        queryKey: ['family_members', mainFamilyId],
        queryFn: async () => {
            if (!mainFamilyId) return [];

            const { data, error } = await supabase
                .from('family_members')
                .select(`
          *,
          profile:profiles(first_name, last_name, avatar_url)
        `)
                .eq('family_id', mainFamilyId);

            if (error) {
                toast.error("Erreur lors de la récupération des membres de la famille");
                throw error;
            }
            return data as unknown as FamilyMember[];
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
        mutationFn: async ({ email, familyId }: { email: string, familyId: string }) => {
            const { data, error } = await supabase.rpc('add_family_member_by_email', {
                p_email: email,
                p_family_id: familyId
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family_members', mainFamilyId] });
            toast.success("Membre ajouté avec succès !");
        },
        onError: (error) => {
            toast.error("Impossible d'ajouter le membre. L'utilisateur existe-t-il ?");
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
    };
};
