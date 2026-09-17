import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RecipeJournalData {
  notes: string;
  cookedCount: number;
  lastCookedAt: string | null;
}

const LOCAL_STORAGE_PREFIX = "recipe_journal_";

const getLocalJournal = (recipeId: string): RecipeJournalData => {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${recipeId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        notes: parsed.notes || "",
        cookedCount: typeof parsed.cookedCount === "number" ? parsed.cookedCount : 0,
        lastCookedAt: parsed.lastCookedAt || null,
      };
    }
  } catch (e) {
    console.error("Failed to read local recipe journal", e);
  }
  return { notes: "", cookedCount: 0, lastCookedAt: null };
};

const saveLocalJournal = (recipeId: string, data: RecipeJournalData) => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${recipeId}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save local recipe journal", e);
  }
};

export const useRecipeJournal = (recipeId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["recipe-journal", recipeId, user?.id];

  const { data, isLoading } = useQuery<RecipeJournalData>({
    queryKey,
    queryFn: async () => {
      if (!recipeId) {
        return { notes: "", cookedCount: 0, lastCookedAt: null };
      }

      // If user is not logged in, read from local storage
      if (!user) {
        return getLocalJournal(recipeId);
      }

      try {
        const { data: dbData, error } = await supabase
          .from("recipe_user_notes")
          .select("notes, cooked_count, last_cooked_at")
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId)
          .maybeSingle();

        if (error) {
          console.warn("Error fetching recipe_user_notes from Supabase, falling back to local storage:", error.message);
          return getLocalJournal(recipeId);
        }

        if (dbData) {
          const result: RecipeJournalData = {
            notes: dbData.notes || "",
            cookedCount: dbData.cooked_count || 0,
            lastCookedAt: dbData.last_cooked_at || null,
          };
          // Also update local cache
          saveLocalJournal(recipeId, result);
          return result;
        }

        // If no record in DB yet, check if there's local data to preserve/migrate
        const local = getLocalJournal(recipeId);
        return local;
      } catch (err) {
        console.warn("Exception fetching recipe_user_notes:", err);
        return getLocalJournal(recipeId);
      }
    },
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 5,
  });

  const journalData: RecipeJournalData = data || {
    notes: "",
    cookedCount: 0,
    lastCookedAt: null,
  };

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<RecipeJournalData>) => {
      if (!recipeId) return;

      const nextData: RecipeJournalData = {
        ...journalData,
        ...updates,
      };

      // Always save locally
      saveLocalJournal(recipeId, nextData);

      // If logged in, save to Supabase
      if (user) {
        try {
          const { error } = await supabase.from("recipe_user_notes").upsert(
            {
              user_id: user.id,
              recipe_id: recipeId,
              notes: nextData.notes,
              cooked_count: nextData.cookedCount,
              last_cooked_at: nextData.lastCookedAt,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,recipe_id" }
          );

          if (error) {
            console.warn("Failed to upsert to recipe_user_notes in Supabase:", error.message);
          }
        } catch (e) {
          console.warn("Exception saving recipe_user_notes to Supabase:", e);
        }
      }

      return nextData;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RecipeJournalData>(queryKey);

      const optimistic: RecipeJournalData = {
        ...(previous || journalData),
        ...updates,
      };

      queryClient.setQueryData(queryKey, optimistic);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const saveNotes = async (notes: string) => {
    return updateMutation.mutateAsync({ notes });
  };

  const incrementCooked = async () => {
    const nextCount = journalData.cookedCount + 1;
    const now = new Date().toISOString();
    await updateMutation.mutateAsync({
      cookedCount: nextCount,
      lastCookedAt: now,
    });
    return nextCount;
  };

  const decrementCooked = async () => {
    const nextCount = Math.max(0, journalData.cookedCount - 1);
    await updateMutation.mutateAsync({
      cookedCount: nextCount,
    });
    return nextCount;
  };

  const setCookedCount = async (count: number) => {
    const nextCount = Math.max(0, count);
    const now = nextCount > journalData.cookedCount ? new Date().toISOString() : journalData.lastCookedAt;
    await updateMutation.mutateAsync({
      cookedCount: nextCount,
      lastCookedAt: now,
    });
  };

  return {
    notes: journalData.notes,
    cookedCount: journalData.cookedCount,
    lastCookedAt: journalData.lastCookedAt,
    isLoading,
    saveNotes,
    incrementCooked,
    decrementCooked,
    setCookedCount,
  };
};
