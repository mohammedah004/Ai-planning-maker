import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck, Calendar, FileSpreadsheet } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";
import MadarLogo from "@/app/components/ui/MadarLogo";

export const metadata = {
  title: "تسجيل الدخول - MADAR - AI Content Planning",
  description: "سجل الدخول إلى MADAR للوصول إلى خطط محتوى إنستغرام لـ 30 يوماً بالذكاء الاصطناعي.",
};

export default async function LoginPage({ searchParams }) {
  let session = null;
  try {
    session = await auth();
  } catch (err) {
    // If browser has an old cookie from previous secret, ignore and proceed to login
    console.warn("Session check ignored expired/invalid cookie:", err?.message);
  }

  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/dashboard";

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-[#1A1D1F] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-blue-100 dark:selection:bg-indigo-500 selection:text-[#0B57D0] dark:selection:text-white">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-blue-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header with Full Splash MADAR Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-6">
            <MadarLogo href="/" variant="splash" size="md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1D1F] dark:text-white">مرحباً بك في MADAR</h1>
          <p className="text-[#575C61] dark:text-slate-400 mt-2 text-sm">
            سجل دخولك لإنشاء وإدارة وتصدير خطط محتوى إنستغرام لشهر كامل بالذكاء الاصطناعي.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#F8F9FB] dark:bg-slate-900/80 backdrop-blur-xl border border-[#E4E7EC] dark:border-slate-800 rounded-2xl p-8 shadow-xs dark:shadow-2xl dark:shadow-indigo-950/40">
          <GoogleSignInButton callbackUrl={callbackUrl} />

          {/* Value highlights */}
          <div className="mt-8 pt-6 border-t border-[#E4E7EC] dark:border-slate-800/80 space-y-3.5">
            <div className="flex items-center gap-2.5 text-xs text-[#575C61] dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>تسجيل دخول فوري وآمن عبر Google OAuth</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#575C61] dark:text-slate-400">
              <Calendar className="w-4 h-4 text-[#0B57D0] dark:text-indigo-400 shrink-0" />
              <span>بناء استراتيجية وجدول محتوى متوازن لـ 30 يوماً</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#575C61] dark:text-slate-400">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>تصدير مباشر لملفات Google Sheets جاهزة للمصممين</span>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#575C61] hover:text-[#1A1D1F] dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <span>العودة للصفحة الرئيسية</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
