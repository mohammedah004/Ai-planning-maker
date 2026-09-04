-- ==============================================================================
-- MADAR - Roles & Daily Generation Usage Control Migration
-- Date: 2026-09-04
-- Description:
--   1. Adds `role` column to `profiles` with CHECK constraint ('admin', 'user').
--   2. Adds performance index on `profiles(role)`.
--   3. Adds composite index on `marketing_plans(user_id, status, created_at DESC)`.
--   4. Creates atomic RPC `create_plan_with_quota_check` with FOR UPDATE row locking.
--   5. Restricts RPC execution strictly to service_role.
--   Note: RLS policies on profiles remain untouched (RLS enabled + zero policies = deny-all for clients).
-- ==============================================================================

-- 1. Add role column to profiles with default 'user'
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Add check constraint safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_role'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT chk_profiles_role CHECK (role IN ('admin', 'user'));
  END IF;
END $$;

-- Index on profiles.role
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

-- 2. Composite performance index on marketing_plans for daily quota queries
CREATE INDEX IF NOT EXISTS idx_marketing_plans_quota_lookup
  ON public.marketing_plans (user_id, status, created_at DESC);

-- 3. Atomic plan creation with quota & concurrency check RPC
CREATE OR REPLACE FUNCTION public.create_plan_with_quota_check(
  p_user_id text,
  p_daily_limit integer,          -- NULL = unlimited (admin)
  p_product_name text,
  p_product_description text,
  p_product_category text,
  p_target_audience text,
  p_problem_solved text,
  p_marketing_objective text,
  p_brand_tone text[],
  p_website_url text DEFAULT NULL,
  p_additional_context text DEFAULT NULL,
  p_brand_profile_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_today_count integer;
  v_active_count integer;
  v_plan_id uuid;
  v_job_id uuid;
  v_stale_cutoff timestamptz := now() - interval '5 minutes';
BEGIN
  -- 1. Lock the user row in profiles to serialize concurrent creation requests
  PERFORM 1 FROM public.profiles WHERE auth_user_id = p_user_id FOR UPDATE;

  -- 2. Auto-recover stale jobs older than 5 minutes
  UPDATE public.generation_jobs
  SET
    status = 'failed',
    error_message = 'Generation timed out due to workflow inactivity (stale job auto-recovered)',
    completed_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id
    AND status IN ('queued', 'generating_strategy', 'generating_pillars', 'generating_content')
    AND created_at <= v_stale_cutoff;

  -- 3. Check for active (fresh) generation jobs
  SELECT COUNT(*) INTO v_active_count
  FROM public.generation_jobs
  WHERE user_id = p_user_id
    AND status IN ('queued', 'generating_strategy', 'generating_pillars', 'generating_content')
    AND created_at > v_stale_cutoff;

  IF v_active_count > 0 THEN
    RETURN jsonb_build_object('error', 'JOB_IN_PROGRESS');
  END IF;

  -- 4. Check daily quota (NULL means unlimited, e.g. admin)
  -- Note: Quota counts successful plans (status = 'completed') created in current UTC day.
  -- Edge case: A failed plan retried the next day retains its original created_at and does not consume today's quota.
  IF p_daily_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_today_count
    FROM public.marketing_plans
    WHERE user_id = p_user_id
      AND status = 'completed'
      AND created_at >= (date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC');

    IF v_today_count >= p_daily_limit THEN
      RETURN jsonb_build_object(
        'error', 'QUOTA_EXCEEDED',
        'used', v_today_count,
        'limit', p_daily_limit
      );
    END IF;
  END IF;

  -- 5. Insert new marketing_plan record in 'generating' status
  INSERT INTO public.marketing_plans (
    user_id,
    product_name,
    product_description,
    product_category,
    target_audience,
    problem_solved,
    marketing_objective,
    brand_tone,
    website_url,
    additional_context,
    brand_profile_id,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_product_name,
    p_product_description,
    p_product_category,
    p_target_audience,
    p_problem_solved,
    p_marketing_objective,
    p_brand_tone,
    p_website_url,
    p_additional_context,
    p_brand_profile_id,
    'generating',
    now(),
    now()
  )
  RETURNING id INTO v_plan_id;

  -- 6. Insert/Upsert generation_jobs record (unique constraint on marketing_plan_id verified)
  INSERT INTO public.generation_jobs (
    marketing_plan_id,
    user_id,
    status,
    current_step,
    error_message,
    started_at,
    updated_at,
    completed_at
  ) VALUES (
    v_plan_id,
    p_user_id,
    'queued',
    'Queued for generation',
    NULL,
    now(),
    now(),
    NULL
  )
  ON CONFLICT (marketing_plan_id) DO UPDATE SET
    status = 'queued',
    current_step = 'Queued for generation',
    error_message = NULL,
    started_at = now(),
    updated_at = now(),
    completed_at = NULL
  RETURNING id INTO v_job_id;

  -- Return successfully created plan and job IDs
  RETURN jsonb_build_object(
    'planId', v_plan_id,
    'jobId', v_job_id
  );
END;
$$;

-- 4. Lock down execution permissions
REVOKE EXECUTE ON FUNCTION public.create_plan_with_quota_check FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_plan_with_quota_check FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_plan_with_quota_check TO service_role;
