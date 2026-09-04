"use client";

import Image from "next/image";

/**
 * LoadingState - Official branded loading component for MADAR (مدار)
 *
 * Features:
 * - Ambient backdrop blur and gradient aura in theme colors
 * - Futuristic spinning orbital rings ("مدار" = orbit)
 * - MADAR 'M' symbol floating at center with subtle glow and pulse
 * - Clean, branded typography matching UI Voice
 * - Variants:
 *    - "fullscreen": Covers entire screen with proper background (page transitions / root loading)
 *    - "card": Embedded loading container for widgets, tabs, or inner sections
 *    - "inline": Minimal compact spinner with logo symbol
 */
export default function LoadingState({
  title = "جاري التحميل...",
  subtitle = "MADAR (مدار) يجهز بياناتك الذكية",
  variant = "fullscreen", // "fullscreen" | "card" | "inline"
  size = "md", // "sm" | "md" | "lg"
  className = "",
}) {
  const sizeConfig = {
    sm: {
      symbol: { w: 26, h: 22 },
      orbit: "w-16 h-16",
      dotOrbit: "w-20 h-20",
      title: "text-sm font-bold",
      subtitle: "text-[11px]",
      gap: "space-y-3",
    },
    md: {
      symbol: { w: 34, h: 28 },
      orbit: "w-20 h-20",
      dotOrbit: "w-28 h-28",
      title: "text-base font-bold",
      subtitle: "text-xs",
      gap: "space-y-4",
    },
    lg: {
      symbol: { w: 44, h: 36 },
      orbit: "w-28 h-28",
      dotOrbit: "w-36 h-36",
      title: "text-lg sm:text-xl font-bold",
      subtitle: "text-xs sm:text-sm",
      gap: "space-y-5",
    },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500/20 border-t-[#00D2FF] border-r-[#0B57D0] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-ping" />
          </div>
        </div>
        {title && <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{title}</span>}
      </div>
    );
  }

  const isFullscreen = variant === "fullscreen";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        relative flex flex-col items-center justify-center select-none text-right overflow-hidden
        ${
          isFullscreen
            ? "min-h-screen w-full bg-white dark:bg-[#09090b] text-[#1A1D1F] dark:text-zinc-100 p-6"
            : "w-full py-16 sm:py-20 px-4 text-[#1A1D1F] dark:text-zinc-100"
        }
        ${className}
      `.trim()}
    >
      {/* Ambient background glowing aura */}
      <div
        className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#00D2FF]/15 via-[#0B57D0]/20 to-transparent blur-3xl pointer-events-none -z-10 animate-pulse"
        style={{ animationDuration: "3s" }}
        aria-hidden="true"
      />

      <div className={`relative z-10 flex flex-col items-center text-center ${config.gap}`}>
        {/* Orbital Rings with Floating MADAR Logo */}
        <div className="relative flex items-center justify-center">
          {/* Outer Orbital Ring (Counter-clockwise rotation) */}
          <div
            className={`
              ${config.dotOrbit} rounded-full absolute pointer-events-none
              border border-dashed border-blue-400/25 dark:border-blue-500/30
              animate-spin
            `}
            style={{ animationDuration: "14s", animationDirection: "reverse" }}
            aria-hidden="true"
          />

          {/* Inner Glowing Gradient Ring (Clockwise rotation) */}
          <div
            className={`
              ${config.orbit} rounded-full p-[2px]
              bg-gradient-to-tr from-transparent via-[#0B57D0]/40 to-[#00D2FF]
              animate-spin shadow-lg shadow-blue-500/10 dark:shadow-cyan-500/15
            `}
            style={{ animationDuration: "2.4s" }}
            aria-hidden="true"
          >
            {/* Center disc mask */}
            <div className="w-full h-full rounded-full bg-white dark:bg-[#0d0d10]" />
          </div>

          {/* Central Logo Container with Breathing Pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center p-2 rounded-2xl bg-white/90 dark:bg-[#131316]/95 backdrop-blur-xs border border-blue-500/20 shadow-md shadow-blue-500/10 dark:shadow-blue-950/50 madar-loading-pulse">
              <Image
                src="/brand/madar-symbol.png"
                alt="MADAR Loading"
                width={config.symbol.w}
                height={config.symbol.h}
                priority
                className="object-contain drop-shadow-[0_2px_8px_rgba(0,191,255,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* Informative Text */}
        {(title || subtitle) && (
          <div className="space-y-1.5 max-w-sm px-2">
            {title && (
              <h2 className={`${config.title} text-[#1A1D1F] dark:text-zinc-100 tracking-tight`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`${config.subtitle} text-[#575C61] dark:text-zinc-400 font-medium leading-relaxed`}>
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
