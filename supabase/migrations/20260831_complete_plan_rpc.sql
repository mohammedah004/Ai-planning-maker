-- ==============================================================================
-- AI Marketing Planner - Complete Marketing Plan Atomic RPC Migration
-- Date: 2026-08-31
-- Description:
--   1. Atomic function to complete a plan, replace content_items, and update generation_jobs.
--   2. Enforces explicit ownership guard before altering content_items.
--   3. Restricts execute permissions exclusively to service_role (bypassing anon/authenticated).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.complete_marketing_plan(
  p_plan_id uuid,
  p_user_id text,
  p_strategy jsonb,
  p_content_pillars jsonb,
  p_objective_distribution jsonb,
  p_content_items jsonb,
  p_job_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 1. Enforce ownership check and update plan details
  UPDATE public.marketing_plans
  SET
    strategy = p_strategy,
    content_pillars = p_content_pillars,
    objective_distribution = p_objective_distribution,
    status = 'completed',
    updated_at = now()
  WHERE id = p_plan_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan % not found for user %', p_plan_id, p_user_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 2. Only reached if caller owns the plan: Clear old items & batch insert 30 items
  DELETE FROM public.content_items WHERE marketing_plan_id = p_plan_id;

  INSERT INTO public.content_items (
    marketing_plan_id,
    user_id,
    day_number,
    caption,
    design_copy,
    post_type,
    content_objective,
    content_pillar,
    design_reference,
    cta,
    created_at,
    updated_at
  )
  SELECT
    p_plan_id,
    p_user_id,
    (item->>'day_number')::integer,
    item->>'caption',
    item->'design_copy',
    item->>'post_type',
    item->>'content_objective',
    item->>'content_pillar',
    item->>'design_reference',
    item->>'cta',
    now(),
    now()
  FROM jsonb_array_elements(p_content_items) AS item;

  -- 3. Mark generation job as completed
  UPDATE public.generation_jobs
  SET
    status = 'completed',
    current_step = 'Plan generated and exported successfully.',
    completed_at = now(),
    updated_at = now()
  WHERE id = p_job_id;
END;
$$;

-- 4. Lock down execution permissions
REVOKE EXECUTE ON FUNCTION public.complete_marketing_plan(
  uuid, text, jsonb, jsonb, jsonb, jsonb, uuid
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.complete_marketing_plan(
  uuid, text, jsonb, jsonb, jsonb, jsonb, uuid
) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.complete_marketing_plan(
  uuid, text, jsonb, jsonb, jsonb, jsonb, uuid
) TO service_role;
