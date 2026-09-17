/**
 * Smart Ingredient Substitutions
 * Culinary substitutions database and matching utilities for French cooking.
 */

export interface SubstituteOption {
  name: string;
  ratio?: string;
  tip?: string;
}

export interface IngredientSubstitution {
  key: string;
  canonicalName: string;
  category: "matiere_grasse" | "produit_laitier" | "oeuf" | "farine_fecule" | "sucre" | "condiment" | "liquide" | "autre";
  substitutes: SubstituteOption[];
  quickHint: string;
}

export const SUBSTITUTIONS_DATABASE: IngredientSubstitution[] = [
  {
    key: "beurre",
    canonicalName: "Beurre",
    category: "matiere_grasse",
    substitutes: [
      {
        name: "Huile végétale neutre (tournesol, colza)",
        ratio: "80% du poids de beurre (ex: 100g beurre = 80ml huile)",
        tip: "Parfait pour les gâteaux moelleux et la cuisson.",
      },
      {
        name: "Compote de pommes non sucrée",
        ratio: "1 pour 1 en poids",
        tip: "Allège les pâtisseries (gâteaux au chocolat, muffins) sans altérer le moelleux.",
      },
      {
        name: "Purée d'oléagineux (amande, noisette)",
        ratio: "1 pour 1 en poids",
        tip: "Apporte un goût subtil et une texture fondante aux biscuits et pâtes à tarte.",
      },
      {
        name: "Huile d'olive",
        ratio: "80% du poids de beurre",
        tip: "Idéal pour les préparations salées, pâtes et sautés.",
      },
      {
        name: "Yaourt grec ou fromage blanc",
        ratio: "1 pour 1 en poids",
        tip: "Pour gâteaux légers et brioches allégées.",
      },
    ],
    quickHint: "Pas de beurre ? Remplacez par 80% d'huile végétale ou compote de pommes.",
  },
  {
    key: "creme_fraiche",
    canonicalName: "Crème fraîche",
    category: "produit_laitier",
    substitutes: [
      {
        name: "Yaourt grec ou fromage blanc",
        ratio: "1 pour 1",
        tip: "Ajouter hors du feu pour éviter qu'il ne caille en sauce.",
      },
      {
        name: "Lait de coco",
        ratio: "1 pour 1",
        tip: "Idéal dans les currys, soupes, veloutés et plats exotiques.",
      },
      {
        name: "Crème de soja ou avoine cuisine",
        ratio: "1 pour 1",
        tip: "Alternative végétale neutre qui supporte très bien la cuisson.",
      },
      {
        name: "Mascarpone ou Ricotta détendue",
        ratio: "Détendre avec un trait de lait",
        tip: "Donne une onctuosité incomparable aux sauces et gratins.",
      },
    ],
    quickHint: "Pas de crème ? Remplacez par du yaourt grec, du lait de coco ou du fromage blanc.",
  },
  {
    key: "oeuf",
    canonicalName: "Œuf",
    category: "oeuf",
    substitutes: [
      {
        name: "Compote de pommes non sucrée",
        ratio: "50g (1/4 de tasse) par œuf",
        tip: "Parfait liant et humidificateur pour muffins et gâteaux.",
      },
      {
        name: "Banane mûre écrasée",
        ratio: "1/2 banane par œuf",
        tip: "Idéal pour crêpes, pancakes et banana bread (ajoute une note fruitée).",
      },
      {
        name: "Graines de chia ou de lin moulues",
        ratio: "1 c.à.s de graines + 3 c.à.s d'eau tiède (laisser gélifier 10 min)",
        tip: "Excellent liant vegan riche en oméga-3 pour pains et biscuits.",
      },
      {
        name: "Fécule de maïs (Maïzena) + eau",
        ratio: "1 c.à.s de fécule + 2 c.à.s d'eau par œuf",
        tip: "Idéal pour lier sauces, crèmes et entremets.",
      },
      {
        name: "Aquafaba (jus de pois chiches)",
        ratio: "3 c.à.s par blanc d'œuf à monter",
        tip: "Se monte en neige ferme pour mousses au chocolat et meringues !",
      },
    ],
    quickHint: "Pas d'œuf ? Remplacez par 50g de compote, 1/2 banane écrasée ou fécule + eau.",
  },
  {
    key: "farine",
    canonicalName: "Farine de blé",
    category: "farine_fecule",
    substitutes: [
      {
        name: "Fécule de maïs (Maïzena)",
        ratio: "Diviser la quantité par 2 si utilisée pour lier",
        tip: "Donne des sauces soyeuses ou des génoises ultra-légères.",
      },
      {
        name: "Farine d'avoine (flocons mixés finement)",
        ratio: "1 pour 1 en poids",
        tip: "Riche en fibres, parfaite pour crêpes, muffins et cookies.",
      },
      {
        name: "Mélange farine de riz + fécule (sans gluten)",
        ratio: "70% farine de riz + 30% fécule",
        tip: "Alternative sans gluten neutre et polyvalente.",
      },
    ],
    quickHint: "Pas de farine ? Remplacez par de la fécule de maïs (dose réduite de moitié) ou flocons mixés.",
  },
  {
    key: "sucre",
    canonicalName: "Sucre blanc / en poudre",
    category: "sucre",
    substitutes: [
      {
        name: "Miel ou Sirop d'érable / agave",
        ratio: "Réduire la quantité de 25% (ex: 100g sucre = 75g miel)",
        tip: "Diminuer légèrement les autres liquides de la recette de 2 à 3 c.à.s.",
      },
      {
        name: "Cassonade ou Sucre complet",
        ratio: "1 pour 1 en poids",
        tip: "Apporte une note caramélisée chaleureuse.",
      },
      {
        name: "Compote de pommes maison",
        ratio: "1 pour 1 en diminuant un peu le beurre",
        tip: "Sucre naturellement et apporte du moelleux.",
      },
    ],
    quickHint: "Pas de sucre ? Remplacez par du miel (dose -25%), du sirop d'érable ou de la cassonade.",
  },
  {
    key: "lait",
    canonicalName: "Lait de vache",
    category: "liquide",
    substitutes: [
      {
        name: "Boisson végétale (avoine, amande, soja)",
        ratio: "1 pour 1",
        tip: "Le lait d'avoine est le plus neutre en goût, le soja le plus protéiné.",
      },
      {
        name: "Eau + filet de matière grasse",
        ratio: "1 pour 1 avec 1 c.à.c d'huile ou beurre",
        tip: "Dépanne parfaitement pour la pâte à crêpes, gaufres et pains.",
      },
      {
        name: "Yaourt ou fromage blanc allongé d'eau",
        ratio: "50% yaourt + 50% eau",
        tip: "Recrée la consistance et l'onctuosité du lait entier.",
      },
    ],
    quickHint: "Pas de lait ? Remplacez par du lait végétal (avoine/soja) ou de l'eau avec un peu d'huile.",
  },
  {
    key: "vin_blanc",
    canonicalName: "Vin blanc de cuisine",
    category: "liquide",
    substitutes: [
      {
        name: "Bouillon de légumes + 1 filet de jus de citron",
        ratio: "1 pour 1 en volume",
        tip: "Apporte l'acidité et le fruité du vin sans une goutte d'alcool.",
      },
      {
        name: "Bouillon + 1 c.à.c de vinaigre de cidre",
        ratio: "1 pour 1 avec le bouillon",
        tip: "Idéal pour déglacer risottos, viandes et sauces crémées.",
      },
    ],
    quickHint: "Pas de vin blanc ? Remplacez par du bouillon avec un filet de citron ou vinaigre de cidre.",
  },
  {
    key: "levure_chimique",
    canonicalName: "Levure chimique",
    category: "farine_fecule",
    substitutes: [
      {
        name: "Bicarbonate de soude + Jus de citron ou vinaigre",
        ratio: "1 c.à.c de bicarbonate + 1 c.à.s de citron par sachet de levure",
        tip: "La réaction acide libère du CO2 instantanément, enfourner sans attendre.",
      },
    ],
    quickHint: "Pas de levure ? Remplacez par 1 c.à.c de bicarbonate + 1 c.à.s de jus de citron.",
  },
  {
    key: "chapelure",
    canonicalName: "Chapelure",
    category: "farine_fecule",
    substitutes: [
      {
        name: "Flocons d'avoine mixés",
        ratio: "1 pour 1",
        tip: "Panure croustillante, dorée et riche en fibres.",
      },
      {
        name: "Biscottes ou crackers écrasés",
        ratio: "1 pour 1",
        tip: "Alternative rapide et très croustillante.",
      },
      {
        name: "Parmesan râpé ou polenta",
        ratio: "1 pour 1",
        tip: "Crée une croûte parfumée et ultra-dorée à la cuisson.",
      },
    ],
    quickHint: "Pas de chapelure ? Remplacez par des flocons d'avoine mixés, biscottes écrasées ou parmesan.",
  },
  {
    key: "oignon",
    canonicalName: "Oignon",
    category: "condiment",
    substitutes: [
      {
        name: "Échalotes",
        ratio: "2 échalotes pour 1 oignon moyen",
        tip: "Goût plus subtil et raffiné, parfait en sauté.",
      },
      {
        name: "Blanc de poireau émincé",
        ratio: "Même volume",
        tip: "Fond parfaitement en cuisson douce.",
      },
      {
        name: "Oignon déshydraté ou en poudre",
        ratio: "1 c.à.s par oignon",
        tip: "Idéal pour relever sauces, mijotés et marinades.",
      },
    ],
    quickHint: "Pas d'oignon ? Remplacez par des échalotes, du blanc de poireau émincé ou oignon en poudre.",
  },
  {
    key: "ail",
    canonicalName: "Ail",
    category: "condiment",
    substitutes: [
      {
        name: "Ail en poudre / semoule",
        ratio: "1/4 c.à.c de poudre par gousse fraîche",
        tip: "Diffuse un arôme chaud et homogène.",
      },
      {
        name: "Échalote + pointe de poivre",
        ratio: "1/2 échalote par gousse",
        tip: "Apporte du caractère et de l'arôme.",
      },
      {
        name: "Ciboulette fraîche",
        ratio: "1 c.à.s ciselée",
        tip: "Note alliacée fraîche en touche finale.",
      },
    ],
    quickHint: "Pas d'ail ? Remplacez par 1/4 c.à.c d'ail en poudre ou une demi-échalote.",
  },
  {
    key: "parmesan",
    canonicalName: "Parmesan / Grana Padano",
    category: "produit_laitier",
    substitutes: [
      {
        name: "Pecorino Romano",
        ratio: "1 pour 1 (un peu plus salé)",
        tip: "La tradition italienne pur jus pour pâtes et gratins.",
      },
      {
        name: "Comté ou Cantal affiné râpé",
        ratio: "1 pour 1",
        tip: "Apporte du piquant et fond à merveille.",
      },
      {
        name: "Levure maltée (vegan)",
        ratio: "1 pour 1",
        tip: "Saveur fromagée umami bluffante sans produit laitier.",
      },
    ],
    quickHint: "Pas de parmesan ? Remplacez par du Pecorino, du Comté affiné râpé ou de la levure maltée.",
  },
  {
    key: "moutarde",
    canonicalName: "Moutarde de Dijon",
    category: "condiment",
    substitutes: [
      {
        name: "Moutarde à l'ancienne ou douce",
        ratio: "1 pour 1",
        tip: "Grains croquants et goût plus doux.",
      },
      {
        name: "Mayonnaise + trait de vinaigre et poivre",
        ratio: "1 pour 1",
        tip: "Émulsifie parfaitement les vinaigrettes sans piquant excessif.",
      },
      {
        name: "Wasabi ou raifort râpé",
        ratio: "1/3 de dose",
        tip: "Puissance piquante similaire.",
      },
    ],
    quickHint: "Pas de moutarde ? Remplacez par de la moutarde à l'ancienne ou mayonnaise + vinaigre.",
  },
  {
    key: "citron",
    canonicalName: "Jus de citron",
    category: "condiment",
    substitutes: [
      {
        name: "Vinaigre de cidre ou vinaigre blanc doux",
        ratio: "1 c.à.c de vinaigre pour 1 c.à.s de jus de citron",
        tip: "Recrée la vivacité acide dans sauces, marinades et pâtisseries.",
      },
      {
        name: "Jus de citron vert (lime)",
        ratio: "1 pour 1",
        tip: "Parfum exotique légèrement plus aromatique.",
      },
    ],
    quickHint: "Pas de citron ? Remplacez par du vinaigre de cidre ou jus de citron vert.",
  },
  {
    key: "tomate_concassee",
    canonicalName: "Tomates concassées / Coulis",
    category: "autre",
    substitutes: [
      {
        name: "Concentré de tomate + eau",
        ratio: "2 c.à.s de concentré diluées dans 150ml d'eau",
        tip: "Goût concentré parfait pour sauces bolognaises et mijotés.",
      },
      {
        name: "Tomates fraîches pelées et concassées",
        ratio: "Même poids",
        tip: "Fraîcheur estivale garantie.",
      },
    ],
    quickHint: "Pas de coulis de tomate ? Remplacez par 2 c.à.s de concentré dilué dans un verre d'eau.",
  },
  {
    key: "huile_olive",
    canonicalName: "Huile d'olive",
    category: "matiere_grasse",
    substitutes: [
      {
        name: "Huile de colza ou tournesol",
        ratio: "1 pour 1",
        tip: "Goût neutre, supporte bien la cuisson.",
      },
      {
        name: "Beurre fondu",
        ratio: "1.2x en poids (120g beurre = 100ml huile)",
        tip: "Pour la cuisine mijotée ou sauces chaudes.",
      },
    ],
    quickHint: "Pas d'huile d'olive ? Remplacez par de l'huile de colza, tournesol ou un peu de beurre.",
  },
  {
    key: "yaourt",
    canonicalName: "Yaourt nature",
    category: "produit_laitier",
    substitutes: [
      {
        name: "Fromage blanc ou Skyr",
        ratio: "1 pour 1",
        tip: "Texture crémeuse similaire avec plus de protéines.",
      },
      {
        name: "Crème fraîche liquide",
        ratio: "1 pour 1",
        tip: "Apporte de l'onctuosité aux marinades et gâteaux.",
      },
      {
        name: "Lait battu (babeurre) ou lait ribot",
        ratio: "1 pour 1",
        tip: "Idéal pour pancakes et gâteaux moelleux.",
      },
    ],
    quickHint: "Pas de yaourt ? Remplacez par du fromage blanc, du skyr ou un peu de crème liquide.",
  },
  {
    key: "chocolat_noir",
    canonicalName: "Chocolat noir",
    category: "autre",
    substitutes: [
      {
        name: "Poudre de cacao non sucrée + beurre/huile",
        ratio: "3 c.à.s cacao + 1 c.à.s beurre fondu pour 30g de chocolat",
        tip: "Intensité chocolatée pure sans sucre ajouté.",
      },
      {
        name: "Chocolat au lait (en réduisant le sucre de la recette)",
        ratio: "1 pour 1",
        tip: "Diminuer le sucre ajouté de 20g.",
      },
    ],
    quickHint: "Pas de chocolat noir ? Remplacez par du cacao amer mélangé à un peu de beurre.",
  },
];

/**
 * Normalizes an ingredient name for fuzzy matching:
 * - lowercase
 * - remove accents (é -> e, œ -> oe)
 * - remove quantities, punctuation and numbers
 */
export function normalizeIngredientSearch(name: string): string {
  return name
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Mapping keywords to database keys
 */
const KEYWORD_MAP: Array<{ regex: RegExp; key: string }> = [
  { regex: /\bbeurres?\b/i, key: "beurre" },
  { regex: /\bcremes?\b.*(fraiche|liquide|epaisse)?/i, key: "creme_fraiche" },
  { regex: /\b(oeufs?|jaunes?\s+d\s*oeufs?|blancs?\s+d\s*oeufs?)\b/i, key: "oeuf" },
  { regex: /\bfarines?\b/i, key: "farine" },
  { regex: /\b(sucres?|cassonade)\b/i, key: "sucre" },
  { regex: /\blaits?\b/i, key: "lait" },
  { regex: /\bvin\s+blanc\b/i, key: "vin_blanc" },
  { regex: /\blevures?\s+(chimique|alsacienne|patissiere)?\b/i, key: "levure_chimique" },
  { regex: /\bchapelures?\b/i, key: "chapelure" },
  { regex: /\boignons?\b/i, key: "oignon" },
  { regex: /\bails?\b|\bgousses?\s+d\s*ail\b/i, key: "ail" },
  { regex: /\b(parmesan|pecorino|grana\s+padano)\b/i, key: "parmesan" },
  { regex: /\bmoutardes?\b/i, key: "moutarde" },
  { regex: /\b(citrons?|jus\s+de\s+citron)\b/i, key: "citron" },
  { regex: /\b(tomates?\s+concassees?|coulis\s+de\s+tomates?|sauce\s+tomate)\b/i, key: "tomate_concassee" },
  { regex: /\bhuiles?\s+d\s*olive\b/i, key: "huile_olive" },
  { regex: /\b(yaourts?|yogourts?)\b/i, key: "yaourt" },
  { regex: /\bchocolats?\s+noir\b/i, key: "chocolat_noir" },
];

/**
 * Find smart substitution for any given ingredient name
 */
export function findIngredientSubstitution(ingredientName: string): IngredientSubstitution | null {
  if (!ingredientName) return null;
  const normalized = normalizeIngredientSearch(ingredientName);

  // 1. Direct match on key or keywords
  for (const { regex, key } of KEYWORD_MAP) {
    if (regex.test(normalized)) {
      const match = SUBSTITUTIONS_DATABASE.find((item) => item.key === key);
      if (match) return match;
    }
  }

  // 2. Fallback fuzzy check on canonicalName
  const direct = SUBSTITUTIONS_DATABASE.find((item) =>
    normalized.includes(normalizeIngredientSearch(item.canonicalName))
  );
  return direct || null;
}
