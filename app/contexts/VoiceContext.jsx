"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getTranslation } from "@/app/dictionaries";

const STORAGE_KEY = "madar_ui_voice";
const VALID_MODES = ["clear", "friendly"];
const DEFAULT_VOICE_STATE = { mode: "clear", dialect: null };

/**
 * Strict validator and parser for persisted voice state.
 * Guarantees that only valid modes reach the UI, dialect is strictly null in Phase 1,
 * and any malformed JSON or corrupted values safely fallback to Clear.
 */
function validateAndParseStoredVoice(rawValue) {
  if (!rawValue || typeof rawValue !== "string") {
    return DEFAULT_VOICE_STATE;
  }
  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_VOICE_STATE;
    }
    const mode = VALID_MODES.includes(parsed.mode) ? parsed.mode : "clear";
    // Dialect is strictly constrained to null in Phase 1
    return { mode, dialect: null };
  } catch {
    return DEFAULT_VOICE_STATE;
  }
}

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
  // Lazy initializer: SSR defaults safely to "clear".
  // On client, reads and validates localStorage once during initialization.
  const [voiceState, setVoiceState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_VOICE_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return validateAndParseStoredVoice(stored);
    } catch {
      return DEFAULT_VOICE_STATE;
    }
  });

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        const validated = validateAndParseStoredVoice(e.newValue);
        setVoiceState((prev) => {
          if (prev.mode !== validated.mode || prev.dialect !== validated.dialect) {
            return validated;
          }
          return prev;
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Save preference and update state.
   * Accepts either a string mode ("clear" | "friendly") or an object { mode, dialect }.
   */
  const setVoice = useCallback((newVoice) => {
    const targetMode =
      typeof newVoice === "string"
        ? newVoice
        : newVoice?.mode;

    const validatedMode = VALID_MODES.includes(targetMode) ? targetMode : "clear";
    const newState = { mode: validatedMode, dialect: null };

    setVoiceState(newState);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (err) {
      console.error("[MADAR Voice] Failed to persist voice preference to localStorage:", err);
    }
  }, []);

  /**
   * Centralized translation lookup function bound to active mode.
   * @param {string} key - Dot-delimited dictionary path (e.g., "dashboard.empty.title")
   * @param {string} [fallback] - Optional fallback string if key is not found
   */
  const t = useCallback(
    (key, fallback) => {
      return getTranslation(voiceState.mode, key, fallback);
    },
    [voiceState.mode]
  );

  const contextValue = useMemo(
    () => ({
      mode: voiceState.mode,
      dialect: voiceState.dialect,
      uiVoice: voiceState,
      setVoice,
      t,
    }),
    [voiceState, setVoice, t]
  );

  return <VoiceContext.Provider value={contextValue}>{children}</VoiceContext.Provider>;
}

/** Hook — must be used inside VoiceProvider */
export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return ctx;
}
