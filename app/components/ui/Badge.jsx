"use client";

const variantStyles = {
  default: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
  subtle: "bg-zinc-900/60 text-zinc-400 border-zinc-800",
  blue: "bg-blue-950/60 text-blue-300 border-blue-800/60",
  emerald: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
  amber: "bg-amber-950/60 text-amber-300 border-amber-800/60",
  red: "bg-red-950/60 text-red-300 border-red-800/60",
  purple: "bg-purple-950/60 text-purple-300 border-purple-800/60",
  outline: "bg-transparent text-zinc-300 border-zinc-750",
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
