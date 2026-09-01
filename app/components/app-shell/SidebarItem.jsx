"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({
  href,
  icon: Icon,
  label,
  badge = null,
  isExact = false,
  onClick,
  className = "",
}) {
  const pathname = usePathname();

  // Determine active state cleanly
  const isActive = isExact
    ? pathname === href
    : pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`
        group relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl
        text-xs sm:text-sm font-medium transition-all duration-150 select-none cursor-pointer
        ${
          isActive
            ? "bg-zinc-850/90 text-zinc-100 font-semibold border-r-2 border-blue-500 shadow-sm shadow-black/30"
            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/70 active:bg-zinc-850/50"
        }
        ${className}
      `.trim()}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive
                ? "text-blue-400"
                : "text-zinc-500 group-hover:text-zinc-300"
            }`}
          />
        )}
        <span className="truncate">{label}</span>
      </div>

      {badge && (
        <span
          className={`
            shrink-0 px-2 py-0.5 text-[11px] font-bold rounded-full border
            ${
              isActive
                ? "bg-blue-950/70 text-blue-300 border-blue-800/60"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 group-hover:border-zinc-700"
            }
          `}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
