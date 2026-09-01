"use client";

import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";

export default function UserMenu({ user = null, className = "" }) {
  const name = user?.name || "المستخدم";
  const email = user?.email || "";
  const image = user?.image || null;

  // Extract initials for fallback avatar
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div
      className={`
        flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80
        text-zinc-200 transition-colors
        ${className}
      `.trim()}
    >
      <div className="flex items-center gap-3 min-w-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-9 h-9 rounded-lg object-cover border border-zinc-700/60 shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
            {initials || <UserIcon className="w-4 h-4 text-zinc-400" />}
          </div>
        )}

        <div className="min-w-0 text-right">
          <div className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
            {name}
          </div>
          {email && (
            <div className="text-[11px] text-zinc-500 truncate" dir="ltr">
              {email}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        aria-label="تسجيل الخروج"
        title="تسجيل الخروج"
        className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors shrink-0 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
