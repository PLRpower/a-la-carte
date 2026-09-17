import { ShoppingListItemWithIngredient, StockWithIngredient } from "@/types/database";

export interface PurchaseRecord {
  id: string;
  name: string;
  category?: string;
  purchasedAt: number;
}

export interface PredictiveSuggestion {
  name: string;
  category?: string;
  reason: string;
  confidence: "high" | "medium";
  daysSinceLast?: number;
  averageFrequency?: number;
}

export interface StapleDefinition {
  name: string;
  category: string;
  defaultIntervalDays: number;
}

export const ESSENTIAL_STAPLES: StapleDefinition[] = [
  { name: "Lait", category: "produits_laitiers", defaultIntervalDays: 7 },
  { name: "Beurre", category: "produits_laitiers", defaultIntervalDays: 14 },
  { name: "Café", category: "epicerie_sucree", defaultIntervalDays: 14 },
  { name: "Œufs", category: "produits_frais", defaultIntervalDays: 7 },
  { name: "Pain", category: "epicerie_sucree", defaultIntervalDays: 3 },
  { name: "Huile d'olive", category: "epicerie_salee", defaultIntervalDays: 30 },
  { name: "Pâtes", category: "epicerie_salee", defaultIntervalDays: 14 },
  { name: "Riz", category: "epicerie_salee", defaultIntervalDays: 21 },
  { name: "Yaourts", category: "produits_laitiers", defaultIntervalDays: 7 },
  { name: "Fromage", category: "produits_laitiers", defaultIntervalDays: 10 },
];

const PURCHASE_HISTORY_KEY = "alc_shopping_purchase_history";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const normalizeItemName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const getPurchaseHistory = (): PurchaseRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PURCHASE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error("Failed to parse purchase history", e);
  }
  return [];
};

export const recordPurchases = (
  items: Array<{ name: string; category?: string }>,
  timestamp: number = Date.now()
) => {
  if (typeof window === "undefined" || items.length === 0) return;
  try {
    const existing = getPurchaseHistory();
    const newRecords: PurchaseRecord[] = items.map((item) => ({
      id: crypto.randomUUID(),
      name: item.name.trim(),
      category: item.category,
      purchasedAt: timestamp,
    }));

    // Keep max 200 records, newest first
    const combined = [...newRecords, ...existing].slice(0, 200);
    localStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(combined));
  } catch (e) {
    console.error("Failed to save purchases", e);
  }
};

export const clearPurchaseHistory = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PURCHASE_HISTORY_KEY);
  } catch (e) {
    console.error("Failed to clear purchase history", e);
  }
};

export const calculateItemFrequency = (
  itemName: string,
  history: PurchaseRecord[],
  now: number = Date.now()
): {
  purchaseCount: number;
  averageIntervalDays: number;
  daysSinceLastPurchase: number | null;
  lastPurchaseDate: Date | null;
} => {
  const norm = normalizeItemName(itemName);
  const matching = history
    .filter((h) => normalizeItemName(h.name) === norm)
    .sort((a, b) => a.purchasedAt - b.purchasedAt);

  const staple = ESSENTIAL_STAPLES.find((s) => normalizeItemName(s.name) === norm);
  const defaultInterval = staple?.defaultIntervalDays ?? 14;

  if (matching.length === 0) {
    return {
      purchaseCount: 0,
      averageIntervalDays: defaultInterval,
      daysSinceLastPurchase: null,
      lastPurchaseDate: null,
    };
  }

  const lastPurchase = matching[matching.length - 1];
  const daysSinceLastPurchase = Math.max(
    0,
    Math.round((now - lastPurchase.purchasedAt) / ONE_DAY_MS)
  );

  if (matching.length === 1) {
    return {
      purchaseCount: 1,
      averageIntervalDays: defaultInterval,
      daysSinceLastPurchase,
      lastPurchaseDate: new Date(lastPurchase.purchasedAt),
    };
  }

  // Calculate average interval between consecutive purchases
  let totalIntervalDays = 0;
  for (let i = 1; i < matching.length; i++) {
    const diff = (matching[i].purchasedAt - matching[i - 1].purchasedAt) / ONE_DAY_MS;
    totalIntervalDays += diff;
  }

  const averageIntervalDays = Math.max(
    1,
    Math.round(totalIntervalDays / (matching.length - 1))
  );

  return {
    purchaseCount: matching.length,
    averageIntervalDays,
    daysSinceLastPurchase,
    lastPurchaseDate: new Date(lastPurchase.purchasedAt),
  };
};

export interface GenerateOptions {
  shoppingListItems: ShoppingListItemWithIngredient[];
  stockItems: StockWithIngredient[];
  history?: PurchaseRecord[];
  now?: number;
}

export const generatePredictiveSuggestions = ({
  shoppingListItems,
  stockItems,
  history = getPurchaseHistory(),
  now = Date.now(),
}: GenerateOptions): PredictiveSuggestion[] => {
  const suggestions: PredictiveSuggestion[] = [];
  const addedNormSet = new Set<string>();

  // 1. Mark what is currently on the shopping list to avoid recommending duplicates
  for (const item of shoppingListItems) {
    addedNormSet.add(normalizeItemName(item.name));
  }

  // 2. High Priority: Stock items marked as low_stock or quantity <= 0
  for (const stock of stockItems) {
    const ingName = stock.ingredient?.name || "Article";
    const norm = normalizeItemName(ingName);

    if (addedNormSet.has(norm)) continue;

    if (stock.low_stock || Number(stock.quantity) <= 0) {
      suggestions.push({
        name: ingName,
        category: stock.ingredient?.category || "autre",
        reason: "Stock bas ou épuisé en réserve",
        confidence: "high",
      });
      addedNormSet.add(norm);
    }
  }

  // 3. Medium/High Priority: Items with purchase history whose renewal date is reached
  // Group history by unique item names
  const uniqueHistoryNames = Array.from(
    new Set(history.map((h) => h.name))
  );

  for (const name of uniqueHistoryNames) {
    const norm = normalizeItemName(name);
    if (addedNormSet.has(norm)) continue;

    const stats = calculateItemFrequency(name, history, now);
    if (stats.daysSinceLastPurchase !== null) {
      // Due if at least 80% of average interval elapsed or interval exceeded
      if (stats.daysSinceLastPurchase >= Math.max(2, stats.averageIntervalDays * 0.8)) {
        const itemRecord = history.find((h) => normalizeItemName(h.name) === norm);
        suggestions.push({
          name,
          category: itemRecord?.category || "autre",
          reason: `Habituel : tous les ${stats.averageIntervalDays}j (dernier il y a ${stats.daysSinceLastPurchase}j)`,
          confidence: "high",
          daysSinceLast: stats.daysSinceLastPurchase,
          averageFrequency: stats.averageIntervalDays,
        });
        addedNormSet.add(norm);
      }
    }
  }

  // 4. Baseline Staples: Suggest essentials missing from both shopping list and stock
  for (const staple of ESSENTIAL_STAPLES) {
    const norm = normalizeItemName(staple.name);
    if (addedNormSet.has(norm)) continue;

    // Check if in stock
    const inStock = stockItems.some((s) => {
      const sNorm = normalizeItemName(s.ingredient?.name || "");
      return sNorm === norm || sNorm.includes(norm);
    });

    if (!inStock) {
      // Not in stock and not on list
      const stats = calculateItemFrequency(staple.name, history, now);
      const reason =
        stats.daysSinceLastPurchase !== null
          ? `Basique récurrent (dernier il y a ${stats.daysSinceLastPurchase}j)`
          : "Basique incontournable manquant";

      suggestions.push({
        name: staple.name,
        category: staple.category,
        reason,
        confidence: "medium",
        averageFrequency: staple.defaultIntervalDays,
      });
      addedNormSet.add(norm);
    }
  }

  return suggestions.slice(0, 8);
};
