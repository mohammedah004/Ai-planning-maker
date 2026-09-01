"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
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
  Building2,
} from "lucide-react";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import { pingBackendHealth } from "@/lib/backend-health";

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

export default function DashboardClient({ session, initialPlans = [], initialBrands = [] }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [brands, setBrands] = useState(initialBrands);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    pingBackendHealth();
  }, []);

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/plans/${planToDelete.id}`, { method: "DELETE" });
      let json = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        json = await res.json();
      }

      if (res.ok && json?.success) {
        setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
        setPlanToDelete(null);
      } else {
        setDeleteError(json?.error?.message || "الخطة غير موجودة أو لا تملك صلاحية حذفها.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("تعذر الحذف. يرجى المحاولة مجدداً.");
    } finally {
      setIsDeleting(false);
    }
  };

  const completedCount = plans.filter((p) => p.status === "completed").length;
  const inProgressCount = plans.filter((p) => p.status === "generating" || p.status === "draft").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Dashboard Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 font-extrabold text-base text-zinc-100">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                AI
              </div>
              <span>مخطط التسويق الذكي</span>
            </Link>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-100 bg-zinc-800 border border-zinc-700/60"
              >
                الخطط التسويقية
              </Link>
              <Link
                href="/brands"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>ملفات البراند</span>
                {brands.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700">
                    {brands.length}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "User Avatar"}
                  className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-bold">
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : "م"}
                </div>
              )}
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-zinc-100 leading-tight">{session.user.name || "المسوق الذكي"}</div>
                <div className="text-[11px] text-zinc-500 leading-tight">{session.user.email}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="تسجيل الخروج"
              className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Action Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-zinc-900">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">الخطط التسويقية</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              أنشئ، تابع، وصدّر خطط وجداول محتوى إنستغرام لـ 30 يوماً بكامل تفاصيلها.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/brands"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-bold text-xs sm:text-sm transition-all"
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>إدارة ملفات البراند ({brands.length})</span>
            </Link>

            <Link
              href="/plans/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء خطة جديدة</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm text-right space-y-1">
            <span className="text-xs text-zinc-400 font-bold">إجمالي الخطط</span>
            <div className="text-2xl font-extrabold text-zinc-100">{plans.length}</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm text-right space-y-1">
            <span className="text-xs text-zinc-400 font-bold">الخطط المكتملة</span>
            <div className="text-2xl font-extrabold text-emerald-400">{completedCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm text-right space-y-1">
            <span className="text-xs text-zinc-400 font-bold">قيد المعالجة</span>
            <div className="text-2xl font-extrabold text-blue-400">{inProgressCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm text-right space-y-1">
            <span className="text-xs text-zinc-400 font-bold">ملفات البراند</span>
            <div className="text-2xl font-extrabold text-purple-400">{brands.length}</div>
          </div>
        </div>

        {/* Plans List / Grid */}
        {plans.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center max-w-xl mx-auto my-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-blue-400 flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-100">لا توجد خطط تسويقية بعد</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                ابدأ بإنشاء أول خطة محتوى تسويقية لـ 30 يوماً لمنتجك أو مشروعك وادعُ الذكاء الاصطناعي لإعداد الاستراتيجية كاملة.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/plans/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>أنشئ خطتك الأولى الآن</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const sheetExport = Array.isArray(plan.google_sheet_exports)
                ? plan.google_sheet_exports[0]
                : plan.google_sheet_exports;
              const sheetUrl = sheetExport?.spreadsheet_url;

              const isCompleted = plan.status === "completed";
              const isFailed = plan.status === "failed";

              const formattedDate = plan.created_at
                ? new Date(plan.created_at).toLocaleDateString("ar-SA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <div
                  key={plan.id}
                  className="rounded-2xl bg-zinc-900 border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all text-right shadow-sm group"
                >
                  <div className="space-y-4">
                    {/* Header: Title & Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-blue-400 font-semibold border border-zinc-700/60 inline-block">
                          {plan.product_category}
                        </span>
                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-blue-400 transition-colors leading-snug">
                          {plan.product_name}
                        </h3>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setPlanToDelete({ id: plan.id, name: plan.product_name });
                        }}
                        title="حذف الخطة"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400">
                      الهدف: <span className="text-zinc-300 font-semibold">{formatObjective(plan.marketing_objective)}</span>
                    </p>

                    {/* Status Badge */}
                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>الخطة مكتملة</span>
                        </span>
                      ) : isFailed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>تعثر التوليد</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-semibold animate-pulse">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري التوليد...</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-5 mt-5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-500 font-medium">{formattedDate}</span>

                    <div className="flex items-center gap-2">
                      {sheetUrl && (
                        <a
                          href={sheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition-colors"
                          title="فتح ملف Google Sheet"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </a>
                      )}

                      <Link
                        href={`/plans/${plan.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                      >
                        <span>عرض التفاصيل</span>
                        <ChevronLeft className="w-3.5 h-3.5 dir-ltr" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Popup */}
      <ConfirmDeleteModal
        isOpen={Boolean(planToDelete)}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="حذف الخطة التسويقية"
        description={
          planToDelete
            ? `هل أنت متأكد من حذف خطة "${planToDelete.name}"؟ سيتم حذف جميع منشورات الـ 30 يوماً والتصاميم والتوجيهات البصرية المرتبطة بها نهائياً.`
            : ""
        }
        confirmText="تأكيد الحذف النهائي"
        cancelText="إلغاء"
        isLoading={isDeleting}
        error={deleteError}
        variant="danger"
      />
    </div>
  );
}
