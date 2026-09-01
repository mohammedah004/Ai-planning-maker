/**
 * Client-side health warm-up ping for the Express backend.
 *
 * Runs fire-and-forget on key pages (/dashboard, /plans/new, /plans/[id]) to wake up
 * free-tier Render instances from cold-sleep before the user clicks "Generate".
 *
 * Uses keepalive: true and silently ignores errors.
 * ONLY executes if NEXT_PUBLIC_USE_EXPRESS_BACKEND is set to "true".
 */
export function pingBackendHealth() {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_USE_EXPRESS_BACKEND !== "true") return;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return;

  try {
    const cleanUrl = `${backendUrl.replace(/\/+$/, "")}/health`;
    fetch(cleanUrl, {
      method: "GET",
      keepalive: true,
    }).catch(() => {
      // Fire-and-forget, suppress errors
    });
  } catch {
    // Ignore
  }
}
