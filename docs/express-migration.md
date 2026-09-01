# Express Backend Migration Guide (Phase 5)

## 1. Overview & Architecture

The **AI Marketing Planner** has transitioned from a legacy n8n webhook workflow to a robust, self-hosted **Node.js / Express modular monolith** backend.

To ensure zero downtime and safe incremental rollout, the Next.js frontend is connected to the Express backend via a server-side **Feature Flag (`USE_EXPRESS_BACKEND`)**.

```
                           ┌────────────────────────────────────────┐
                           │            Next.js Frontend            │
                           │  (Dashboard, Forms, Polling UI, etc.)  │
                           └───────────────────┬────────────────────┘
                                               │
                                               ▼
                                 ┌───────────────────────────┐
                                 │   Next.js Route Handlers  │
                                 │     (app/api/* routes)    │
                                 └─────────────┬─────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       │  USE_EXPRESS_BACKEND === "true"?             │
                      YES                                             NO
                       │                                               │
                       ▼                                               ▼
        ┌─────────────────────────────┐                 ┌─────────────────────────────┐
        │   Express Modular Backend   │                 │       Legacy Pipeline       │
        │    (backend/src/app.js)     │                 │   - Direct n8n Webhook      │
        │  - JWT Bearer Auth          │                 │   - Direct Supabase Queries │
        │  - Gemini AI 3-Stage Engine │                 │   - OpenAI Single Regen     │
        │  - Sheets/Drive Export      │                 └─────────────────────────────┘
        │  - complete_marketing_plan  │
        └─────────────────────────────┘
```

---

## 2. Environment Variables & Feature Flag

Configure these variables in `.env` (local) and in Render / hosting provider (production):

| Variable | Type | Default | Description |
|---|---|---|---|
| `USE_EXPRESS_BACKEND` | Server string | `"false"` | Primary switch: `"true"` routes API calls to Express; `"false"` runs legacy path. |
| `EXPRESS_BACKEND_URL` | Server string | `http://localhost:5000` | Base URL of the Express backend service. |
| `INTERNAL_API_SECRET` | Server string | *(Required)* | Dedicated symmetric secret used exclusively to sign & verify internal service-to-service JWS tokens. Decoupled from `AUTH_SECRET`. |
| `AUTH_SECRET` | Server string | *(Required)* | NextAuth session encryption/signing secret for end-user cookie tokens. |
| `NEXT_PUBLIC_USE_EXPRESS_BACKEND` | Client string | `"false"` | Enables client-side background warm-up ping when `"true"`. |
| `NEXT_PUBLIC_BACKEND_URL` | Client string | `http://localhost:5000` | Public Express backend URL for health warm-up pings. |

---

## 3. Server-to-Server Authentication & Trust Boundaries

1. **NextAuth Verification:** Next.js Route Handlers authenticate incoming requests using `requireAuth()` (`lib/auth-guard.js`). This verifies the end-user's session cryptographically using NextAuth's `auth()` function (against `AUTH_SECRET`) and retrieves the verified canonical `userId` from Supabase.
2. **Internal JWS Token Generation:** When delegating to Express, `lib/express-client.js` uses `generateExpressAuthToken(authData)` to sign a short-lived JWS token (5-minute TTL) containing `{ id: userId, email, name, iss, aud }` using the separate **`INTERNAL_API_SECRET`**.
3. **Decoupled Trust Boundary:** Decoupling `INTERNAL_API_SECRET` from `AUTH_SECRET` prevents end-user session compromises or token forgery across the service boundary and adheres to Section 8.3 of the Architecture Specification.
4. **Express Middleware Verification:** Express's `src/middleware/auth.js` verifies the token against `INTERNAL_API_SECRET`, identifies the `tokenType: "internal"`, attaches `req.user`, and scopes all database operations to `req.user.userId`.

---

## 4. API Route Mapping & Response Shaping

| Next.js Route | HTTP | Feature Flag ON (Express Backend) | Feature Flag OFF (Legacy) |
|---|---|---|---|
| `/api/plans` | `POST` | `POST /api/v1/plans` (Async 3-Stage generation) | Creates DB row & fires n8n webhook |
| `/api/plans` | `GET` | `GET /api/v1/plans` | Direct Supabase query |
| `/api/plans/[id]` | `DELETE` | `DELETE /api/v1/plans/:id` (Cascading delete) | Manual sequential Supabase deletes |
| `/api/plans/[id]/status` | `GET` | `GET /api/v1/plans/:id/status` (Normalized shape) | Direct Supabase relation join |
| `/api/plans/[id]/retry` | `POST` | `POST /api/v1/plans/:id/retry` | Re-fires n8n webhook |
| `/api/plans/[id]/content/[day]/regenerate` | `POST` | `POST /api/v1/plans/:id/content/:day/regenerate` | Direct OpenAI API call |
| `/api/plans/[id]/retry-export` | `POST` | `POST /api/v1/plans/:id/retry-export` | Returns 501 `FEATURE_DISABLED` |
| `/api/brands` | `GET` | `GET /api/v1/brands` | Direct Supabase query |
| `/api/brands` | `POST` | `POST /api/v1/brands` (Zod validated) | Direct Supabase insert |
| `/api/brands/[id]` | `GET` | `GET /api/v1/brands/:id` | Direct Supabase query |
| `/api/brands/[id]` | `PUT` | `PUT /api/v1/brands/:id` (Zod validated) | Direct Supabase update |
| `/api/brands/[id]` | `DELETE` | `DELETE /api/v1/brands/:id` | Direct Supabase delete |

### Response Shape Normalization
The Next.js status polling handler adapts the Express status response to match the legacy nested structure expected by the frontend React components:
```json
{
  "success": true,
  "data": {
    "plan": { "id": "...", "status": "completed" },
    "job": { "id": "...", "status": "completed", "current_step": "...", "error_message": null },
    "export": { "spreadsheet_url": "https://docs.google.com/...", "status": "completed", "error_message": null }
  }
}
```

---

## 5. Cold-Start Warm-Up Ping

To eliminate delay caused by Render's free-tier instance spindown (cold start), `lib/backend-health.js` provides `pingBackendHealth()`:
- Automatically fired in `useEffect` on `/dashboard`, `/plans/new`, and `/plans/[id]`.
- Uses `keepalive: true` and non-blocking fire-and-forget.
- Only executes when `NEXT_PUBLIC_USE_EXPRESS_BACKEND="true"`.

---

## 6. Zero-Downtime Cutover & Rollback

### Switching to Express Backend
Set the following in `.env` (or Render environment settings):
```bash
USE_EXPRESS_BACKEND=true
NEXT_PUBLIC_USE_EXPRESS_BACKEND=true
```

### Instant Emergency Rollback
If any unexpected issue occurs in production, simply flip the flag:
```bash
USE_EXPRESS_BACKEND=false
NEXT_PUBLIC_USE_EXPRESS_BACKEND=false
```
No code deployment or Git revert is required. All API routes immediately fall back to the legacy n8n webhook and direct Supabase logic.

---

## 7. Test Verification

All integration paths and feature flag branches are covered by the automated test suite:
```bash
cd backend
npm test
```
**Test Matrix: 7 suites, 54 tests passing.**
