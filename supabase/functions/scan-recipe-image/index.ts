import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Clean base64 string (remove data:image/jpeg;base64, prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const systemPrompt = `You are a professional chef assistant with image recognition capabilities. Analyze the recipe image and extract ALL recipe information. Return ONLY valid JSON with this exact structure:
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
      "name": "ingredient name",
      "quantity": number,
      "unit": "g" or "kg" or "ml" or "l" or "tasse" or "c.à.s" or "c.à.c" or "pièce"
    }
  ]
}
IMPORTANT: 
- Translate everything to French.
- If a value is missing or unclear, make a reasonable estimate.
- Ensure the JSON is valid and parsable.
- DO NOT use markdown formatting (no \`\`\`json blocks). Return RAW JSON only.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("Unexpected Gemini response format:", data);
      throw new Error("Invalid response format from Gemini API");
    }

    const contentText = data.candidates[0].content.parts[0].text;

    // Clean up the response text to ensure it's valid JSON
    // Sometimes models wrap JSON in ```json ... ```
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : contentText;

    let recipe;
    try {
      recipe = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON parse error:", e);
      console.error("Raw content:", contentText);
      throw new Error("Failed to parse recipe JSON from AI response");
    }

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
