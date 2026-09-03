import Link from "next/link";
import { Sparkles, ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "الصفحة غير موجودة - 404",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-[#1A1D1F] dark:text-slate-100 flex flex-col items-center justify-center p-4 text-center selection:bg-blue-100 dark:selection:bg-indigo-500 selection:text-[#0B57D0] dark:selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-blue-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full p-8 rounded-3xl bg-[#F8F9FB] dark:bg-slate-900/80 border border-[#E4E7EC] dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B57D0] text-xs font-bold border border-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>خطأ 404</span>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-extrabold text-[#1A1D1F] dark:text-white">الصفحة غير موجودة</h1>
          <p className="text-xs sm:text-sm text-[#575C61] dark:text-slate-400 leading-relaxed">
            الصفحة التي تحاول الوصول إليها قد تم نقلها أو حذفها أو أن الرابط غير صحيح.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-xs transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>لوحة التحكم</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-white hover:bg-[#F0F4F8] border border-[#E4E7EC] text-[#1A1D1F] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent font-bold text-xs transition-colors shadow-xs"
          >
            <span>الرئيسية</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
