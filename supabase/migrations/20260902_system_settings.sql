-- ==============================================================================
-- AI Marketing Planner - System Settings & Remote Feature Flag Migration
-- Date: 2026-09-02
-- Description:
--   1. Creates `system_settings` table for zero-downtime remote feature flags & kill-switch.
--   2. Enforces service_role exclusivity for security.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Secure system_settings table with RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from anon and authenticated users
REVOKE ALL ON public.system_settings FROM anon, authenticated;
GRANT ALL ON public.system_settings TO service_role;

-- Seed default Express backend canary & kill-switch configuration
INSERT INTO public.system_settings (key, value, description)
VALUES (
  'express_backend_config',
  jsonb_build_object(
    'enabled', false,
    'force_n8n_fallback', false,
    'canary_percentage', 0,
    'allowlist_emails', '[]'::jsonb,
    'allowlist_user_ids', '[]'::jsonb
  ),
  'Remote feature flag, canary percentage, and emergency kill-switch for Express backend migration'
)
ON CONFLICT (key) DO NOTHING;
