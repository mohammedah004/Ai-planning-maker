"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

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
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3 text-right">
      <div className="flex items-center gap-3 min-w-0">
        {currentUser.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUser.image}
            alt={name}
            className="w-9 h-9 rounded-xl border border-zinc-700/80 object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-black shrink-0">
            {initial}
          </div>
        )}

        {!collapsed && (
          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-bold text-zinc-100 truncate leading-tight">
              {name}
            </div>
            <div className="text-[11px] text-zinc-500 truncate leading-tight">
              {email}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        title="تسجيل الخروج"
        aria-label="تسجيل الخروج"
        className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
