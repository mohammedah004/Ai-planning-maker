import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck, Calendar, FileSpreadsheet } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";

export const metadata = {
  title: "تسجيل الدخول - مخطط التسويق الذكي",
  description: "سجل الدخول للوصول إلى خطط محتوى إنستغرام لـ 30 يوماً بالذكاء الاصطناعي.",
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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-sm font-medium hover:border-slate-700 transition-colors mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>مخطط التسويق الذكي</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">مرحباً بك مجدداً</h1>
          <p className="text-slate-400 mt-2 text-sm">
            سجل دخولك لإنشاء وإدارة وتصدير خطط محتوى إنستغرام لشهر كامل.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-indigo-950/40">
          <GoogleSignInButton callbackUrl={callbackUrl} />

          {/* Value highlights */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تسجيل دخول فوري وآمن عبر Google OAuth</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>بناء استراتيجية وجدول محتوى متوازن لـ 30 يوماً</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تصدير مباشر لملفات Google Sheets جاهزة للمصممين</span>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>العودة للصفحة الرئيسية</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
