"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PageHeader({
  title,
  description = null,
  badge = null,
  backHref = null,
  backLabel = null,
  actions = null,
  className = "",
}) {
  return (
    <div
      className={`
        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6
        border-b border-zinc-800/80 text-right
        ${className}
      `.trim()}
    >
      {/* Right side in RTL: Back link, Title, Badge, Description */}
      <div className="space-y-1.5 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-1 font-medium group"
          >
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 shrink-0" />
            <span>{backLabel || "رجوع"}</span>
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>

        {description && (
          <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Left side in RTL: Action CTA buttons slot */}
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
