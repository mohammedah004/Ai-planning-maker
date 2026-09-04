"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * MadarLogo - Official visual identity component for MADAR (مدار)
 *
 * Variants:
 *  - "full": Isolated 'M' symbol + bold "MADAR" wordmark + subtitle (default for navbars)
 *  - "symbol": Isolated 'M' symbol only (compact viewports)
 *  - "circular": Polished circular badge with 'M' symbol (matching favicon)
 *  - "splash": Full high-res brand lockup with dark neon backdrop (for login / splash screens)
 *
 * Interaction Effect ("The n8n Effect"):
 *  - Natural vibrant blue gradient in rest state
 *  - Soft neon-blue outer glow pulse on hover / focus: drop-shadow(0 0 8px rgba(0, 191, 255, 0.7))
 *  - Smooth transition: all 0.3s ease-in-out
 */
export default function MadarLogo({
  variant = "full", // "full" | "symbol" | "circular" | "splash"
  href = "/",
  showSubtitle = true,
  subtitle = "AI Content Planning",
  size = "md", // "sm" | "md" | "lg" | "xl"
  className = "",
  onClick,
}) {
  // Dimension configurations
  const sizeMap = {
    sm: {
      symbol: { w: 32, h: 26 },
      circle: { w: 32, h: 32 },
      text: "text-lg",
      subText: "text-[10px]",
      splash: { w: 220, h: 204 },
    },
    md: {
      symbol: { w: 42, h: 34 },
      circle: { w: 40, h: 40 },
      text: "text-xl sm:text-2xl",
      subText: "text-[11px]",
      splash: { w: 320, h: 296 },
    },
    lg: {
      symbol: { w: 56, h: 45 },
      circle: { w: 52, h: 52 },
      text: "text-2xl sm:text-3xl",
      subText: "text-xs",
      splash: { w: 420, h: 390 },
    },
    xl: {
      symbol: { w: 72, h: 58 },
      circle: { w: 68, h: 68 },
      text: "text-3xl sm:text-4xl",
      subText: "text-sm",
      splash: { w: 480, h: 445 },
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Inner Content based on variant
  const renderContent = () => {
    if (variant === "splash") {
      return (
        <div className="relative group/splash flex flex-col items-center select-none text-center">
          {/* Subtle ambient backdrop aura */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#00D2FF]/20 via-[#0B57D0]/30 to-transparent rounded-3xl blur-2xl opacity-60 group-hover/splash:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Full Brand Lockup with Dark Background */}
          <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-950/60 transition-transform duration-300 group-hover/splash:scale-[1.02]">
            <Image
              src="/brand/madar-logo-full.png"
              alt="MADAR - AI Content Planning"
              width={currentSize.splash.w}
              height={currentSize.splash.h}
              priority
              className="w-auto h-auto max-w-full madar-logo-glow"
            />
          </div>
        </div>
      );
    }

    if (variant === "circular") {
      return (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 madar-logo-glow transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/brand/madar-circular-icon.png"
              alt="MADAR Icon"
              width={currentSize.circle.w}
              height={currentSize.circle.h}
              priority
              className="rounded-full shadow-md shadow-blue-900/30"
            />
          </div>

          {showSubtitle && (
            <div className="flex flex-col text-right">
              <span className={`font-black tracking-[0.08em] uppercase text-zinc-900 dark:text-white leading-tight madar-brand-text ${currentSize.text}`}>
                MADAR
              </span>
              <span className={`font-semibold text-blue-600 dark:text-blue-400 leading-none tracking-wide ${currentSize.subText}`}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
      );
    }

    if (variant === "symbol") {
      return (
        <div className="relative shrink-0 madar-logo-glow transition-transform duration-300 group-hover:scale-105">
          <Image
            src="/brand/madar-symbol.png"
            alt="MADAR Symbol"
            width={currentSize.symbol.w}
            height={currentSize.symbol.h}
            priority
            className="object-contain"
          />
        </div>
      );
    }

    // Default "full" variant: Isolated M Symbol + Custom Bold MADAR Typography
    return (
      <div className="flex items-center gap-3 group/logo">
        {/* Isolated 'M' symbol with the "n8n Effect" Glow */}
        <div className="relative shrink-0 flex items-center justify-center madar-logo-glow transition-transform duration-300 group-hover/logo:scale-105">
          <Image
            src="/brand/madar-symbol.png"
            alt="MADAR Symbol"
            width={currentSize.symbol.w}
            height={currentSize.symbol.h}
            priority
            className="object-contain drop-shadow-[0_2px_4px_rgba(0,191,255,0.25)]"
          />
        </div>

        {/* Custom Brand Wordmark */}
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-[0.14em] uppercase text-zinc-900 dark:text-white leading-none madar-brand-text transition-all duration-300 ${currentSize.text}`}
              style={{
                fontFamily: "var(--font-sans), 'Montserrat', 'Inter', system-ui, sans-serif",
              }}
            >
              MADAR
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-blue-50 text-[#0B57D0] border border-blue-200/80 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/80 leading-none">
              مدار
            </span>
          </div>

          {showSubtitle && (
            <span className={`font-semibold tracking-wider text-[#575C61] dark:text-zinc-400 mt-1 leading-none uppercase ${currentSize.subText}`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  };

  const sharedClasses = `madar-logo-container group inline-flex items-center focus:outline-none ${className}`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={sharedClasses} aria-label="MADAR - AI Content Planning Home">
        {renderContent()}
      </Link>
    );
  }

  return <div className={sharedClasses}>{renderContent()}</div>;
}
