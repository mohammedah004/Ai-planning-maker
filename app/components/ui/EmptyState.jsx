"use client";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action = null,
  secondaryAction = null,
  className = "",
}) {
  return (
    <div
      className={`
        rounded-3xl border border-dashed border-[#E4E7EC] dark:border-zinc-800 bg-[#F8F9FB] dark:bg-[#131316]/50 p-8 sm:p-12 text-center max-w-xl mx-auto my-8 space-y-4
        ${className}
      `.trim()}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 text-[#0B57D0] dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
          <Icon className="w-7 h-7" />
        </div>
      )}

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">{description}</p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
