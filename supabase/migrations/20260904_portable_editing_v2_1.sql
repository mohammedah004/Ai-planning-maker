-- ==============================================================================
-- AI Marketing Planner - MADAR V2.1.5 Portable Plan Editing & Concurrency Migration
-- Date: 2026-09-04
-- Target Database: Supabase PostgreSQL (agfhwwuavhdpcwspjdyg)
-- Description:
--   1. Preflight safety checks (post_type, content_objective, tenant alignment).
--   2. Schema evolution:
--      - marketing_plans: ADD content_version INTEGER NOT NULL DEFAULT 1
--      - content_items: ADD revision INTEGER NOT NULL DEFAULT 1,
--                       ADD previous_state JSONB NULL,
--                       ADD edit_source TEXT NOT NULL DEFAULT 'ai_generated'
--      - google_sheet_exports: ADD target_version INTEGER NULL,
--                              ADD exported_version INTEGER NULL
--   3. CHECK constraints:
--      - post_type: IN ('reel', 'carousel', 'static_post', 'story')
--      - content_objective: IN ('awareness', 'education', 'engagement', 'trust', 'social_proof', 'objection_handling', 'conversion')
--      - edit_source: IN ('ai_generated', 'manual', 'ai_scoped', 'external_ai')
--   4. Indexes:
--      - idx_content_items_plan_day_rev ON content_items(marketing_plan_id, day_number, revision)
--   5. Hardened RPCs with Global Lock Ordering & Tenant Isolation (Blockers B01, B02, B07, B15, B16):
--      - apply_content_item_mutation
--      - apply_content_items_batch_mutation
--      - undo_content_item_mutation
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Deterministic Preflight Integrity Checks
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_invalid_post_types INTEGER;
  v_invalid_objectives INTEGER;
  v_tenant_mismatches INTEGER;
BEGIN
  -- 1. Assert post_type integrity
  SELECT COUNT(*) INTO v_invalid_post_types
  FROM public.content_items
  WHERE post_type NOT IN ('reel', 'carousel', 'static_post', 'story');

  IF v_invalid_post_types > 0 THEN
    RAISE EXCEPTION 'PREFLIGHT FAILED: Found % rows with invalid post_type', v_invalid_post_types;
  END IF;

  -- 2. Assert content_objective integrity
  SELECT COUNT(*) INTO v_invalid_objectives
  FROM public.content_items
  WHERE content_objective NOT IN (
    'awareness', 'education', 'engagement', 'trust', 
    'social_proof', 'objection_handling', 'conversion'
  );

  IF v_invalid_objectives > 0 THEN
    RAISE EXCEPTION 'PREFLIGHT FAILED: Found % rows with invalid content_objective', v_invalid_objectives;
  END IF;

  -- 3. Assert Tenant Foreign Key Alignment (Blocker B17)
  SELECT COUNT(*) INTO v_tenant_mismatches
  FROM public.content_items ci
  JOIN public.marketing_plans mp ON mp.id = ci.marketing_plan_id
  WHERE ci.user_id != mp.user_id;

  IF v_tenant_mismatches > 0 THEN
    RAISE EXCEPTION 'PREFLIGHT FAILED: Found % content_items with user_id mismatching parent marketing_plans', v_tenant_mismatches;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 2: Schema Evolution (Columns)
-- ------------------------------------------------------------------------------

-- marketing_plans: Content Versioning
ALTER TABLE public.marketing_plans
  ADD COLUMN IF NOT EXISTS content_version INTEGER NOT NULL DEFAULT 1;

-- content_items: Revision, History Snapshot, and Edit Source Tracking
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_state JSONB NULL,
  ADD COLUMN IF NOT EXISTS edit_source TEXT NOT NULL DEFAULT 'ai_generated';

-- google_sheet_exports: Version Tracking
ALTER TABLE public.google_sheet_exports
  ADD COLUMN IF NOT EXISTS target_version INTEGER NULL,
  ADD COLUMN IF NOT EXISTS exported_version INTEGER NULL;

-- ------------------------------------------------------------------------------
-- STEP 3: CHECK Constraints (Defense-in-Depth)
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_content_items_post_type'
  ) THEN
    ALTER TABLE public.content_items
      ADD CONSTRAINT chk_content_items_post_type
      CHECK (post_type IN ('reel', 'carousel', 'static_post', 'story'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_content_items_content_objective'
  ) THEN
    ALTER TABLE public.content_items
      ADD CONSTRAINT chk_content_items_content_objective
      CHECK (content_objective IN ('awareness', 'education', 'engagement', 'trust', 'social_proof', 'objection_handling', 'conversion'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_content_items_edit_source'
  ) THEN
    ALTER TABLE public.content_items
      ADD CONSTRAINT chk_content_items_edit_source
      CHECK (edit_source IN ('ai_generated', 'manual', 'ai_scoped', 'external_ai'));
  END IF;

  -- Allow 'stale' status in google_sheet_exports when plans are mutated
  ALTER TABLE public.google_sheet_exports
    DROP CONSTRAINT IF EXISTS chk_export_status;
  ALTER TABLE public.google_sheet_exports
    ADD CONSTRAINT chk_export_status
    CHECK (status IN ('pending', 'creating', 'completed', 'failed', 'stale'));
END $$;

-- ------------------------------------------------------------------------------
-- STEP 4: Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_content_items_plan_day_rev
  ON public.content_items (marketing_plan_id, day_number, revision);

-- ------------------------------------------------------------------------------
-- STEP 5: RPC - Single Item Mutation (apply_content_item_mutation)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_content_item_mutation(
  p_plan_id UUID,
  p_item_id UUID,
  p_user_id TEXT,
  p_expected_revision INTEGER,
  p_expected_plan_version INTEGER,
  p_edit_source TEXT,
  p_changes JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan RECORD;
  v_current RECORD;
  v_updated RECORD;
  v_merged_design_copy JSONB;
  v_snapshot JSONB;
BEGIN
  -- 1. Validate edit_source parameter
  IF p_edit_source NOT IN ('manual', 'ai_scoped', 'external_ai') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_EDIT_SOURCE');
  END IF;

  -- 2. GLOBAL LOCK ORDERING (Invariant Step 1): Lock parent plan first
  SELECT * INTO v_plan
  FROM public.marketing_plans
  WHERE id = p_plan_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND');
  END IF;

  IF v_plan.content_version != p_expected_plan_version THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PLAN_VERSION_CONFLICT',
      'current_plan_version', v_plan.content_version
    );
  END IF;

  -- 3. GLOBAL LOCK ORDERING (Invariant Step 2): Lock content item with direct user_id filter
  SELECT * INTO v_current
  FROM public.content_items
  WHERE id = p_item_id AND marketing_plan_id = p_plan_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ITEM_NOT_FOUND');
  END IF;

  IF v_current.revision != p_expected_revision THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'REVISION_CONFLICT',
      'current_revision', v_current.revision,
      'current_item', row_to_json(v_current)
    );
  END IF;

  -- 4. Field-level merge for design_copy (preserves structured slides/scenes/generation_source)
  IF p_changes ? 'design_copy' THEN
    v_merged_design_copy := COALESCE(v_current.design_copy, '{}'::jsonb) || COALESCE(p_changes->'design_copy', '{}'::jsonb);
  ELSE
    v_merged_design_copy := v_current.design_copy;
  END IF;

  -- 5. Build previous_state snapshot
  v_snapshot := jsonb_build_object(
    'snapshot_version', 1,
    'revision', v_current.revision,
    'saved_at', NOW(),
    'edit_source', v_current.edit_source,
    'fields', jsonb_build_object(
      'caption', v_current.caption,
      'design_copy', v_current.design_copy,
      'post_type', v_current.post_type,
      'content_objective', v_current.content_objective,
      'content_pillar', v_current.content_pillar,
      'design_reference', v_current.design_reference,
      'cta', v_current.cta
    )
  );

  -- 6. Apply mutation to content item
  UPDATE public.content_items
  SET
    caption = COALESCE((p_changes->>'caption')::TEXT, caption),
    design_copy = v_merged_design_copy,
    post_type = COALESCE((p_changes->>'post_type')::TEXT, post_type),
    content_objective = COALESCE((p_changes->>'content_objective')::TEXT, content_objective),
    content_pillar = COALESCE((p_changes->>'content_pillar')::TEXT, content_pillar),
    design_reference = COALESCE((p_changes->>'design_reference')::TEXT, design_reference),
    cta = COALESCE((p_changes->>'cta')::TEXT, cta),
    revision = v_current.revision + 1,
    previous_state = v_snapshot,
    edit_source = p_edit_source,
    updated_at = NOW()
  WHERE id = p_item_id AND user_id = p_user_id
  RETURNING * INTO v_updated;

  -- 7. Increment plan content_version
  UPDATE public.marketing_plans
  SET content_version = content_version + 1, updated_at = NOW()
  WHERE id = p_plan_id AND user_id = p_user_id;

  -- 8. Mark Google Sheets export as stale
  UPDATE public.google_sheet_exports
  SET status = 'stale', updated_at = NOW()
  WHERE marketing_plan_id = p_plan_id AND status = 'completed';

  RETURN jsonb_build_object(
    'success', true,
    'item', row_to_json(v_updated),
    'new_revision', v_updated.revision,
    'new_plan_version', v_plan.content_version + 1
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- STEP 6: RPC - Batch Mutation (apply_content_items_batch_mutation)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_content_items_batch_mutation(
  p_plan_id UUID,
  p_user_id TEXT,
  p_expected_plan_version INTEGER,
  p_edit_source TEXT,
  p_batch JSONB -- Array of { day_number, expected_revision, changes }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan RECORD;
  v_elem JSONB;
  v_day INTEGER;
  v_expected_rev INTEGER;
  v_changes JSONB;
  v_current RECORD;
  v_merged_design_copy JSONB;
  v_snapshot JSONB;
  v_updated_count INTEGER := 0;
  v_total_items INTEGER;
  v_distinct_days INTEGER;
BEGIN
  -- 1. Validate edit_source parameter (Blocker B01)
  IF p_edit_source NOT IN ('manual', 'ai_scoped', 'external_ai') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_EDIT_SOURCE');
  END IF;

  -- 2. Validate non-empty batch (Blocker B15)
  v_total_items := jsonb_array_length(p_batch);
  IF v_total_items = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'EMPTY_BATCH');
  END IF;

  -- 3. Defensive duplicate day check (Blocker B02)
  SELECT COUNT(DISTINCT (value->>'day_number')::INTEGER) INTO v_distinct_days
  FROM jsonb_array_elements(p_batch);

  IF v_total_items != v_distinct_days THEN
    RETURN jsonb_build_object('success', false, 'error', 'DUPLICATE_DAY_REJECTED');
  END IF;

  -- 4. GLOBAL LOCK ORDERING (Invariant Step 1): Lock parent plan first
  SELECT * INTO v_plan
  FROM public.marketing_plans
  WHERE id = p_plan_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND');
  END IF;

  IF v_plan.content_version != p_expected_plan_version THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'PLAN_VERSION_CONFLICT',
      'current_plan_version', v_plan.content_version
    );
  END IF;

  -- 5. GLOBAL LOCK ORDERING (Invariant Step 2 & 3): Lock rows sorted by day_number ASC
  FOR v_elem IN 
    SELECT value FROM jsonb_array_elements(p_batch) 
    ORDER BY (value->>'day_number')::INTEGER ASC
  LOOP
    v_day := (v_elem->>'day_number')::INTEGER;
    v_expected_rev := (v_elem->>'expected_revision')::INTEGER;

    SELECT * INTO v_current
    FROM public.content_items
    WHERE marketing_plan_id = p_plan_id AND day_number = v_day AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'ITEM_NOT_FOUND', 'day', v_day);
    END IF;

    IF v_current.revision != v_expected_rev THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'REVISION_CONFLICT',
        'conflict_day', v_day,
        'current_revision', v_current.revision
      );
    END IF;
  END LOOP;

  -- 6. Execution loop: All-or-Nothing atomic updates with strict user_id scoping (Blocker B16)
  FOR v_elem IN SELECT * FROM jsonb_array_elements(p_batch)
  LOOP
    v_day := (v_elem->>'day_number')::INTEGER;
    v_changes := v_elem->'changes';

    SELECT * INTO v_current
    FROM public.content_items
    WHERE marketing_plan_id = p_plan_id AND day_number = v_day AND user_id = p_user_id;

    -- Field-level merge for design_copy (preserves structured slides/scenes/generation_source)
    IF v_changes ? 'design_copy' THEN
      v_merged_design_copy := COALESCE(v_current.design_copy, '{}'::jsonb) || COALESCE(v_changes->'design_copy', '{}'::jsonb);
    ELSE
      v_merged_design_copy := v_current.design_copy;
    END IF;

    v_snapshot := jsonb_build_object(
      'snapshot_version', 1,
      'revision', v_current.revision,
      'saved_at', NOW(),
      'edit_source', v_current.edit_source,
      'fields', jsonb_build_object(
        'caption', v_current.caption,
        'design_copy', v_current.design_copy,
        'post_type', v_current.post_type,
        'content_objective', v_current.content_objective,
        'content_pillar', v_current.content_pillar,
        'design_reference', v_current.design_reference,
        'cta', v_current.cta
      )
    );

    -- Persist caller's requested p_edit_source (Blocker B01)
    UPDATE public.content_items
    SET
      caption = COALESCE((v_changes->>'caption')::TEXT, caption),
      design_copy = v_merged_design_copy,
      post_type = COALESCE((v_changes->>'post_type')::TEXT, post_type),
      content_objective = COALESCE((v_changes->>'content_objective')::TEXT, content_objective),
      content_pillar = COALESCE((v_changes->>'content_pillar')::TEXT, content_pillar),
      design_reference = COALESCE((v_changes->>'design_reference')::TEXT, design_reference),
      cta = COALESCE((v_changes->>'cta')::TEXT, cta),
      revision = v_current.revision + 1,
      previous_state = v_snapshot,
      edit_source = p_edit_source,
      updated_at = NOW()
    WHERE id = v_current.id AND user_id = p_user_id;

    v_updated_count := v_updated_count + 1;
  END LOOP;

  -- 7. Increment plan content version exactly ONCE
  UPDATE public.marketing_plans
  SET content_version = content_version + 1, updated_at = NOW()
  WHERE id = p_plan_id AND user_id = p_user_id;

  -- 8. Invalidate Google Sheets
  UPDATE public.google_sheet_exports
  SET status = 'stale', updated_at = NOW()
  WHERE marketing_plan_id = p_plan_id AND status = 'completed';

  RETURN jsonb_build_object(
    'success', true,
    'updated_count', v_updated_count,
    'new_plan_version', v_plan.content_version + 1
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- STEP 7: RPC - Undo Mutation (undo_content_item_mutation)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.undo_content_item_mutation(
  p_plan_id UUID,
  p_item_id UUID,
  p_user_id TEXT,
  p_expected_revision INTEGER,
  p_expected_plan_version INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan RECORD;
  v_current RECORD;
  v_restored RECORD;
  v_prev_fields JSONB;
BEGIN
  -- 1. GLOBAL LOCK ORDERING (Invariant Step 1): Lock parent plan first
  SELECT * INTO v_plan
  FROM public.marketing_plans
  WHERE id = p_plan_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND');
  END IF;

  IF v_plan.content_version != p_expected_plan_version THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PLAN_VERSION_CONFLICT',
      'current_plan_version', v_plan.content_version
    );
  END IF;

  -- 2. GLOBAL LOCK ORDERING (Invariant Step 2): Lock content item with direct user_id filter (Blocker B16)
  SELECT * INTO v_current
  FROM public.content_items
  WHERE id = p_item_id AND marketing_plan_id = p_plan_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ITEM_NOT_FOUND');
  END IF;

  IF v_current.revision != p_expected_revision THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'REVISION_CONFLICT',
      'current_revision', v_current.revision
    );
  END IF;

  IF v_current.previous_state IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NO_PREVIOUS_STATE');
  END IF;

  -- 3. Extract previous fields
  v_prev_fields := v_current.previous_state->'fields';

  -- 4. Restore content item, set edit_source to 'manual', clear previous_state
  UPDATE public.content_items
  SET
    caption = COALESCE((v_prev_fields->>'caption')::TEXT, caption),
    design_copy = COALESCE(v_prev_fields->'design_copy', design_copy),
    post_type = COALESCE((v_prev_fields->>'post_type')::TEXT, post_type),
    content_objective = COALESCE((v_prev_fields->>'content_objective')::TEXT, content_objective),
    content_pillar = COALESCE((v_prev_fields->>'content_pillar')::TEXT, content_pillar),
    design_reference = COALESCE((v_prev_fields->>'design_reference')::TEXT, design_reference),
    cta = COALESCE((v_prev_fields->>'cta')::TEXT, cta),
    revision = v_current.revision + 1,
    previous_state = NULL,
    edit_source = 'manual',
    updated_at = NOW()
  WHERE id = p_item_id AND user_id = p_user_id
  RETURNING * INTO v_restored;

  -- 5. Increment plan content_version
  UPDATE public.marketing_plans
  SET content_version = content_version + 1, updated_at = NOW()
  WHERE id = p_plan_id AND user_id = p_user_id;

  -- 6. Invalidate Google Sheets
  UPDATE public.google_sheet_exports
  SET status = 'stale', updated_at = NOW()
  WHERE marketing_plan_id = p_plan_id AND status = 'completed';

  RETURN jsonb_build_object(
    'success', true,
    'item', row_to_json(v_restored),
    'new_revision', v_restored.revision,
    'new_plan_version', v_plan.content_version + 1
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- STEP 8: Lock down RPC Permissions
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.apply_content_item_mutation(
  UUID, UUID, TEXT, INTEGER, INTEGER, TEXT, JSONB
) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_content_item_mutation(
  UUID, UUID, TEXT, INTEGER, INTEGER, TEXT, JSONB
) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_content_item_mutation(
  UUID, UUID, TEXT, INTEGER, INTEGER, TEXT, JSONB
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.apply_content_items_batch_mutation(
  UUID, TEXT, INTEGER, TEXT, JSONB
) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_content_items_batch_mutation(
  UUID, TEXT, INTEGER, TEXT, JSONB
) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_content_items_batch_mutation(
  UUID, TEXT, INTEGER, TEXT, JSONB
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.undo_content_item_mutation(
  UUID, UUID, TEXT, INTEGER, INTEGER
) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.undo_content_item_mutation(
  UUID, UUID, TEXT, INTEGER, INTEGER
) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.undo_content_item_mutation(
  UUID, UUID, TEXT, INTEGER, INTEGER
) TO service_role;
