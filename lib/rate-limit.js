/**
 * In-Memory Sliding Window Rate Limiter
 * Tracks API requests per user ID across time windows.
 */

const tracker = new Map();

/**
 * Checks if a user has exceeded their request limit.
 *
 * @param {string} userId
 * @param {number} maxRequests - Max allowed requests in the time window (default 10)
 * @param {number} windowMs - Time window in milliseconds (default 1 hour = 3600000ms)
 * @returns {{ allowed: boolean, remaining: number, resetMinutes: number }}
 */
export function checkRateLimit(userId, maxRequests = 10, windowMs = 60 * 60 * 1000) {
  if (!userId) {
    return { allowed: false, remaining: 0, resetMinutes: 60 };
  }

  const now = Date.now();
  const windowStart = now - windowMs;

  // Get user's request history
  const timestamps = tracker.get(userId) || [];

  // Filter out timestamps older than the window
  const recentTimestamps = timestamps.filter((t) => t > windowStart);

  if (recentTimestamps.length >= maxRequests) {
    const oldest = recentTimestamps[0];
    const resetTime = oldest + windowMs;
    const resetMinutes = Math.max(1, Math.ceil((resetTime - now) / (60 * 1000)));

    return {
      allowed: false,
      remaining: 0,
      resetMinutes,
    };
  }

  // Record this request
  recentTimestamps.push(now);
  tracker.set(userId, recentTimestamps);

  // Periodic cleanup of stale users (keep tracker size bounded)
  if (tracker.size > 5000) {
    for (const [uid, list] of tracker.entries()) {
      const active = list.filter((t) => t > windowStart);
      if (active.length === 0) {
        tracker.delete(uid);
      } else {
        tracker.set(uid, active);
      }
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - recentTimestamps.length,
    resetMinutes: 60,
  };
}
