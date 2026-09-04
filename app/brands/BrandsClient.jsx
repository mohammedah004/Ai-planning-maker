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
import AppShell from "@/app/components/shell/AppShell";
import PageHeader from "@/app/components/shell/PageHeader";
import Button from "@/app/components/ui/Button";
import { useVoice } from "@/app/contexts/VoiceContext";

export default function BrandsClient({ initialBrands = [], initialPlans = [], user = null }) {
  const router = useRouter();
  const { t } = useVoice();
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
    <AppShell user={user} brandCount={brands.length}>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 text-right">
        {/* Page Contextual Header */}
        <PageHeader
          title={t("brands.header.title")}
          description={t("brands.header.description")}
          actions={
            <Button
              href="/brands/new"
              variant="primary"
              size="sm"
              startIcon={Plus}
            >
              {t("brands.header.addBrand")}
            </Button>
          }
        />

        {brands.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border border-dashed border-[#E4E7EC] bg-[#F8F9FB] dark:border-zinc-800 dark:bg-zinc-900/30 p-12 text-center max-w-xl mx-auto my-12 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 text-[#0B57D0] dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">
                  {t("brands.empty.title")}
                </h3>
                <p className="text-xs text-[#575C61] dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {t("brands.empty.description")}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/brands/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("brands.empty.action")}</span>
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
                    className={`rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border transition-all text-right p-6 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-sm ${
                      brand.is_default ? "border-blue-400/80 ring-1 ring-blue-400/20" : "border-[#E4E7EC] dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-extrabold text-[#1A1D1F] dark:text-zinc-100 leading-snug">
                              {brand.name}
                            </h3>
                            {brand.is_default && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-300 text-[10px] font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{t("brands.card.defaultBadge")}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#575C61] dark:text-zinc-400">
                            المنتج: <span className="text-[#1A1D1F] dark:text-zinc-200 font-semibold">{brand.product_name}</span>
                          </p>
                        </div>

                        {/* Actions: Edit & Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={`/brands/${brand.id}/edit`}
                            className="p-1.5 rounded-lg text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title={t("brands.card.editAction")}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setBrandToDelete({ id: brand.id, name: brand.name });
                            }}
                            className="p-1.5 rounded-lg text-[#575C61] hover:text-red-600 hover:bg-[#F0F4F8] dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title={t("brands.card.deleteAction")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Brand Memory Metrics Pill Row */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950/70 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
                          <span className="block text-[10px] text-[#575C61] dark:text-zinc-500 font-bold">الخطط المنشأة</span>
                          <span className="text-sm font-extrabold text-[#0B57D0] dark:text-blue-400">{insights.plansCount} خطط</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950/70 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
                          <span className="block text-[10px] text-[#575C61] dark:text-zinc-500 font-bold">إجمالي المنشورات</span>
                          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{insights.totalPostsCount} منشور</span>
                        </div>
                      </div>

                      {/* Category & Tone Chips */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#575C61] dark:text-zinc-400">
                          <Tag className="w-3.5 h-3.5 text-[#0B57D0] dark:text-blue-400 shrink-0" />
                          <span>التصنيف:</span>
                          <span className="text-[#1A1D1F] dark:text-zinc-200 font-semibold">{brand.product_category}</span>
                        </div>

                        {tones.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {tones.map((toneItem, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 text-[#1A1D1F] dark:text-zinc-300 text-[11px]"
                              >
                                {toneItem}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Target Audience Preview */}
                      {brand.target_audience && (
                        <div className="space-y-0.5 pt-2 border-t border-[#E4E7EC] dark:border-zinc-800/80 text-xs">
                          <span className="block text-[10px] font-bold text-[#575C61] dark:text-zinc-500 uppercase tracking-wider">
                            الجمهور المستهدف:
                          </span>
                          <p className="text-[#575C61] dark:text-zinc-300 line-clamp-2 leading-relaxed">
                            {brand.target_audience}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-4 border-t border-[#E4E7EC] dark:border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveMemoryBrand({ brand, plans: brandPlans, insights })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 hover:bg-[#F0F4F8] dark:hover:border-zinc-700 text-[#1A1D1F] dark:text-zinc-300 dark:hover:text-zinc-100 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <History className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>سجل الذاكرة ({brandPlans.length})</span>
                      </button>

                      <Link
                        href={`/plans/new?brandId=${brand.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0B57D0] dark:bg-blue-600/10 dark:hover:bg-blue-600/20 dark:border-blue-500/20 dark:text-blue-400 font-bold text-xs transition-colors"
                      >
                        <span>{t("brands.card.newPlanAction")}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Brand Memory & Strategic Timeline Modal */}
      {activeMemoryBrand && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-right">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 text-right shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC] dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">
                    الذاكرة الاستراتيجية: {activeMemoryBrand.brand.name}
                  </h3>
                  <p className="text-xs text-[#575C61] dark:text-zinc-400">سجل تطور الخطط التسويقية التراكمية</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveMemoryBrand(null)}
                className="p-2 rounded-xl text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aggregated Insights Summary */}
            <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-2">
              <span className="block text-xs font-bold text-[#0B57D0] dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>ملخص الذاكرة التراكمية:</span>
              </span>
              <p className="text-xs text-[#1A1D1F] dark:text-zinc-300 leading-relaxed">
                {activeMemoryBrand.insights.summary}
              </p>
            </div>

            {/* Timeline of Plans */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#575C61] dark:text-zinc-400 uppercase tracking-wider">
                الخطط التسويقية السابقة ({activeMemoryBrand.plans.length}):
              </h4>

              {activeMemoryBrand.plans.length === 0 ? (
                <p className="text-xs text-[#575C61] dark:text-zinc-500 py-4 text-center">لا توجد خطط منشأة لهذا البراند بعد.</p>
              ) : (
                <div className="space-y-2.5">
                  {activeMemoryBrand.plans.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-zinc-950/60 border border-[#E4E7EC] dark:border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-200">{p.product_name || "خطة تسويقية"}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-zinc-900 dark:border-zinc-800 dark:text-blue-400 text-[10px] font-bold">
                            {(p.marketing_objective || "").replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="block text-[11px] text-[#575C61] dark:text-zinc-500">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : ""}
                        </span>
                      </div>

                      <Link
                        href={`/plans/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0B57D0] dark:bg-blue-600/10 dark:hover:bg-blue-600/20 dark:border-blue-500/20 dark:text-blue-400 text-xs font-bold transition-colors"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-xs transition-all shadow-sm"
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
        title={t("brands.deleteModal.title")}
        description={
          brandToDelete
            ? `${t("brands.deleteModal.description")} ("${brandToDelete.name}")`
            : ""
        }
        confirmText={t("brands.deleteModal.confirm")}
        cancelText={t("brands.deleteModal.cancel")}
        isLoading={isDeleting}
        error={deleteError}
        variant="danger"
      />
    </AppShell>
  );
}
