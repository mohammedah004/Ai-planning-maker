"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  ArrowRight,
  Star,
  Edit,
  Trash2,
  Globe,
  Tag,
  History,
  Sparkles,
  Calendar,
  Layers,
  ArrowLeft,
  X,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import { aggregateBrandInsights } from "@/lib/brand-insights";

export default function BrandsClient({ initialBrands = [], initialPlans = [] }) {
  const router = useRouter();
  const [brands, setBrands] = useState(initialBrands);
  const [plans, setPlans] = useState(initialPlans);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [activeMemoryBrand, setActiveMemoryBrand] = useState(null);

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/brands/${brandToDelete.id}`, {
        method: "DELETE",
      });
      let json = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        json = await res.json();
      }

      if (res.ok && json?.success) {
        setBrands((prev) => prev.filter((b) => b.id !== brandToDelete.id));
        setBrandToDelete(null);
      } else {
        setDeleteError(json?.error?.message || "تعذر حذف ملف البراند.");
      }
    } catch (err) {
      console.error("Delete brand error:", err);
      setDeleteError("حدث خطأ في الاتصال أثناء الحذف.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للوحة التحكم</span>
            </Link>
          </div>

          <Link
            href="/brands/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة براند جديد</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-zinc-900 text-right">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold mb-1">
              <Building2 className="w-4 h-4" />
              <span>ذاكرة البراند الذكية (Brand Memory Engine)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">ملفات البراند والذاكرة الاستراتيجية</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              احفظ معلومات منتجاتك مرة واحدة، وتابع تطور الخطط التسويقية الشهرية المتراكمة لنفس البراند بدون تكرار.
            </p>
          </div>
        </div>

        {/* Brands List or Empty State */}
        <div className="mt-8 space-y-4">
          {brands.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center max-w-xl mx-auto my-12 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-blue-400 flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-100">لا توجد ملفات براند محفوظة</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  أنشئ أول ملف براند لمنتجك واحفظ الجمهور ونبرة الصوت والحلول للاستخدام التلقائي عند توليد الخطط التسويقية.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/brands/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة براند جديد الآن</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => {
                const tones = Array.isArray(brand.brand_tone)
                  ? brand.brand_tone
                  : typeof brand.brand_tone === "string"
                  ? [brand.brand_tone]
                  : [];

                const brandPlans = plans.filter((p) => p.brand_profile_id === brand.id);
                const insights = aggregateBrandInsights(brandPlans, []);

                return (
                  <div
                    key={brand.id}
                    className={`rounded-2xl bg-zinc-900 border transition-all text-right p-6 flex flex-col justify-between space-y-5 shadow-sm ${
                      brand.is_default ? "border-blue-500/50 ring-1 ring-blue-500/20" : "border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-extrabold text-zinc-100 leading-snug">
                              {brand.name}
                            </h3>
                            {brand.is_default && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-[10px] font-bold">
                                <Star className="w-3 h-3 fill-blue-300" />
                                <span>الافتراضي</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">
                            المنتج: <span className="text-zinc-200 font-semibold">{brand.product_name}</span>
                          </p>
                        </div>

                        {/* Actions: Edit & Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={`/brands/${brand.id}/edit`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                            title="تعديل البراند"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setBrandToDelete({ id: brand.id, name: brand.name });
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="حذف البراند"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Brand Memory Metrics Pill Row */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                          <span className="block text-[10px] text-zinc-500 font-bold">الخطط المنشأة</span>
                          <span className="text-sm font-extrabold text-blue-400">{insights.plansCount} خطط</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                          <span className="block text-[10px] text-zinc-500 font-bold">إجمالي المنشورات</span>
                          <span className="text-sm font-extrabold text-emerald-400">{insights.totalPostsCount} منشور</span>
                        </div>
                      </div>

                      {/* Category & Tone Chips */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Tag className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>التصنيف:</span>
                          <span className="text-zinc-200 font-semibold">{brand.product_category}</span>
                        </div>

                        {tones.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {tones.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Target Audience Preview */}
                      {brand.target_audience && (
                        <div className="space-y-0.5 pt-2 border-t border-zinc-800/80 text-xs">
                          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            الجمهور المستهدف:
                          </span>
                          <p className="text-zinc-300 line-clamp-2 leading-relaxed">
                            {brand.target_audience}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveMemoryBrand({ brand, plans: brandPlans, insights })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-amber-400" />
                        <span>سجل الذاكرة ({brandPlans.length})</span>
                      </button>

                      <Link
                        href={`/plans/new?brandId=${brand.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 font-bold text-xs transition-colors"
                      >
                        <span>إنشاء خطة جديدة</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Brand Memory & Strategic Timeline Modal */}
      {activeMemoryBrand && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 text-right shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                    الذاكرة الاستراتيجية: {activeMemoryBrand.brand.name}
                  </h3>
                  <p className="text-xs text-zinc-400">سجل تطور الخطط التسويقية التراكمية</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveMemoryBrand(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aggregated Insights Summary */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
              <span className="block text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ملخص الذاكرة التراكمية:</span>
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeMemoryBrand.insights.summary}
              </p>
            </div>

            {/* Timeline of Plans */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                الخطط التسويقية السابقة ({activeMemoryBrand.plans.length}):
              </h4>

              {activeMemoryBrand.plans.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">لا توجد خطط منشأة لهذا البراند بعد.</p>
              ) : (
                <div className="space-y-2.5">
                  {activeMemoryBrand.plans.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-200">{p.product_name || "خطة تسويقية"}</span>
                          <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-blue-400 text-[10px] font-bold">
                            {(p.marketing_objective || "").replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="block text-[11px] text-zinc-500">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : ""}
                        </span>
                      </div>

                      <Link
                        href={`/plans/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-bold transition-colors"
                      >
                        <span>فتح الخطة</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-left">
              <Link
                href={`/plans/new?brandId=${activeMemoryBrand.brand.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء خطة جديدة مستندة للذاكرة</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <ConfirmDeleteModal
        isOpen={Boolean(brandToDelete)}
        onClose={() => setBrandToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="حذف ملف البراند"
        description={
          brandToDelete
            ? `هل أنت متأكد من حذف ملف البراند "${brandToDelete.name}"؟ لن تؤثر عملية الحذف على الخطط السابقة المفعلة.`
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
