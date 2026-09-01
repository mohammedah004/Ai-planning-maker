"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PageHeader({
  title,
  description = null,
  badge = null,
  backHref = null,
  backLabel = "العودة",
  actions = null,
  className = "",
}) {
  return (
    <div
      className={`
        flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-800/80 text-right
        ${className}
      `.trim()}
    >
      <div className="space-y-1.5">
        {backHref && (
          <div className="pb-1">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 font-bold transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>{backLabel}</span>
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-100 tracking-tight leading-snug">
            {title}
          </h1>
          {badge && <div>{badge}</div>}
        </div>

        {description && (
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
