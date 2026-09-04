"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function UserMenu({ user = null, collapsed = false }) {
  const { data: session } = useSession();
  const currentUser = user || session?.user;

  if (!currentUser) {
    return null;
  }

  const name = currentUser.name || "المسوق الذكي";
  const email = currentUser.email || "";
  const initial = name ? name.charAt(0).toUpperCase() : "م";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-right shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        {currentUser.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUser.image}
            alt={name}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700/80 object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center justify-center text-xs font-black shrink-0">
            {initial}
          </div>
        )}

        {!collapsed && (
          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate leading-tight">
              {name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-500 truncate leading-tight">
              {email}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Theme toggle — cycles dark/light/system */}
        <ThemeToggle />

        <button
          type="button"
          onClick={handleSignOut}
          title="تسجيل الخروج"
          aria-label="تسجيل الخروج"
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
