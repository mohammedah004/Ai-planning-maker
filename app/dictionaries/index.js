import clearCommon from "./clear/common.js";
import clearDashboard from "./clear/dashboard.js";
import clearPlans from "./clear/plans.js";
import clearBrands from "./clear/brands.js";
import clearSettings from "./clear/settings.js";

import friendlyCommon from "./friendly/common.js";
import friendlyDashboard from "./friendly/dashboard.js";
import friendlyPlans from "./friendly/plans.js";
import friendlyBrands from "./friendly/brands.js";
import friendlySettings from "./friendly/settings.js";

const dictionaries = {
  clear: {
    common: clearCommon,
    dashboard: clearDashboard,
    plans: clearPlans,
    brands: clearBrands,
    settings: clearSettings,
  },
  friendly: {
    common: friendlyCommon,
    dashboard: friendlyDashboard,
    plans: friendlyPlans,
    brands: friendlyBrands,
    settings: friendlySettings,
  },
};

/**
 * Safely traverses a nested dictionary object by dot-delimited path.
 * e.g. "dashboard.empty.title" -> dict.dashboard?.empty?.title
 */
function getValueByPath(obj, path) {
  if (!obj || !path) return undefined;
  const segments = path.split(".");
  let current = obj;
  for (const segment of segments) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[segment];
  }
  return current;
}

/**
 * Centralized translation resolver.
 * @param {string} mode - "clear" | "friendly"
 * @param {string} key - dot-separated key (e.g., "dashboard.empty.title")
 * @param {string} [fallback] - optional default fallback string
 * @returns {string}
 */
export function getTranslation(mode, key, fallback) {
  const activeMode = mode === "friendly" ? "friendly" : "clear";
  const activeDict = dictionaries[activeMode];

  const value = getValueByPath(activeDict, key);

  if (value !== undefined && typeof value === "string") {
    return value;
  }

  // If in friendly mode and key is missing, fallback to clear
  if (activeMode === "friendly") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[MADAR Voice Warning] Missing friendly copy for key: "${key}" - Falling back to clear.`
      );
    }
    const clearValue = getValueByPath(dictionaries.clear, key);
    if (clearValue !== undefined && typeof clearValue === "string") {
      return clearValue;
    }
  }

  return fallback !== undefined ? fallback : key;
}

export default dictionaries;
