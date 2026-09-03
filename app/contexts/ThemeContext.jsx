"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * ThemeContext — manages light | dark | system theme preference.
 * - Persists to localStorage under key "theme"
 * - Applies/removes class="dark" on <html>
 * - "system" follows window.matchMedia prefers-color-scheme
 */
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Lazy initializer: reads localStorage once on first client render.
  // Falls back to "dark" (app default) if nothing is stored or
  // if localStorage is unavailable (SSR / incognito).
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch (_) {}
    return "dark";
  });

  // Apply/remove class="dark" on <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;

    const applyDark = (prefersDark) => {
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyDark(mq.matches);

      // Keep listening for OS preference changes
      const handler = (e) => applyDark(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  /** Save preference and update state */
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (_) {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook — must be used inside ThemeProvider */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
