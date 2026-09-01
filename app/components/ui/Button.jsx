"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

const variantStyles = {
  primary:
    "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm shadow-blue-900/30 border border-blue-500/30",
  secondary:
    "bg-zinc-800/90 hover:bg-zinc-700/90 active:bg-zinc-800 text-zinc-100 border border-zinc-750",
  outline:
    "bg-transparent hover:bg-zinc-800/60 active:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700",
  ghost:
    "bg-transparent hover:bg-zinc-800/60 active:bg-zinc-800 text-zinc-400 hover:text-zinc-100",
  danger:
    "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-sm shadow-red-950/40 border border-red-500/30",
  emerald:
    "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm shadow-emerald-950/40 border border-emerald-500/30",
  subtle:
    "bg-zinc-900/90 hover:bg-zinc-850 active:bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800",
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
