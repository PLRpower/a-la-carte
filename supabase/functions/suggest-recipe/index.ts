import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry helper function (same as in scan-recipe-image)
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
    const { ingredients, preferences, avoidRecipes, expiringIngredients } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("Configuration Error: GEMINI_API_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Le serveur n'est pas configuré correctement (clé API manquante)." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default preferences
    const creativity = preferences?.creativity || "original"; // classic, original, crazy
    const mealType = preferences?.mealType || "any"; // breakfast, lunch, dinner, dessert, snack
    const focus = preferences?.focus || "use_stock"; // use_stock, discovery

    const avoidText = avoidRecipes && avoidRecipes.length > 0
      ? `\n- **Avoid these previously suggested recipes (the user wants something different):** ${avoidRecipes.join(", ")}`
      : "";

    const expiringText = expiringIngredients && expiringIngredients.length > 0
      ? `\n- 🚨 **PRIORITÉ ABSOLUE ANTI-GASPILLAGE (DLC < 48H) :** Les ingrédients suivants périment dans moins de 48 heures et DOIVENT IMPÉRATIVEMENT être cuisinés en priorité dans cette recette : ${expiringIngredients.map((i: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => `${i.name} (${i.quantity} ${i.unit})`).join(", ")}. Conçois la recette autour de ces ingrédients pour éviter tout gaspillage !`
      : "";

    const systemPrompt = `You are a creative professional chef assistant. 
Generate a recipe suggestion for a user based on their available stock, anti-waste urgency, and preferences.

**User Constraints:**
- **Available Ingredients:** ${ingredients && ingredients.length > 0 ? ingredients.map((i: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => `${i.name} (${i.quantity} ${i.unit})`).join(", ") : 'Aucun ingrédient en stock. Suggère une délicieuse recette classique utilisant des ingrédients de base courants.'}.
- **Meal Type:** ${mealType === 'any' ? 'Suitable for any meal' : mealType}.
- **Creativity Level:** ${creativity} (classic = distinct traditional dish, original = modern twist, crazy = unexpected fusion).
- **Focus:** ${focus === 'use_stock' ? 'Maximize use of provided ingredients (try to avoid buying new things)' : 'Use provided ingredients as base but feel free to add common complements'}.${avoidText}${expiringText}

**Output Requirements:**
Return ONLY valid JSON with this exact structure:
{
  "title": "Recipe Name (in French)",
  "description": "Appetizing description (in French)",
  "difficulty": "facile" | "moyen" | "difficile",
  "prep_time": number (minutes),
  "cook_time": number (minutes),
  "servings": number,
  "category": "petit_dejeuner" | "dejeuner" | "diner" | "dessert" | "encas" | "vegetarien" | "vegan",
  "instructions": "Step-by-step instructions in French.",
  "anti_gaspi_ingredients": ["list of expiring ingredients saved by this dish"],
  "ingredients": [
    {
      "name": "ingredient name (French)",
      "quantity": number (estimate),
      "unit": "g" | "kg" | "ml" | "l" | "cup" | "tbsp" | "tsp" | "oz" | "lb" | "piece"
    }
  ]
}

**IMPORTANT:**
- The recipe MUST be in French.
- Use the provided ingredients intelligently.
- Be creative but realistic.
- Do not output markdown code blocks.`;

    let response;
    try {
      response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          }),
        }
      );
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      console.error("Gemini API request failed:", err);
      let userMessage = "L'IA ne répond pas pour le moment.";
      if (err.message?.includes("429")) userMessage = "Le service IA est surchargé (quota dépassé), réessayez dans une minute.";
      return new Response(
        JSON.stringify({ error: userMessage, details: String(err) }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from AI");
    }

    const contentText = data.candidates[0].content.parts[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : contentText;

    let recipe;
    try {
      recipe = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON parse error", e);
      return new Response(
        JSON.stringify({ error: "L'IA a généré une réponse invalide. Réessayez." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue du serveur" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
