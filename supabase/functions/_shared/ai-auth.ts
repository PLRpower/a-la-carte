import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const FREE_AI_WEEKLY_LIMIT = 5;

export interface AuthAndQuotaResult {
  authorized: boolean;
  errorResponse?: Response;
  userId?: string;
  isPremium?: boolean;
  remainingQuota?: number;
}

/**
 * Validates the caller JWT token and checks quota usage in the ai_usage table.
 * Premium users have unlimited access.
 * Free tier users are limited to FREE_AI_WEEKLY_LIMIT calls per rolling 7 days.
 */
export async function verifyAuthAndQuota(
  req: Request,
  _feature: string = "ai_feature"
): Promise<AuthAndQuotaResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          error: "Authentification requise pour utiliser cette fonctionnalité IA.",
          code: "AUTH_REQUIRED",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      ),
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          error: "Erreur de configuration du serveur (clés Supabase manquantes).",
          code: "CONFIG_ERROR",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      ),
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (!user || authError) {
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          error: "Session invalide ou expirée. Veuillez vous reconnecter.",
          code: "AUTH_EXPIRED",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      ),
    };
  }

  // Check profile subscription status
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const isPremium = profile?.subscription_status === "active";

  if (isPremium) {
    return {
      authorized: true,
      userId: user.id,
      isPremium: true,
      remainingQuota: Infinity,
    };
  }

  // Check rolling 7-day usage in ai_usage table
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", sevenDaysAgo);

  const usedCount = count ?? 0;

  if (usedCount >= FREE_AI_WEEKLY_LIMIT) {
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({
          error: `Vous avez atteint votre quota de ${FREE_AI_WEEKLY_LIMIT} requêtes IA gratuites cette semaine. Passez à l'offre Premium pour un accès illimité !`,
          code: "QUOTA_EXCEEDED",
          quota: {
            limit: FREE_AI_WEEKLY_LIMIT,
            used: usedCount,
            period: "7d",
          },
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      ),
    };
  }

  return {
    authorized: true,
    userId: user.id,
    isPremium: false,
    remainingQuota: FREE_AI_WEEKLY_LIMIT - usedCount - 1,
  };
}

/**
 * Logs an AI call to the ai_usage table after a successful generation.
 */
export async function recordAiUsage(userId: string, feature: string): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !supabaseServiceKey) return;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    await supabaseAdmin.from("ai_usage").insert({
      user_id: userId,
      feature: feature,
    });
  } catch (err) {
    console.error("Failed to record AI usage log:", err);
  }
}
