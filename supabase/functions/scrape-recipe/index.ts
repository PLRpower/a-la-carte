import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, text } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    if (!url && !text) {
      throw new Error("Une URL ou une description/transcription est requise");
    }

    let extractedText = text ? `[Description/Transcription fournie]:\n${text}\n\n` : "";

    if (url) {
      console.log("Processing URL:", url);
      const lowerUrl = url.toLowerCase();

      // Special handling for TikTok via oEmbed
      if (lowerUrl.includes("tiktok.com")) {
        try {
          const oembedRes = await fetch(
            `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
          );
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            extractedText += `[TikTok Titre/Légende]: ${oembedData.title || ""}\n[Auteur]: ${
              oembedData.author_name || ""
            }\n\n`;
          }
        } catch (e) {
          console.warn("TikTok oEmbed fetch failed:", e);
        }
      }

      // Special handling for YouTube & YouTube Shorts via oEmbed
      if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
        try {
          const ytRes = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
          );
          if (ytRes.ok) {
            const ytData = await ytRes.json();
            extractedText += `[YouTube Titre]: ${ytData.title || ""}\n[Chaîne]: ${
              ytData.author_name || ""
            }\n\n`;
          }
        } catch (e) {
          console.warn("YouTube oEmbed fetch failed:", e);
        }
      }

      // Fetch the webpage (works for blogs, Marmiton, 750g, and standard pages)
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        if (response.ok) {
          const html = await response.text();
          const doc = new DOMParser().parseFromString(html, "text/html");

          if (doc) {
            // Extract OpenGraph / Twitter meta tags
            const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
            const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
            const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content");

            if (ogTitle) extractedText += `[Titre OpenGraph]: ${ogTitle}\n`;
            if (ogDesc) extractedText += `[Description OpenGraph]: ${ogDesc}\n`;
            if (metaDesc && metaDesc !== ogDesc) extractedText += `[Description Meta]: ${metaDesc}\n`;

            // Remove script and style elements
            const scripts = doc.querySelectorAll("script, style, nav, header, footer, aside");
            scripts.forEach((el) => el.remove());

            const bodyText = doc.body?.textContent || "";
            extractedText += "\n" + bodyText;
          }
        }
      } catch (fetchErr) {
        console.warn("Webpage fetch failed:", fetchErr);
        // If we already got oembed text or manual text, we can still proceed!
        if (!extractedText.trim()) {
          throw new Error(
            "Impossible d'accéder au contenu du lien. Si la page est privée ou protégée (Instagram, etc.), veuillez copier-coller sa description directement."
          );
        }
      }
    }

    // Limit text length to avoid token limits
    const truncatedText = extractedText.substring(0, 12000).trim();

    if (!truncatedText) {
      throw new Error(
        "Aucun texte n'a pu être extrait. Veuillez copier-coller la description ou les ingrédients de la vidéo."
      );
    }

    console.log("Text length sent to Gemini:", truncatedText.length);

    const systemPrompt = `Tu es un chef cuisinier professionnel et expert en extraction de recettes.
Analyse le texte suivant issu d'une page web ou d'une vidéo de réseaux sociaux (TikTok, Instagram Reel, YouTube Shorts).
Le texte peut contenir des légendes informelles, des hashtags, des abréviations, des transcriptions orales de vidéo ou des listes d'ingrédients.

Extrais la recette complète et renvoie UNIQUEMENT un JSON valide au format exact suivant, sans aucun bloc markdown :
{
  "title": "Nom de la recette",
  "description": "Courte description appétissante",
  "difficulty": "facile" ou "moyen" ou "difficile",
  "prep_time": nombre (en minutes),
  "cook_time": nombre (en minutes),
  "servings": nombre (nombre de personnes),
  "category": "petit_dejeuner" ou "dejeuner" ou "diner" or "dessert" ou "encas" ou "vegetarien" ou "vegan",
  "instructions": "Instructions complètes étape par étape séparées par des retours à la ligne \\n",
  "ingredients": [
    {
      "name": "quantité unité nom_de_l_ingrédient (ex: 200 g de farine, 2 cuillères à soupe d'huile d'olive, 3 œufs)"
    }
  ]
}

RÈGLES IMPORTANTES :
- Tout doit être rédigé en français.
- Déduis les ingrédients et les quantités même s'ils sont décrits de manière familière ou énumérés dans la transcription.
- Si le temps ou le nombre de portions n'est pas spécifié, fais une estimation culinaire réaliste.
- Structure bien les étapes dans "instructions" avec des étapes claires séparées par "\\n".
- Renvoie UNIQUEMENT le JSON brut sans \`\`\`json.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }, { text: `Contenu à analyser :\n${truncatedText}` }],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      throw new Error(`Erreur IA (${geminiResponse.status}): ${errorText}`);
    }

    const data = await geminiResponse.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Format de réponse inattendu de l'IA");
    }

    const contentText = data.candidates[0].content.parts[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : contentText;

    let recipe;
    try {
      recipe = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON parse error:", e, contentText);
      throw new Error("L'IA n'a pas pu structurer la recette correctement.");
    }

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
