import { IngredientCategory, MeasurementUnit } from "@/types/database";

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  category: IngredientCategory;
  nutriscore?: "a" | "b" | "c" | "d" | "e";
  allergens: string[];
  quantity?: number;
  unit: MeasurementUnit;
  imageUrl?: string;
  rawQuantity?: string;
}

const ALLERGEN_LABELS_FR: Record<string, string> = {
  "en:gluten": "Gluten",
  "en:milk": "Lait",
  "en:eggs": "Œufs",
  "en:nuts": "Fruits à coque",
  "en:peanuts": "Arachides",
  "en:sesame-seeds": "Sésame",
  "en:soybeans": "Soja",
  "en:fish": "Poisson",
  "en:crustaceans": "Crustacés",
  "en:molluscs": "Mollusques",
  "en:mustard": "Moutarde",
  "en:celery": "Céleri",
  "en:lupin": "Lupin",
  "en:sulphur-dioxide-and-sulphites": "Sulfites",
};

export const mapCategoryFromOFF = (categoriesTags?: string[], categoriesStr?: string): IngredientCategory => {
  const combined = [
    ...(categoriesTags || []),
    ...(categoriesStr ? categoriesStr.split(",").map((s) => s.trim()) : []),
  ]
    .join(" ")
    .toLowerCase();

  if (/boisson|beverage|jus|soda|eau|biere|vin|drink|the|cafe|coffee|sirop/i.test(combined)) {
    return "boissons";
  }
  if (/fruit|legume|vegetable|salade|tomate|pomme|carotte|champignon|herbe/i.test(combined)) {
    return "fruits_legumes";
  }
  if (/viande|meat|poulet|boeuf|porc|charcuterie|jambon|sauciss|volaille|dinde/i.test(combined)) {
    return "boucherie";
  }
  if (/poisson|fish|seafood|saumon|thon|crevette|crustac|cabillaud/i.test(combined)) {
    return "poissonnerie";
  }
  if (/lait|fromage|cheese|yaourt|dairy|beurre|creme|cream|yogurt/i.test(combined)) {
    return "produits_laitiers";
  }
  if (/surgele|frozen|glace|ice cream/i.test(combined)) {
    return "produits_surgeles";
  }
  if (/chocolat|biscuit|gateau|cake|sucre|bonbon|confiture|tartiner|cacao|sweet|confiserie/i.test(combined)) {
    return "epicerie_sucree";
  }
  if (/pate|riz|pasta|rice|conserve|sauce|huile|epice|sel|snack|chips|farine|vinaigre/i.test(combined)) {
    return "epicerie_salee";
  }
  if (/frais|traiteur/i.test(combined)) {
    return "produits_frais";
  }

  return "autre";
};

export const parseQuantityString = (raw?: string): { quantity: number; unit: MeasurementUnit } => {
  if (!raw) return { quantity: 1, unit: "piece" };

  const cleaned = raw.toLowerCase().trim();

  // Match e.g. "400 g", "1.5 kg", "1,5kg", "75 cl", "1 l", "500ml", "6 x 25cl"
  const multiMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*([a-z]+)/);
  if (multiMatch) {
    const count = parseFloat(multiMatch[1].replace(",", "."));
    const single = parseFloat(multiMatch[2].replace(",", "."));
    const rawUnit = multiMatch[3];
    const total = count * single;
    return normalizeUnit(total, rawUnit);
  }

  const match = cleaned.match(/(\d+(?:[.,]\d+)?)\s*([a-z]+)?/);
  if (match) {
    const val = parseFloat(match[1].replace(",", "."));
    const rawUnit = match[2] || "piece";
    return normalizeUnit(val, rawUnit);
  }

  return { quantity: 1, unit: "piece" };
};

const normalizeUnit = (val: number, rawUnit: string): { quantity: number; unit: MeasurementUnit } => {
  const u = rawUnit.toLowerCase();
  if (u === "kg" || u === "kilo" || u === "kilos") return { quantity: val, unit: "kg" };
  if (u === "g" || u === "gr" || u === "gramme" || u === "grammes") return { quantity: val, unit: "g" };
  if (u === "l" || u === "litre" || u === "litres") return { quantity: val, unit: "l" };
  if (u === "cl") return { quantity: val * 10, unit: "ml" };
  if (u === "ml") return { quantity: val, unit: "ml" };
  return { quantity: val || 1, unit: "piece" };
};

export const fetchProductByBarcode = async (barcode: string): Promise<ScannedProduct> => {
  const cleanedBarcode = barcode.trim();
  if (!cleanedBarcode) {
    throw new Error("Code-barres invalide");
  }

  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    cleanedBarcode
  )}.json?fields=product_name,product_name_fr,brands,categories,categories_tags,nutriscore_grade,allergens,allergens_tags,image_front_url,quantity`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ALaCarteApp/1.0 (contact@alacarte.app)",
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur OpenFoodFacts (${response.status})`);
  }

  const data = await response.json();
  if (data.status !== 1 || !data.product) {
    throw new Error("Produit non trouvé sur Open Food Facts");
  }

  const p = data.product;
  const name = p.product_name_fr || p.product_name || "Produit sans nom";
  const brand = p.brands ? p.brands.split(",")[0].trim() : undefined;
  const category = mapCategoryFromOFF(p.categories_tags, p.categories);

  const rawNutri = (p.nutriscore_grade || "").toLowerCase();
  const nutriscore = ["a", "b", "c", "d", "e"].includes(rawNutri)
    ? (rawNutri as "a" | "b" | "c" | "d" | "e")
    : undefined;

  const allergensList: string[] = [];
  if (Array.isArray(p.allergens_tags)) {
    for (const tag of p.allergens_tags) {
      const translated = ALLERGEN_LABELS_FR[tag] || tag.replace(/^en:|^fr:/, "");
      if (translated && !allergensList.includes(translated)) {
        allergensList.push(translated.charAt(0).toUpperCase() + translated.slice(1));
      }
    }
  } else if (typeof p.allergens === "string" && p.allergens.trim()) {
    p.allergens.split(",").forEach((a: string) => {
      const clean = a.trim();
      if (clean) allergensList.push(clean);
    });
  }

  const { quantity, unit } = parseQuantityString(p.quantity);

  return {
    barcode: cleanedBarcode,
    name,
    brand,
    category,
    nutriscore,
    allergens: allergensList,
    quantity,
    unit,
    imageUrl: p.image_front_url,
    rawQuantity: p.quantity,
  };
};

export const NUTRISCORE_CONFIG: Record<
  "a" | "b" | "c" | "d" | "e",
  { bg: string; text: string; label: string }
> = {
  a: { bg: "bg-[#038141]", text: "text-white", label: "Nutri-Score A" },
  b: { bg: "bg-[#85BB2F]", text: "text-white", label: "Nutri-Score B" },
  c: { bg: "bg-[#FECB02]", text: "text-neutral-900", label: "Nutri-Score C" },
  d: { bg: "bg-[#EE8100]", text: "text-white", label: "Nutri-Score D" },
  e: { bg: "bg-[#E63E11]", text: "text-white", label: "Nutri-Score E" },
};
