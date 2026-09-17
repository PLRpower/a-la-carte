import { useState, useMemo, useCallback } from "react";
import { useShoppingList } from "./useShoppingList";
import { useStock } from "./useStock";
import {
  generatePredictiveSuggestions,
  PredictiveSuggestion,
  getPurchaseHistory,
} from "@/lib/shopping-predictive";
import { useToast } from "./use-toast";

export const usePredictiveShopping = () => {
  const { items, addSmartItem } = useShoppingList();
  const { stock } = useStock();
  const { toast } = useToast();

  const [dismissedNames, setDismissedNames] = useState<string[]>([]);
  const [addingName, setAddingName] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const history = getPurchaseHistory();
    const rawSuggestions = generatePredictiveSuggestions({
      shoppingListItems: items,
      stockItems: stock,
      history,
    });

    return rawSuggestions.filter(
      (s) => !dismissedNames.includes(s.name.toLowerCase())
    );
  }, [items, stock, dismissedNames]);

  const addSuggestion = useCallback(
    async (suggestion: PredictiveSuggestion) => {
      setAddingName(suggestion.name);
      const { error } = await addSmartItem(suggestion.name);
      setAddingName(null);

      if (error) {
        toast({
          title: "Erreur",
          description: `Impossible d'ajouter ${suggestion.name}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ajouté à la liste",
          description: `${suggestion.name} a été ajouté à votre liste de courses.`,
        });
      }
    },
    [addSmartItem, toast]
  );

  const addAllSuggestions = useCallback(async () => {
    if (suggestions.length === 0) return;

    let addedCount = 0;
    for (const suggestion of suggestions) {
      const { error } = await addSmartItem(suggestion.name);
      if (!error) addedCount++;
    }

    toast({
      title: "Suggestions ajoutées",
      description: `${addedCount} article(s) ajouté(s) à votre liste.`,
    });
  }, [suggestions, addSmartItem, toast]);

  const dismissSuggestion = useCallback((name: string) => {
    setDismissedNames((prev) => [...prev, name.toLowerCase()]);
  }, []);

  return {
    suggestions,
    addSuggestion,
    addAllSuggestions,
    dismissSuggestion,
    addingName,
  };
};
