import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const { url } = await req.json();
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

        if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        if (!url) {
            throw new Error("URL is required");
        }

        // Fetch the webpage
        console.log("Fetching URL:", url);
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();

        // Parse HTML to extract text content
        const doc = new DOMParser().parseFromString(html, "text/html");
        if (!doc) {
            throw new Error("Failed to parse HTML");
        }

        // Remove script and style elements
        const scripts = doc.querySelectorAll("script, style, nav, header, footer, aside");
        scripts.forEach((el) => el.remove());

        // Get the main content
        const bodyText = doc.body?.textContent || "";

        // Limit text length to avoid token limits (approximately 10000 characters)
        const truncatedText = bodyText.substring(0, 10000);

        console.log("Extracted text length:", truncatedText.length);

        // Use Gemini to extract recipe information
        const systemPrompt = `You are a professional chef assistant. Analyze the following webpage text and extract the recipe information. Return ONLY valid JSON with this exact structure:
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
      "name": "number unit (g or kg or ml or l or cl or tasse or c.à.s or c.à.c or pièce) ingredient name"
    }
  ]
}
IMPORTANT: 
- Translate everything to French.
- If a value is missing or unclear, make a reasonable estimate.
- In the "instructions" field, preserve the formatting of the steps: keep numbering, bullets, sub-steps, or titles if they exist. Every step or sub-step must be separated by a newline character "\\n".
- Ensure the JSON is valid and parsable.
- DO NOT use markdown formatting (no \`\`\`json blocks). Return RAW JSON only.

Webpage text:
${truncatedText}`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt }
                    ]
                }]
            }),
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error("Gemini API error:", geminiResponse.status, errorText);
            throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`);
        }

        const data = await geminiResponse.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error("Unexpected Gemini response format:", data);
            throw new Error("Invalid response format from Gemini API");
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
