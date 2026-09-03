"use client";

const variantStyles = {
  default: "bg-zinc-100 text-[#1A1D1F] border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60",
  subtle: "bg-[#F0F4F8] text-[#575C61] border-[#E4E7EC] dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800",
  blue: "bg-blue-50 text-[#0B57D0] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
  red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60",
  purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60",
  outline: "bg-transparent text-[#575C61] border-[#E4E7EC] dark:text-zinc-300 dark:border-zinc-750",
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
