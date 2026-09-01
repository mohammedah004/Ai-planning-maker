import { supabaseAdmin } from "./supabase-admin";

/**
 * In-memory cache for remote configuration
 * TTL: 60 seconds to avoid slamming Supabase on every request
 */
let cachedRemoteConfig = null;
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000;

/**
 * Deterministic string hash function (djb2)
 * Returns an integer between 0 and 99 for canary percentage bucketing.
 *
 * @param {string} str - Input identifier (e.g. userId or email)
 * @returns {number} Integer between 0 and 99
 */
function hashToBucket(str) {
  if (!str || typeof str !== "string") return 0;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash >>> 0) % 100;
}

/**
 * Parses comma-separated strings or JSON arrays into a clean array of strings
 *
 * @param {string|Array} input
 * @returns {Array<string>}
 */
function parseList(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
      }
    } catch {}
    return input.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

/**
 * Fetches remote configuration from Supabase `system_settings` with 60-second caching
 * Falls back gracefully to environment variables if the table is unavailable.
 *
 * @returns {Promise<Object>}
 */
export async function getExpressBackendConfigAsync() {
  const now = Date.now();
  if (cachedRemoteConfig && now - lastCacheFetchTime < CACHE_TTL_MS) {
    return cachedRemoteConfig;
  }

  // Base fallback config from process.env
  const fallbackConfig = {
    enabled: process.env.USE_EXPRESS_BACKEND === "true",
    force_n8n_fallback: process.env.FORCE_N8N_FALLBACK === "true",
    canary_percentage: parseInt(process.env.CANARY_PERCENTAGE || "0", 10),
    allowlist_emails: parseList(process.env.CANARY_ALLOWLIST_EMAILS),
    allowlist_user_ids: parseList(process.env.CANARY_USER_ALLOWLIST),
    source: "env",
  };

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      cachedRemoteConfig = fallbackConfig;
      lastCacheFetchTime = now;
      return cachedRemoteConfig;
    }

    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("key", "express_backend_config")
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      const val = data.value;
      cachedRemoteConfig = {
        enabled: Boolean(val.enabled ?? fallbackConfig.enabled),
        force_n8n_fallback: Boolean(val.force_n8n_fallback ?? fallbackConfig.force_n8n_fallback),
        canary_percentage: typeof val.canary_percentage === "number" ? val.canary_percentage : fallbackConfig.canary_percentage,
        allowlist_emails: Array.isArray(val.allowlist_emails) ? parseList(val.allowlist_emails) : fallbackConfig.allowlist_emails,
        allowlist_user_ids: Array.isArray(val.allowlist_user_ids) ? parseList(val.allowlist_user_ids) : fallbackConfig.allowlist_user_ids,
        source: "remote_supabase",
      };
      lastCacheFetchTime = now;
      return cachedRemoteConfig;
    }
  } catch (err) {
    console.warn("[backend-flag] Error fetching remote settings, using env fallback:", err.message);
  }

  cachedRemoteConfig = fallbackConfig;
  lastCacheFetchTime = now;
  return cachedRemoteConfig;
}

/**
 * Synchronous / Fast evaluation of whether Express Backend is enabled for a given request.
 * Evaluates:
 * 1. Emergency Hard Kill-Switch (`FORCE_N8N_FALLBACK=true` -> ALWAYS FALSE)
 * 2. Developer/Solo-Tester Allowlist (`CANARY_ALLOWLIST_EMAILS` or `CANARY_USER_ALLOWLIST` -> ALWAYS TRUE)
 * 3. Global Switch (`USE_EXPRESS_BACKEND=true` -> ALWAYS TRUE)
 * 4. Canary Sampling (`CANARY_PERCENTAGE` > 0 -> Hash bucket check)
 *
 * @param {Object|string|null} [authData=null] - User auth context: { userId, email } or userId
 * @returns {boolean}
 */
export function isExpressBackendEnabled(authData = null) {
  // 1. EMERGENCY KILL-SWITCH: Immediate hard fallback to n8n (zero-deploy bypass)
  if (process.env.FORCE_N8N_FALLBACK === "true") {
    return false;
  }
  if (cachedRemoteConfig?.force_n8n_fallback === true) {
    return false;
  }

  // 2. LOCAL DEV / EXPLICIT OVERRIDE:
  // In development mode (NODE_ENV === 'development') or when USE_EXPRESS_BACKEND=true,
  // enable Express backend directly without remote queries or canary bucketing.
  if (process.env.NODE_ENV === "development" || process.env.USE_EXPRESS_BACKEND === "true") {
    return true;
  }

  // Extract user identifiers
  let userId = null;
  let userEmail = null;

  if (authData) {
    if (typeof authData === "string") {
      userId = authData;
    } else if (typeof authData === "object") {
      userId = authData.userId || authData.id || null;
      userEmail = authData.email || authData.user?.email || null;
    }
  }

  // Normalize email for comparison
  const normalizedEmail = userEmail ? String(userEmail).trim().toLowerCase() : null;
  const normalizedUserId = userId ? String(userId).trim() : null;

  // 3. CANARY ALLOWLIST FOR SOLO DEV / TEST ACCOUNTS (Bypasses percentage sampling)
  const envAllowlistEmails = parseList(process.env.CANARY_ALLOWLIST_EMAILS);
  const envAllowlistUsers = parseList(process.env.CANARY_USER_ALLOWLIST);
  const remoteAllowlistEmails = cachedRemoteConfig?.allowlist_emails || [];
  const remoteAllowlistUsers = cachedRemoteConfig?.allowlist_user_ids || [];

  const allAllowlistEmails = [...new Set([...envAllowlistEmails, ...remoteAllowlistEmails])];
  const allAllowlistUsers = [...new Set([...envAllowlistUsers, ...remoteAllowlistUsers])];

  if (normalizedEmail && allAllowlistEmails.includes(normalizedEmail)) {
    return true;
  }
  if (normalizedUserId && allAllowlistUsers.includes(normalizedUserId.toLowerCase())) {
    return true;
  }

  // 4. REMOTE GLOBAL FEATURE FLAG
  if (cachedRemoteConfig?.enabled === true) {
    return true;
  }

  // 5. CANARY PERCENTAGE SAMPLING
  const canaryPercentage = typeof cachedRemoteConfig?.canary_percentage === "number" && cachedRemoteConfig.canary_percentage > 0
    ? cachedRemoteConfig.canary_percentage
    : parseInt(process.env.CANARY_PERCENTAGE || "0", 10);

  if (canaryPercentage > 0 && (normalizedUserId || normalizedEmail)) {
    const bucket = hashToBucket(normalizedUserId || normalizedEmail);
    return bucket < canaryPercentage;
  }

  return false;
}

/**
 * Asynchronous evaluation that refreshes remote config before checking
 *
 * @param {Object|string|null} [authData=null]
 * @returns {Promise<boolean>}
 */
export async function isExpressBackendEnabledAsync(authData = null) {
  await getExpressBackendConfigAsync();
  return isExpressBackendEnabled(authData);
}

/**
 * Clears the in-memory remote config cache (useful for testing)
 */
export function _resetBackendFlagCache() {
  cachedRemoteConfig = null;
  lastCacheFetchTime = 0;
}
