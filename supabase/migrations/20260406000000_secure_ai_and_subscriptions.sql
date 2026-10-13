-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile
-- Migration: 20260406000000_secure_ai_and_subscriptions.sql
-- 1. Protect profiles Stripe & subscription columns from client-side tampering (RLS bypass)
-- 2. Create ai_usage tracking table for weekly quota enforcement on free tier

-- ==============================================================================
-- 1. PROTECT PROFILES SUBSCRIPTION FIELDS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_subscription_fields()
RETURNS trigger AS $$
BEGIN
  -- If executed in an authenticated user context (not service_role backend)
  IF auth.role() = 'authenticated' THEN
    IF TG_OP = 'INSERT' THEN
      -- Silently nullify any client-injected subscription/stripe values upon registration
      NEW.subscription_status := NULL;
      NEW.stripe_customer_id := NULL;
      NEW.stripe_subscription_id := NULL;
      NEW.plan_id := NULL;
      NEW.current_period_end := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
      -- Raise error if client attempts to alter subscription or stripe columns directly
      IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
         NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id OR
         NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id OR
         NEW.plan_id IS DISTINCT FROM OLD.plan_id OR
         NEW.current_period_end IS DISTINCT FROM OLD.current_period_end THEN
        RAISE EXCEPTION 'Accès refusé : les champs d abonnement Stripe ne peuvent pas être modifiés par le client.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS tr_protect_profile_subscription_fields ON public.profiles;
CREATE TRIGGER tr_protect_profile_subscription_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_subscription_fields();

-- ==============================================================================
-- 2. AI USAGE TABLE FOR QUOTA ENFORCEMENT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimize queries counting user usage in rolling time windows
CREATE INDEX IF NOT EXISTS ai_usage_user_id_created_at_idx 
  ON public.ai_usage (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own usage history (for client-side counters)
CREATE POLICY "Users can view own ai usage" 
  ON public.ai_usage
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Only service_role (Edge Functions) can insert usage records
CREATE POLICY "Service role can insert ai usage" 
  ON public.ai_usage
  FOR INSERT 
  TO service_role 
  WITH CHECK (true);
