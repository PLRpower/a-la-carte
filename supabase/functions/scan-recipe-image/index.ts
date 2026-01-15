import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry helper function
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      // If server error or rate limit, throw to retry
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        throw new Error(`Attempt ${i + 1} failed with status ${response.status}`);
      }
      return response;
    } catch (err) {
      console.warn(`Retry ${i + 1}/${retries} failed:`, err);
      if (i === retries - 1) throw err;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
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

    // Clean base64 string (remove data:image/jpeg;base64, prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const systemPrompt = `You are a professional chef assistant with image recognition capabilities. Analyze the recipe image and extract ALL recipes found. Return ONLY valid JSON with this exact structure:
{
  "recipes": [
    {
      "title": "Recipe name",
      "description": "Brief description",
      "difficulty": "facile" or "moyen" or "difficile",
      "prep_time": number (in minutes),
      "cook_time": number (in minutes),
      "servings": number,
      "category": "petit_dejeuner" or "dejeuner" or "diner" or "dessert" or "encas" or "vegetarien" or "vegan",
      "instructions": "Complete step-by-step instructions as a single text",
      "ingredients": [
        {
          "name": "number unit (g or kg or ml or l or cl or tasse or c.à.s or c.à.c or pièce) ingredient name",
        }
      ]
    }
  ]
}
IMPORTANT:
- Translate everything to French.
- If multiple recipes are visible in the image, extract ALL of them into the "recipes" array.
- For "difficulty": Be stricter. If a recipe has many ingredients (>8), complex steps, or takes long to prepare, mark it as "difficile". If it requires cooking techniques, mark as "moyen". Only very simple, quick recipes should be "facile". When in doubt between two levels, choose the harder one.
- If a value is missing or unclear, make a reasonable estimate.
- In the "instructions" field, preserve the exact formatting of the steps as it appears in the image: keep numbering, bullets, sub-steps, or titles if they exist. Every step or sub-step must be separated by a newline character "\n". Do not merge steps or rewrite their structure.
- Ensure the JSON is valid and parsable.
- DO NOT use markdown formatting (no \`\`\`json blocks). Return RAW JSON only.`;

    let response;
    try {
      response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: systemPrompt },
                { inline_data: { mime_type: "image/jpeg", data: base64Data } }
              ]
            }]
          }),
        }
      );
    } catch (err) {
      console.error("Gemini API request failed after retries:", err);
      // Determine if it was a quota issue or network issue
      let userMessage = "L'IA ne répond pas pour le moment. Veuillez réessayer plus tard.";
      if (err instanceof Error && err.message.includes("429")) {
        userMessage = "Le quota de demandes d'IA est dépassé. Veuillez patienter quelques instants.";
      }
      return new Response(
        JSON.stringify({ error: userMessage, details: err instanceof Error ? err.message : String(err) }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      let userErr = `Erreur de l'IA (${response.status})`;
      if (response.status === 400) userErr = "L'image envoyée est invalide ou n'a pas pu être traitée.";
      if (response.status === 429) userErr = "Trop de requêtes, veuillez patienter.";

      throw new Error(`${userErr}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("Unexpected Gemini response format:", data);
      throw new Error("L'IA n'a pas renvoyé de contenu exploitable. L'image est peut-être floue ou ne contient pas de recette lisible.");
    }

    const contentText = data.candidates[0].content.parts[0].text;

    // Clean up the response text to ensure it's valid JSON
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : contentText;

    let recipe;
    try {
      recipe = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON parse error:", e);
      console.error("Raw content:", contentText);
      throw new Error("L'IA a mal structuré sa réponse. Veuillez réessayer avec une photo plus claire.");
    }

    // Validate recipe structure slightly
    if (!recipe.recipes && !recipe.ingredients) { // supporting both formats implicitly
      // If it extracted something weird
      console.warn("Extracted JSON seems valid but empty or wrong schema", recipe);
    }

    return new Response(JSON.stringify({ recipes: recipe.recipes || (recipe.title ? [recipe] : []) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Global Error Handler:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
