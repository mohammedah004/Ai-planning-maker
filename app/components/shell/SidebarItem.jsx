"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({
  href,
  label,
  icon: Icon,
  badge = null,
  exact = false,
  onClick = null,
  className = "",
}) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`
        group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 select-none
        ${
          isActive
            ? "bg-zinc-800/90 text-zinc-100 font-bold border border-zinc-700/70 shadow-sm"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60 border border-transparent"
        }
        ${className}
      `.trim()}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
            }`}
          />
        )}
        <span className="truncate">{label}</span>
      </div>

      {badge !== null && (
        <span
          className={`
            px-2 py-0.5 text-[11px] rounded-full border tabular-nums shrink-0
            ${
              isActive
                ? "bg-blue-950/80 text-blue-300 border-blue-800/80 font-bold"
                : "bg-zinc-900 text-zinc-500 border-zinc-800 group-hover:text-zinc-400"
            }
          `}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
