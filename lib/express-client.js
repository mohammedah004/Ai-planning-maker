import * as jose from "jose";

/**
 * SECURITY REQUIREMENT: authData MUST come from a server-verified session (via requireAuth() / auth()), never from client input.
 *
 * Generates a short-lived signed JWS token for authenticating server-to-server calls
 * between Next.js API routes and the Express backend.
 *
 * Uses the dedicated symmetric INTERNAL_API_SECRET (decoupled from end-user AUTH_SECRET)
 * matching backend/src/middleware/auth.js and backend/src/utils/jwt.js.
 *
 * @param {Object} authData - Authenticated user data strictly from requireAuth() / getAuthenticatedUser()
 * @param {string} authData.userId - Canonical user ID from verified database profile
 * @param {string} [authData.email] - User email address
 * @param {Object} [authData.user] - Optional user profile object
 * @returns {Promise<string>} Signed JWS token
 */
export async function generateExpressAuthToken(authData) {
  if (!authData || typeof authData !== "object" || !authData.userId || typeof authData.userId !== "string") {
    throw new Error("[express-client] Invalid authData: authData MUST be a server-verified session object containing a valid userId string.");
  }

  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    throw new Error("[express-client] INTERNAL_API_SECRET is not configured in environment.");
  }

  const enc = new TextEncoder();
  return await new jose.SignJWT({
    id: authData.userId,
    email: authData.email || authData.user?.email || null,
    name: authData.user?.name || authData.name || null,
    iss: "ai-marketing-planner-frontend",
    aud: "ai-marketing-planner-backend",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(enc.encode(secret));
}

/**
 * Server-side HTTP client to communicate with the Express backend.
 *
 * Used exclusively inside Next.js Route Handlers and Server Actions (never exposed to browser).
 *
 * @param {string} endpoint - Path relative to Express backend (e.g. "/api/v1/plans")
 * @param {Object} options
 * @param {string} [options.method="GET"]
 * @param {any} [options.body=null]
 * @param {Object|null} [options.authData=null] - If provided, attaches signed Bearer token (MUST come from requireAuth())
 * @param {Object} [options.headers={}]
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function expressFetch(endpoint, { method = "GET", body = null, authData = null, headers = {} } = {}) {
  const baseUrl = process.env.EXPRESS_BACKEND_URL || "http://localhost:5000";
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${cleanBase}/${cleanEndpoint}`;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (authData) {
    try {
      // SECURITY: Generate token from server-verified authData using INTERNAL_API_SECRET
      const token = await generateExpressAuthToken(authData);
      requestHeaders["Authorization"] = `Bearer ${token}`;
    } catch (authErr) {
      console.error("[express-client] Failed to generate auth token:", authErr.message);
      return {
        ok: false,
        status: 401,
        data: {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "فشل إنشاء رمز المصادقة الداخلي للخدمة الخلفية.",
          },
        },
      };
    }
  }

  const fetchOptions = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== "GET" && method !== "HEAD") {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    let data = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      const text = await res.text().catch(() => null);
      data = text ? { message: text } : null;
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (err) {
    console.error(`[express-client] Network error calling ${method} ${url}:`, err.message);
    return {
      ok: false,
      status: 502,
      data: {
        success: false,
        error: {
          code: "BACKEND_UNAVAILABLE",
          message: "تعذر الاتصال بالخدمة الخلفية الجديدة (Express Backend).",
        },
      },
    };
  }
}
