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
            ? "bg-blue-50 text-[#0B57D0] font-bold border border-blue-200/80 shadow-xs dark:bg-zinc-800/90 dark:text-zinc-100 dark:border-zinc-700/70 dark:shadow-sm"
            : "text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] border border-transparent dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-850/60"
        }
        ${className}
      `.trim()}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? "text-[#0B57D0] dark:text-blue-400" : "text-[#575C61] group-hover:text-[#1A1D1F] dark:text-zinc-500 dark:group-hover:text-zinc-300"
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
                ? "bg-blue-100 text-[#0B57D0] border-blue-200 font-bold dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/80"
                : "bg-[#E4E7EC] text-[#575C61] border-[#E4E7EC] group-hover:text-[#1A1D1F] dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 dark:group-hover:text-zinc-400"
            }
          `}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
