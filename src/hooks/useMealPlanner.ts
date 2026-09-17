import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  MealPlan, 
  MealPlanWithRecipe, 
  MealPlanSlot, 
  MealPlanRecipeSnapshot, 
  RecipeWithDetails 
} from '@/types/database';
import { useAuth } from './useAuth';
import { useStock } from './useStock';
import { useRecipes } from './useRecipes';
import { 
  getWeekDates, 
  generateWeeklyShoppingListItems, 
  generateBatchCookingSession,
  generateSmartWeekPlan,
  MealPlanPreferences
} from '@/lib/meal-planner-utils';
import { CATALOG_RECIPES, CatalogRecipe } from '@/data/recipesCatalog';
import { startOfWeek, addWeeks, subWeeks, format } from 'date-fns';

const LOCAL_STORAGE_KEY = 'a_la_carte_local_meal_plans';

export const useMealPlanner = () => {
  const { user, isDemo } = useAuth();
  const queryClient = useQueryClient();
  const { stock } = useStock();
  const { allRecipes } = useRecipes();

  // Current selected week anchor (always Monday)
  const [currentDate, setCurrentDate] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const currentWeekDays = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const startOfWeekKey = currentWeekDays[0].dateKey;
  const endOfWeekKey = currentWeekDays[6].dateKey;

  const queryKey = useMemo(() => ['meal-plans', user?.id || 'demo', startOfWeekKey], [user?.id, startOfWeekKey]);

  // Read local plans from localStorage for fallback or demo
  const getLocalPlans = useCallback((): MealPlanWithRecipe[] => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const saveLocalPlans = useCallback((plans: MealPlanWithRecipe[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
      console.error('Error saving local meal plans', e);
    }
  }, []);

  // Main Query
  const { data: weekPlans = [], isLoading: loading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<MealPlanWithRecipe[]> => {
      // 1. If demo or no user, use localStorage
      if (isDemo || !user) {
        const local = getLocalPlans();
        return local.filter(p => p.date >= startOfWeekKey && p.date <= endOfWeekKey);
      }

      // 2. Fetch from Supabase
      try {
        const { data, error: dbError } = await supabase
          .from('meal_plans')
          .select(`
            *,
            recipe:recipes(
              *,
              ingredients:recipe_ingredients(
                id,
                quantity,
                unit,
                name,
                ingredient:ingredients(*)
              )
            )
          `)
          .gte('date', startOfWeekKey)
          .lte('date', endOfWeekKey)
          .order('date', { ascending: true });

        if (dbError) {
          console.warn('Supabase meal_plans query error, falling back to local:', dbError);
          const local = getLocalPlans();
          return local.filter(p => p.date >= startOfWeekKey && p.date <= endOfWeekKey);
        }

        return (data || []) as MealPlanWithRecipe[];
      } catch (err) {
        console.warn('Fallback to local storage due to network/db:', err);
        const local = getLocalPlans();
        return local.filter(p => p.date >= startOfWeekKey && p.date <= endOfWeekKey);
      }
    },
    enabled: true,
  });

  // Real-time subscription to meal_plans table
  useEffect(() => {
    if (!user || isDemo) return;

    const channel = supabase
      .channel('meal-plans-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meal_plans' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isDemo, queryClient]);

  // Helper map: dateKey -> { lunch?: MealPlanWithRecipe, dinner?: MealPlanWithRecipe }
  const plansByDateAndSlot = useMemo(() => {
    const map: Record<string, { lunch?: MealPlanWithRecipe; dinner?: MealPlanWithRecipe }> = {};
    for (const day of currentWeekDays) {
      map[day.dateKey] = {};
    }
    for (const plan of weekPlans) {
      if (!map[plan.date]) {
        map[plan.date] = {};
      }
      if (plan.slot === 'lunch') {
        map[plan.date].lunch = plan;
      } else if (plan.slot === 'dinner') {
        map[plan.date].dinner = plan;
      }
    }
    return map;
  }, [currentWeekDays, weekPlans]);

  // Mutation: Assign Meal to a Date + Slot
  const assignMealMutation = useMutation({
    mutationFn: async ({
      date,
      slot,
      recipe,
      catalogRecipe,
      customTitle,
      servings = 2,
      notes
    }: {
      date: string;
      slot: MealPlanSlot;
      recipe?: RecipeWithDetails | null;
      catalogRecipe?: CatalogRecipe | null;
      customTitle?: string | null;
      servings?: number;
      notes?: string;
    }) => {
      const now = new Date().toISOString();

      let recipeSnapshot: MealPlanRecipeSnapshot | null = null;
      if (recipe) {
        recipeSnapshot = {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          image_url: recipe.image_url,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          difficulty: recipe.difficulty,
          category: recipe.category,
          tags: recipe.tags,
          instructions: recipe.instructions,
          servings: recipe.servings,
          ingredients: recipe.ingredients?.map(i => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            ingredient_id: i.ingredient_id,
            category: i.ingredient?.category
          }))
        };
      } else if (catalogRecipe) {
        recipeSnapshot = {
          id: catalogRecipe.id,
          title: catalogRecipe.title,
          description: catalogRecipe.description,
          image_url: catalogRecipe.image_url,
          prep_time: catalogRecipe.prep_time,
          cook_time: catalogRecipe.cook_time,
          difficulty: catalogRecipe.difficulty,
          category: catalogRecipe.category,
          tags: catalogRecipe.tags,
          instructions: catalogRecipe.instructions,
          servings: catalogRecipe.servings,
          ingredients: catalogRecipe.ingredients?.map(i => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            category: i.category
          }))
        };
      }

      const planRecord: Omit<MealPlan, 'id'> = {
        user_id: user?.id || 'demo-user',
        date,
        slot,
        recipe_id: recipe?.id || null,
        catalog_recipe_id: catalogRecipe?.id || null,
        custom_title: customTitle || (recipe?.title || catalogRecipe?.title || 'Repas'),
        servings,
        notes: notes || null,
        recipe_snapshot: recipeSnapshot,
        created_at: now,
        updated_at: now
      };

      if (isDemo || !user) {
        const local = getLocalPlans();
        const existingIdx = local.findIndex(p => p.date === date && p.slot === slot);
        const newPlan: MealPlanWithRecipe = {
          ...planRecord,
          id: existingIdx >= 0 ? local[existingIdx].id : crypto.randomUUID(),
          recipe: recipe || undefined
        };
        if (existingIdx >= 0) {
          local[existingIdx] = newPlan;
        } else {
          local.push(newPlan);
        }
        saveLocalPlans(local);
        return newPlan;
      }

      // Check if existing plan for date + slot
      const { data: existing } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('date', date)
        .eq('slot', slot)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('meal_plans')
          .update({
            recipe_id: planRecord.recipe_id,
            catalog_recipe_id: planRecord.catalog_recipe_id,
            custom_title: planRecord.custom_title,
            servings: planRecord.servings,
            notes: planRecord.notes,
            recipe_snapshot: planRecord.recipe_snapshot as any,
            updated_at: now
          })
          .eq('id', existing.id)
          .select(`*, recipe:recipes(*, ingredients:recipe_ingredients(*, ingredient:ingredients(*)))`)
          .single();

        if (error) throw error;
        return data as MealPlanWithRecipe;
      } else {
        const { data, error } = await supabase
          .from('meal_plans')
          .insert({
            user_id: user.id,
            date: planRecord.date,
            slot: planRecord.slot,
            recipe_id: planRecord.recipe_id,
            catalog_recipe_id: planRecord.catalog_recipe_id,
            custom_title: planRecord.custom_title,
            servings: planRecord.servings,
            notes: planRecord.notes,
            recipe_snapshot: planRecord.recipe_snapshot as any
          })
          .select(`*, recipe:recipes(*, ingredients:recipe_ingredients(*, ingredient:ingredients(*)))`)
          .single();

        if (error) throw error;
        return data as MealPlanWithRecipe;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    }
  });

  // Mutation: Remove a meal slot
  const removeMealMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (isDemo || !user) {
        const local = getLocalPlans().filter(p => p.id !== planId);
        saveLocalPlans(local);
        return;
      }

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    }
  });

  // Mutation: Move a meal slot (drag & drop or modal)
  const moveMealMutation = useMutation({
    mutationFn: async ({
      fromPlanId,
      toDate,
      toSlot
    }: {
      fromPlanId: string;
      toDate: string;
      toSlot: MealPlanSlot;
    }) => {
      if (isDemo || !user) {
        const local = getLocalPlans();
        const sourcePlan = local.find(p => p.id === fromPlanId);
        if (!sourcePlan) return;

        const targetPlan = local.find(p => p.date === toDate && p.slot === toSlot);
        if (targetPlan) {
          // Swap
          targetPlan.date = sourcePlan.date;
          targetPlan.slot = sourcePlan.slot;
        }
        sourcePlan.date = toDate;
        sourcePlan.slot = toSlot;
        saveLocalPlans(local);
        return;
      }

      // Check if target slot exists
      const { data: targetPlan } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('date', toDate)
        .eq('slot', toSlot)
        .maybeSingle();

      const { data: sourcePlan } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', fromPlanId)
        .single();

      if (!sourcePlan) return;

      if (targetPlan) {
        // Swap slots
        await supabase
          .from('meal_plans')
          .update({ date: sourcePlan.date, slot: sourcePlan.slot })
          .eq('id', targetPlan.id);
      }

      await supabase
        .from('meal_plans')
        .update({ date: toDate, slot: toSlot })
        .eq('id', fromPlanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    }
  });

  // Mutation: Update Servings
  const updateServingsMutation = useMutation({
    mutationFn: async ({ planId, servings }: { planId: string; servings: number }) => {
      if (isDemo || !user) {
        const local = getLocalPlans();
        const item = local.find(p => p.id === planId);
        if (item) {
          item.servings = servings;
          saveLocalPlans(local);
        }
        return;
      }

      const { error } = await supabase
        .from('meal_plans')
        .update({ servings })
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    }
  });

  // Mutation: Clear entire week
  const clearWeekMutation = useMutation({
    mutationFn: async () => {
      if (isDemo || !user) {
        const local = getLocalPlans().filter(p => p.date < startOfWeekKey || p.date > endOfWeekKey);
        saveLocalPlans(local);
        return;
      }

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .gte('date', startOfWeekKey)
        .lte('date', endOfWeekKey);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    }
  });

  // Bulk Apply Generated Plan
  const applyGeneratedPlan = async (generatedDays: ReturnType<typeof generateSmartWeekPlan>['days']) => {
    for (const day of generatedDays) {
      if (day.lunch) {
        await assignMealMutation.mutateAsync({
          date: day.dateKey,
          slot: 'lunch',
          recipe: day.lunch.recipeRef && 'created_at' in day.lunch.recipeRef ? (day.lunch.recipeRef as RecipeWithDetails) : undefined,
          catalogRecipe: day.lunch.recipeRef && !('created_at' in day.lunch.recipeRef) ? (day.lunch.recipeRef as CatalogRecipe) : undefined,
          customTitle: day.lunch.title,
          servings: 2
        });
      }
      if (day.dinner) {
        await assignMealMutation.mutateAsync({
          date: day.dateKey,
          slot: 'dinner',
          recipe: day.dinner.recipeRef && 'created_at' in day.dinner.recipeRef ? (day.dinner.recipeRef as RecipeWithDetails) : undefined,
          catalogRecipe: day.dinner.recipeRef && !('created_at' in day.dinner.recipeRef) ? (day.dinner.recipeRef as CatalogRecipe) : undefined,
          customTitle: day.dinner.title,
          servings: 2
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
  };

  // Weekly Shopping List computed data
  const shoppingListAnalysis = useMemo(() => {
    return generateWeeklyShoppingListItems(weekPlans, stock);
  }, [weekPlans, stock]);

  // Batch cooking computed session for recipes in week
  const batchCookingSession = useMemo(() => {
    const activeRecipes = weekPlans
      .map(p => p.recipe || p.recipe_snapshot)
      .filter((r): r is (RecipeWithDetails | MealPlanRecipeSnapshot) => !!r);
    
    // De-duplicate by title
    const unique = activeRecipes.filter((r, idx, self) => 
      self.findIndex(s => s.title.toLowerCase() === r.title.toLowerCase()) === idx
    );

    return generateBatchCookingSession(unique.slice(0, 4));
  }, [weekPlans]);

  return {
    currentDate,
    currentWeekDays,
    weekPlans,
    plansByDateAndSlot,
    loading,
    error,
    nextWeek: () => setCurrentDate(d => addWeeks(d, 1)),
    prevWeek: () => setCurrentDate(d => subWeeks(d, 1)),
    goToToday: () => setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 })),
    assignMeal: assignMealMutation.mutateAsync,
    removeMeal: removeMealMutation.mutateAsync,
    moveMeal: moveMealMutation.mutateAsync,
    updateServings: updateServingsMutation.mutateAsync,
    clearWeek: clearWeekMutation.mutateAsync,
    applyGeneratedPlan,
    shoppingListAnalysis,
    batchCookingSession,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['meal-plans'] })
  };
};
