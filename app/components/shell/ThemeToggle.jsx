"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";

const emptySubscribe = () => () => {};

/** Ordered cycle: dark → light → system → dark */
const THEMES = [
  { value: "dark",   icon: Moon,    label: "داكن"    },
  { value: "light",  icon: Sun,     label: "فاتح"    },
  { value: "system", icon: Monitor, label: "تلقائي"  },
];

/**
 * ThemeToggle — small icon button that cycles through dark/light/system.
 * Designed to sit beside the logout button inside UserMenu.
 */
export default function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return <div className="p-2 w-8 h-8 shrink-0" aria-hidden="true" />;
  }

  const currentIndex = THEMES.findIndex((t) => t.value === theme);
  const current = THEMES[currentIndex] ?? THEMES[0];
  const Icon = current.icon;

  const handleCycle = () => {
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].value);
  };

  return (
    <button
      type="button"
      onClick={handleCycle}
      title={`المظهر: ${current.label} — انقر للتغيير`}
      aria-label={`تبديل المظهر، الحالي: ${current.label}`}
      className="p-2 rounded-xl text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
