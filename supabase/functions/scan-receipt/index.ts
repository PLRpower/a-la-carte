import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        throw new Error(`Attempt ${i + 1} failed with status ${response.status}`);
      }
      return response;
    } catch (err) {
      console.warn(`Retry ${i + 1}/${retries} failed:`, err);
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, backoff * Math.pow(2, i)));
    }
  }
  throw new Error("All retries failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("Configuration Error: GEMINI_API_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Le serveur n'est pas configuré correctement (clé API manquante)." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Aucune image n'a été reçue." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const systemPrompt = `Tu es un assistant expert en OCR de tickets de caisse de supermarché et de factures Drive (Carrefour, E.Leclerc, Auchan, Lidl, Intermarché, Monoprix, Aldi, Grand Frais, etc.).
Analyse l'image du ticket de caisse et extrais TOUS les produits alimentaires/ingrédients achetés.

RÈGLES IMPORTANTES :
1. Ignore STRICTEMENT les articles non alimentaires (sacs plastiques, papier toilette, piles, produits d'entretien/lessive, cosmétiques, magazines, réductions/promotions, lignes de sous-total, moyen de paiement, etc.).
2. Les tickets de caisse utilisent des abréviations cryptiques. Traduis et développe CHAQUE abréviation en nom d'ingrédient français clair et naturel.
   Exemples :
   - "PDT CONSO SAC 2.5KG" -> "Pommes de terre" (quantité: 2.5, unité: "kg")
   - "BLC POULET FERM X4" -> "Blancs de poulet" (quantité: 4, unité: "piece")
   - "LAIT 1/2 ECR 1L" -> "Lait demi-écrémé" (quantité: 1, unité: "l")
   - "CREME EPAISSE 30% 20CL" -> "Crème fraîche épaisse" (quantité: 200, unité: "ml")
   - "OEUF PLEIN AIR X10" -> "Œufs" (quantité: 10, unité: "piece")
   - "BANANE CAVENDISH VRAC" -> "Bananes" (quantité: poids indiqué ou 1, unité: "kg" ou "piece")
   - "JAMB SUP DD 4TR" -> "Jambon blanc" (quantité: 4, unité: "piece")
   - "PATE FEUILLETE PUR BEUR" -> "Pâte feuilletée" (quantité: 1, unité: "piece")
3. Unités autorisées obligatoirement parmi : "g", "kg", "ml", "l", "piece", "cuillere_soupe", "cuillere_the".
4. Catégories autorisées obligatoirement parmi :
   - "fruits_legumes"
   - "boucherie"
   - "poissonnerie"
   - "produits_laitiers"
   - "epicerie_salee"
   - "epicerie_sucree"
   - "produits_frais"
   - "produits_surgeles"
   - "boissons"
   - "autre"
5. Renvoie UNIQUEMENT un JSON valide au format exact suivant, sans backticks markdown :
{
  "store_name": "Nom de l'enseigne ou supermarché détecté (ou null)",
  "date": "Date du ticket au format AAAA-MM-JJ (ou null)",
  "items": [
    {
      "name": "Nom clair de l'ingrédient",
      "raw_text": "Texte brut original sur le ticket",
      "quantity": 1,
      "unit": "piece",
      "category": "fruits_legumes"
    }
  ]
}`;

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { inline_data: { mime_type: "image/jpeg", data: base64Data } },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Erreur IA (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("L'IA n'a pas pu analyser le ticket. L'image est peut-être floue.");
    }

    const contentText = data.candidates[0].content.parts[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : contentText;

    let receiptData;
    try {
      receiptData = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON parse error:", e, contentText);
      throw new Error("Erreur de formatage de la réponse de l'IA.");
    }

    return new Response(JSON.stringify(receiptData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Receipt Scanner Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
