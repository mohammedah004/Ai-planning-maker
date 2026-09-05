"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowRight } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";
import { useVoice } from "@/app/contexts/VoiceContext";

export default function LoginClient({ callbackUrl }) {
  const { t } = useVoice();

  return (
    <main className="min-h-screen bg-[#F8F9FB] dark:bg-[#09090b] text-[#1A1D1F] dark:text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none selection:bg-blue-600 selection:text-white">
      {/* Subtle Orbital Background Decorations inspired by MADAR brand */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-blue-400/15 dark:border-blue-500/15 pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute w-[680px] h-[680px] rounded-full border border-blue-400/10 dark:border-blue-500/10 pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Ambient glowing aura */}
      <div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#00D2FF]/10 via-[#0B57D0]/15 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Main Login Card */}
        <div className="bg-white dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-blue-950/5 dark:shadow-2xl dark:shadow-black/70 text-center space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center space-y-3">
            <Link
              href="/"
              className="relative p-3.5 rounded-2xl bg-white dark:bg-[#18181d] border border-blue-500/20 dark:border-blue-500/30 shadow-md shadow-blue-500/10 dark:shadow-blue-950/40 hover:scale-105 transition-all duration-300 group"
              title="الصفحة الرئيسية لـ MADAR"
            >
              <Image
                src="/brand/madar-symbol.png"
                alt="MADAR Symbol"
                width={46}
                height={38}
                priority
                className="object-contain drop-shadow-[0_2px_8px_rgba(0,191,255,0.4)]"
              />
            </Link>

            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black tracking-widest text-[#1A1D1F] dark:text-white uppercase font-sans">
                MADAR
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-blue-50 text-[#0B57D0] border border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800">
                مدار
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D1F] dark:text-zinc-100 tracking-tight">
                {t("auth.welcomeTitle", "أهلاً بك في MADAR")}
              </h1>
              <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                {t(
                  "auth.welcomeSubtitle",
                  "منصتك الذكية لتشخيص التموضع وتوليد خطط محتوى إنستغرام لـ 30 يوماً وتصديرها مباشرة."
                )}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-4 pt-2">
            <GoogleSignInButton callbackUrl={callbackUrl} />

            {/* Security Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl py-2.5 px-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {t("auth.securityBadge", "تسجيل دخول فوري ومحمي عبر Google OAuth")}
              </span>
            </div>
          </div>

          {/* Terms / Privacy Footer Note */}
          <p className="text-[11px] text-[#575C61] dark:text-zinc-500 leading-relaxed pt-4 border-t border-[#E4E7EC]/80 dark:border-zinc-800/80">
            {t(
              "auth.termsNote",
              "بتسجيل الدخول، فإنك تؤكد موافقتك على استخدام النظام وفق معايير حماية البيانات وسياسة الاستخدام المعتمدة."
            )}
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#575C61] hover:text-[#0B57D0] dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <span>{t("auth.backToHome", "العودة للصفحة الرئيسية")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
