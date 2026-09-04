"use client";

const variantStyles = {
  default: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60",
  subtle: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800",
  blue: "bg-blue-50/80 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60",
  emerald: "bg-emerald-50/70 text-emerald-800 border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
  amber: "bg-amber-50/70 text-amber-900 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
  red: "bg-rose-50/70 text-rose-900 border-rose-200/80 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60",
  purple: "bg-violet-50/70 text-violet-700 border-violet-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60",
  outline: "bg-transparent text-slate-600 border-slate-200 dark:text-zinc-300 dark:border-zinc-750",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  icon: Icon,
  dot = false,
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-bold border shrink-0
        ${variantStyles[variant] || variantStyles.default}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `.trim()}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            variant === "emerald"
              ? "bg-emerald-400"
              : variant === "amber"
              ? "bg-amber-400"
              : variant === "red"
              ? "bg-red-400"
              : variant === "purple"
              ? "bg-purple-400"
              : "bg-blue-400"
          }`}
        />
      )}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
