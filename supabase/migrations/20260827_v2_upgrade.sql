-- ==============================================================================
-- AI Marketing Planner - V2 Upgrade Database Migration
-- Date: 2026-08-27
-- Description:
--   1. Adds `brand_profile_id` and `share_token` to `marketing_plans`.
--   2. Creates `brand_profiles` table for reusable brand memory.
--   3. Adds performance indexes, updated_at triggers, and RLS policies.
-- ==============================================================================

-- 1. Upgrade marketing_plans table
ALTER TABLE IF EXISTS public.marketing_plans
  ADD COLUMN IF NOT EXISTS brand_profile_id uuid NULL,
  ADD COLUMN IF NOT EXISTS share_token text NULL;

-- Unique constraint / index for share_token (partial to allow multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketing_plans_share_token
  ON public.marketing_plans (share_token)
  WHERE share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketing_plans_brand_profile_id
  ON public.marketing_plans (brand_profile_id)
  WHERE brand_profile_id IS NOT NULL;

-- 2. Create brand_profiles table
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles (auth_user_id) ON DELETE CASCADE,
  name text NOT NULL,
  product_name text NOT NULL,
  product_description text NOT NULL,
  product_category text NOT NULL,
  target_audience text NOT NULL,
  problem_solved text NOT NULL,
  brand_tone text[] NOT NULL DEFAULT '{}',
  website_url text NULL,
  additional_context text NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index on brand_profiles user_id
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id
  ON public.brand_profiles (user_id);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_brand_profiles_updated_at ON public.brand_profiles;
CREATE TRIGGER trigger_brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS) as Defense-in-Depth
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS "Service role has full access to brand_profiles" ON public.brand_profiles;
CREATE POLICY "Service role has full access to brand_profiles"
  ON public.brand_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
