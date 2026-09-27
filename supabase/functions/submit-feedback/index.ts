import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const categoryLabels: Record<string, string> = {
  suggestion: "💡 Suggestion",
  bug: "🐛 Problème / Bug",
  general: "💬 Avis général",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const {
      feedbackId: incomingId,
      category,
      message,
      rating,
      userEmail,
      userName,
      pageUrl,
      metadata,
    } = payload;

    if (!category || !message) {
      return new Response(
        JSON.stringify({ error: "Les champs 'category' et 'message' sont obligatoires." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let feedbackId = incomingId;

    // If feedback wasn't already inserted by the client, insert it now
    if (!feedbackId) {
      const { data, error } = await supabaseAdmin
        .from("feedbacks")
        .insert({
          category,
          message,
          rating: rating || null,
          user_email: userEmail || null,
          user_name: userName || null,
          page_url: pageUrl || null,
          metadata: metadata || {},
        })
        .select("id")
        .single();

      if (error) {
        console.error("Database insert error:", error);
      } else {
        feedbackId = data?.id;
      }
    }

    const catLabel = categoryLabels[category] || category;
    const starText = rating ? `${"⭐".repeat(rating)} (${rating}/5)` : "Non noté";

    // 1. Dispatch Webhook (Discord / Slack / Generic) if configured
    const webhookUrl = Deno.env.get("FEEDBACK_WEBHOOK_URL");
    if (webhookUrl) {
      try {
        const isDiscord = webhookUrl.includes("discord.com");
        const isSlack = webhookUrl.includes("slack.com");

        if (isDiscord) {
          const colorMap: Record<string, number> = {
            bug: 0xef4444, // Red
            suggestion: 0xf59e0b, // Amber
            general: 0x3b82f6, // Blue
          };

          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `📢 **Nouveau retour utilisateur sur À la carte !**`,
              embeds: [
                {
                  title: `${catLabel}`,
                  description: message,
                  color: colorMap[category] || 0x10b981,
                  fields: [
                    {
                      name: "Utilisateur",
                      value: `${userName || "Anonyme"} (${userEmail || "Sans email"})`,
                      inline: true,
                    },
                    {
                      name: "Note",
                      value: starText,
                      inline: true,
                    },
                    {
                      name: "Page",
                      value: pageUrl || "Non spécifiée",
                      inline: false,
                    },
                    {
                      name: "Contexte technique",
                      value: `Version: ${metadata?.appVersion || "v1.2.0"} | Appareil: ${metadata?.device || "Inconnu"} | OS: ${metadata?.os || "N/A"}`,
                      inline: false,
                    },
                  ],
                  footer: { text: `ID: ${feedbackId || "N/A"}` },
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          });
        } else if (isSlack) {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `*Nouveau retour (${catLabel})* de ${userName || userEmail || "Anonyme"}:\n>${message}\nNote: ${starText} | Page: ${pageUrl || "N/A"}`,
            }),
          });
        } else {
          // Generic webhook POST
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "user_feedback",
              feedbackId,
              category,
              message,
              rating,
              userEmail,
              userName,
              pageUrl,
              metadata,
              createdAt: new Date().toISOString(),
            }),
          });
        }
      } catch (webhookErr) {
        console.error("Webhook notification error:", webhookErr);
      }
    }

    // 2. Dispatch Email via Resend if configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || Deno.env.get("FEEDBACK_NOTIFICATION_EMAIL");
    if (resendApiKey && adminEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "À la carte <onboarding@resend.dev>",
            to: adminEmail,
            subject: `[À la carte] ${catLabel} de ${userName || userEmail || "un utilisateur"}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #ea580c; margin-top: 0;">Nouveau retour sur À la carte</h2>
                <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
                  <p style="margin: 0 0 8px 0;"><strong>Catégorie :</strong> ${catLabel}</p>
                  <p style="margin: 0 0 8px 0;"><strong>Note :</strong> ${starText}</p>
                  <p style="margin: 0 0 8px 0;"><strong>Utilisateur :</strong> ${userName || "Non renseigné"} (${userEmail || "Pas d'email"})</p>
                  <p style="margin: 0;"><strong>Page :</strong> ${pageUrl || "Non spécifiée"}</p>
                </div>
                <div style="margin: 20px 0;">
                  <strong>Message :</strong>
                  <p style="white-space: pre-wrap; background-color: #fff; padding: 12px; border-left: 4px solid #ea580c; margin-top: 8px;">${message}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280; margin: 0;">
                  App Version: ${metadata?.appVersion || "v1.2.0"} | OS: ${metadata?.os || "N/A"} | Navigateur: ${metadata?.browser || "N/A"}<br/>
                  Feedback ID: ${feedbackId || "N/A"}
                </p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Resend email notification error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, id: feedbackId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error("Unexpected error handling feedback:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
