import { createClient } from "@supabase/supabase-js";

// Ensure createClient does not crash at module evaluation time if env vars are being loaded or missing
const supabaseUrl =
  process.env.SUPABASE_URL && process.env.SUPABASE_URL.startsWith("http")
    ? process.env.SUPABASE_URL
    : "https://placeholder-project.supabase.co";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

/**
 * Supabase admin client with Service Role privileges.
 * Bypasses RLS to allow server-side operations and administrative queries.
 * NEVER expose this client or the service role key to the browser.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Ensures the authenticated user exists in `profiles` and returns the canonical `auth_user_id`.
 * This prevents Foreign Key violation errors when creating or querying records.
 */
export async function getCanonicalUserId(sessionUser) {
  if (!sessionUser) return null;
  const email = sessionUser.email;
  const fallbackId = String(sessionUser.id || email);

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallbackId;
  }

  try {
    if (email) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("auth_user_id")
        .eq("email", email)
        .maybeSingle();

      if (profile?.auth_user_id) {
        return profile.auth_user_id;
      }

      // If no profile exists for this email, create one
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("profiles")
        .insert({
          auth_user_id: fallbackId,
          email: email,
          name: sessionUser.name || null,
          avatar_url: sessionUser.image || null,
          updated_at: new Date().toISOString(),
        })
        .select("auth_user_id")
        .maybeSingle();

      if (!insertErr && inserted?.auth_user_id) {
        return inserted.auth_user_id;
      }
    }
  } catch (err) {
    console.error("[supabase-admin] Error resolving canonical user ID:", err);
  }

  return fallbackId;
}


