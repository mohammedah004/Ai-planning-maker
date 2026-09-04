"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

const variantStyles = {
  primary:
    "bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-xs border border-slate-900 dark:bg-white dark:hover:bg-slate-100 dark:active:bg-slate-200 dark:text-slate-900 dark:border-white",
  secondary:
    "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs dark:bg-zinc-800/90 dark:hover:bg-zinc-700/90 dark:active:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-750",
  outline:
    "bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-700",
  ghost:
    "bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
  danger:
    "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-xs border border-rose-500/30",
  emerald:
    "bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-xs border border-emerald-600/30",
  subtle:
    "bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-850 dark:active:bg-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 dark:border-zinc-800",
};

const sizeStyles = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
  sm: "px-3.5 py-1.5 text-xs rounded-xl gap-2",
  md: "px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-sm sm:text-base rounded-xl gap-2.5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  href = null,
  startIcon: StartIcon,
  endIcon: EndIcon,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  const classes = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim();

  const content = (
    <>
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && StartIcon && <StartIcon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!isLoading && EndIcon && <EndIcon className="w-4 h-4 shrink-0" />}
    </>
  );

  if (href && !disabled && !isLoading) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
}
