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
      await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
    }
  }
  throw new Error("All retries failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { 
      stock, 
      preferences, 
      startDate,
      availableCatalogTitles 
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("Configuration Error: GEMINI_API_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Clé API Gemini manquante sur le serveur." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const budget = preferences?.budget || "equilibre";
    const vegetarienCount = preferences?.vegetarienCount ?? 3;
    const quickCount = preferences?.quickCount ?? 4;
    const prioritizeStock = preferences?.prioritizeStock ?? true;

    const stockSummary = stock && stock.length > 0
      ? stock.map((s: any) => `${s.name} (${s.quantity} ${s.unit})`).join(", ")
      : "Aucun ingrédient spécifique.";

    const systemPrompt = `Tu es un chef cuisinier expert en organisation familiale, planification de repas et anti-gaspillage.
Génère un menu complet de la semaine sur 7 jours (Lundi à Dimanche) avec 14 repas (7 Déjeuners / Midi et 7 Dîners / Soir).

Contraintes de l'utilisateur :
- Budget : ${budget} (economique = ingrédients simples et abordables, equilibre = varié de saison, gourmand = raffiné et créatif).
- Repas végétariens : au minimum ${vegetarienCount} repas sans viande ni poisson.
- Repas rapides (<= 25 min chrono) : au minimum ${quickCount} repas express.
- Anti-gaspillage : ${prioritizeStock ? `PRIORITÉ ABSOLUE : Utiliser au maximum les ingrédients déjà disponibles dans le stock : ${stockSummary}` : "Équilibré et de saison"}.

Règles de composition :
- Variété : Ne pas répéter le même féculent ou la même protéine deux fois de suite.
- Déjeuner plutôt simple ou emportable (salade composée, bowl, pâtes, wrap, tartine).
- Dîner convivial ou réconfortant (plat mijoté, gratin, soupe repas, curry).
- Titres évocateurs et appétissants en français.
- Temps de préparation et cuisson réalistes.

Format de sortie STRICT : JSON pur (sans markdown) avec cette structure :
{
  "plan": [
    {
      "dayName": "Lundi",
      "lunch": {
        "title": "Nom de la recette midi",
        "description": "Courte description appétissante",
        "prep_time": 10,
        "cook_time": 15,
        "is_vegetarian": false,
        "is_quick": true,
        "difficulty": "facile",
        "main_stock_used": ["tomate", "oeuf"],
        "ingredients": [
          { "name": "Tomates", "quantity": 2, "unit": "piece" },
          { "name": "Oeufs", "quantity": 3, "unit": "piece" }
        ]
      },
      "dinner": {
        "title": "Nom de la recette soir",
        "description": "Courte description",
        "prep_time": 15,
        "cook_time": 25,
        "is_vegetarian": true,
        "is_quick": false,
        "difficulty": "facile",
        "main_stock_used": [],
        "ingredients": [
          { "name": "Courgettes", "quantity": 2, "unit": "piece" },
          { "name": "Pâtes", "quantity": 250, "unit": "g" }
        ]
      }
    }
  ]
}`;

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!contentText) {
      throw new Error("Réponse vide de l'IA");
    }

    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : contentText;
    const parsed = JSON.parse(jsonString);

    return new Response(JSON.stringify({ success: true, plan: parsed.plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Plan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur génération" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
