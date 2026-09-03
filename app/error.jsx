"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowRight } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-[#1A1D1F] dark:text-slate-100 flex flex-col items-center justify-center p-4 text-center selection:bg-blue-100 dark:selection:bg-indigo-500 selection:text-[#0B57D0] dark:selection:text-white">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#F8F9FB] dark:bg-slate-900/80 border border-[#E4E7EC] dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 dark:bg-red-950/80 dark:border-red-800/80 dark:text-red-400 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-extrabold text-[#1A1D1F] dark:text-white">حدث خطأ غير متوقع</h1>
          <p className="text-xs sm:text-sm text-[#575C61] dark:text-slate-400 leading-relaxed">
            نعتذر، واجه الخادم صعوبة أثناء معالجة طلبك. يمكنك إعادة المحاولة الآن أو العودة للوحة التحكم.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-white hover:bg-[#F0F4F8] border border-[#E4E7EC] text-[#1A1D1F] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent font-bold text-xs transition-colors shadow-xs"
          >
            <span>لوحة التحكم</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
