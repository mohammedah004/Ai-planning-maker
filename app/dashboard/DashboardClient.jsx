"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sparkles,
  Plus,
  Calendar,
  FileSpreadsheet,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  FolderOpen,
  RefreshCw,
  Trash2,
  Loader2,
} from "lucide-react";

const formatObjective = (obj) => {
  const map = {
    brand_awareness: "زيادة الوعي",
    audience_engagement: "زيادة التفاعل",
    lead_generation: "جلب عملاء محتملين",
    direct_sales: "زيادة المبيعات",
    product_launch: "إطلاق منتج",
    brand_building: "بناء البراند",
  };
  return map[obj] || obj?.replace(/_/g, " ") || "غير محدد";
};

export default function DashboardClient({ session, initialPlans }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (planId, planName) => {
    if (!confirm(`هل أنت متأكد من حذف خطة "${planName}"؟ سيتم حذف جميع بياناتها نهائياً.`)) return;

    setDeletingId(planId);
    try {
      const res = await fetch(`/api/plans/${planId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPlans((prev) => prev.filter((p) => p.id !== planId));
      } else {
        alert(json.error?.message || "تعذر حذف الخطة.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("تعذر الحذف. يرجى المحاولة مجدداً.");
    } finally {
      setDeletingId(null);
    }
  };

  const completedCount = plans.filter((p) => p.status === "completed").length;
  const inProgressCount = plans.filter((p) => p.status === "generating" || p.status === "draft").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Dashboard Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>مخطط التسويق الذكي</span>
          </Link>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "User Avatar"}
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold">
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : "م"}
                </div>
              )}
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-white leading-tight">{session.user.name || "المسوق الذكي"}</div>
                <div className="text-xs text-slate-400 leading-tight">{session.user.email}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="تسجيل الخروج"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Action Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-slate-900">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">الخطط التسويقية</h1>
            <p className="text-slate-400 text-sm mt-1">
              أنشئ، تابع، وصدّر خطط وجداول محتوى إنستغرام لـ 30 يوماً بكامل تفاصيلها.
            </p>
          </div>

          <Link
            href="/plans/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.99] self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء خطة تسويقية جديدة</span>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">إجمالي الخطط</span>
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{plans.length}</div>
            <div className="text-xs text-slate-500 mt-1">حملة تسويقية تم إنشاؤها</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">الخطط المكتملة</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">{completedCount}</div>
            <div className="text-xs text-slate-500 mt-1">جاهزة ومصدرة لـ Google Sheets</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">قيد المعالجة</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">{inProgressCount}</div>
            <div className="text-xs text-slate-500 mt-1">يجري توليدها بواسطة AI</div>
          </div>
        </div>

        {/* Plans List or Empty State */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">سجل الخطط</h2>
            <span className="text-xs text-slate-400">
              {plans.length} {plans.length === 1 ? "خطة" : "خطط"}
            </span>
          </div>

          {plans.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">لا توجد خطط تسويقية بعد</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                أدخل تفاصيل منتجك وسيقوم محرك الذكاء الاصطناعي ببناء استراتيجية كاملة وتقويم محتوى إنستغرام لـ 30 يوماً وتصدير ملف Google Sheet في أقل من 90 ثانية.
              </p>
              <div className="mt-6">
                <Link
                  href="/plans/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>أنشئ خطتك التسويقية الأولى</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Plans Table / Cards */
            <div className="grid grid-cols-1 gap-3.5">
              {plans.map((plan) => {
                const sheetExport = Array.isArray(plan.google_sheet_exports)
                  ? plan.google_sheet_exports[0]
                  : plan.google_sheet_exports;

                const job = Array.isArray(plan.generation_jobs)
                  ? plan.generation_jobs[0]
                  : plan.generation_jobs;

                const isCompleted = plan.status === "completed" || job?.status === "completed";
                const isFailed = plan.status === "failed" || job?.status === "failed";
                const isGenerating = !isCompleted && !isFailed;
                const isDeleting = deletingId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`p-5 sm:p-6 rounded-2xl bg-slate-900/70 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-lg shadow-black/10 ${
                      isDeleting
                        ? "border-red-800/60 opacity-50"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1.5 text-right min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          href={`/plans/${plan.id}`}
                          className="font-bold text-white text-base hover:text-indigo-400 transition-colors"
                        >
                          {plan.product_name}
                        </Link>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {plan.product_category || "منتج"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>
                          الهدف: <strong className="text-slate-300">{formatObjective(plan.marketing_objective)}</strong>
                        </span>
                        <span>•</span>
                        <span>{new Date(plan.created_at).toLocaleDateString("ar-EG")}</span>
                        {job?.current_step && isGenerating && (
                          <>
                            <span>•</span>
                            <span className="text-amber-300 font-medium">{job.current_step}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center shrink-0">
                      {/* Status indicator */}
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>مكتمل</span>
                        </span>
                      ) : isFailed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>تعثر التوليد</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full font-bold animate-pulse">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري التوليد...</span>
                        </span>
                      )}

                      {/* Google Sheet Direct Button */}
                      {sheetExport?.spreadsheet_url && (
                        <a
                          href={sheetExport.spreadsheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all hover:scale-105 shadow-sm"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>فتح الشيت</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {/* Retry Button if Failed */}
                      {isFailed && (
                        <Link
                          href={`/plans/${plan.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>إعادة المحاولة</span>
                        </Link>
                      )}

                      {/* Plan details link */}
                      <Link
                        href={`/plans/${plan.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                      >
                        <span>التفاصيل</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>

                      {/* Delete Button */}
                      <button
                        id={`delete-plan-${plan.id}`}
                        onClick={() => handleDelete(plan.id, plan.product_name)}
                        disabled={isDeleting}
                        title="حذف الخطة نهائياً"
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-all cursor-pointer disabled:opacity-40"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
