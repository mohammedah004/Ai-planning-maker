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
  Loader2,
  Globe,
  Tag,
  Target,
  ExternalLink,
} from "lucide-react";

export default function BrandsClient({ initialBrands = [] }) {
  const router = useRouter();
  const [brands, setBrands] = useState(initialBrands);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (brandId, brandName) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف ملف البراند "${brandName}"؟`)) {
      return;
    }

    setDeletingId(brandId);
    try {
      const res = await fetch(`/api/brands/${brandId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        setBrands((prev) => prev.filter((b) => b.id !== brandId));
      } else {
        alert(json.error?.message || "تعذر حذف ملف البراند.");
      }
    } catch (err) {
      console.error("Delete brand error:", err);
      alert("حدث خطأ في الاتصال أثناء الحذف.");
    } finally {
      setDeletingId(null);
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
              <span>ذاكرة البراند الذكية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">ملفات البراند المحفوظة</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              احفظ معلومات منتجاتك وجمهورك مرة واحدة، وأنشئ خطط تسويقية شهرية بنقرة زر بدون إعادة إدخال البيانات في كل مرة.
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
                            onClick={() => handleDelete(brand.id, brand.name)}
                            disabled={deletingId === brand.id}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                            title="حذف البراند"
                          >
                            {deletingId === brand.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
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

                      {/* Target Audience & Problem Preview */}
                      <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                        {brand.target_audience && (
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              الجمهور المستهدف:
                            </span>
                            <p className="text-zinc-300 line-clamp-2 leading-relaxed">
                              {brand.target_audience}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA to Use in New Plan */}
                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
                      {brand.website_url ? (
                        <a
                          href={brand.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>الموقع الإلكتروني</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-zinc-600">لا يوجد موقع</span>
                      )}

                      <Link
                        href={`/plans/new?brandId=${brand.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 font-bold text-xs transition-colors"
                      >
                        <span>استخدام لإنشاء خطة</span>
                      </Link>
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
