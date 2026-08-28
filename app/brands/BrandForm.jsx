"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PRODUCT_CATEGORIES,
  BRAND_TONES,
  validateBrandInput,
} from "@/lib/validations/brand";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Star,
  Globe,
  Layers,
  Target,
  Building2,
} from "lucide-react";

export default function BrandForm({ initialData = null, isEdit = false, brandId = null }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    product_name: initialData?.product_name || "",
    product_description: initialData?.product_description || "",
    product_category: initialData?.product_category || "",
    target_audience: initialData?.target_audience || "",
    problem_solved: initialData?.problem_solved || "",
    brand_tone: initialData?.brand_tone || [],
    website_url: initialData?.website_url || "",
    additional_context: initialData?.additional_context || "",
    is_default: initialData?.is_default || false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleTone = (tone) => {
    setFormData((prev) => {
      const current = prev.brand_tone || [];
      let updated;
      if (current.includes(tone)) {
        updated = current.filter((t) => t !== tone);
      } else {
        if (current.length >= 3) {
          return prev;
        }
        updated = [...current, tone];
      }
      return { ...prev, brand_tone: updated };
    });

    if (errors.brand_tone) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.brand_tone;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateBrandInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErrorKey = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(`field-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/brands/${brandId}` : "/api/brands";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.error?.fields) {
          setErrors(result.error.fields);
        }
        setServerError(result.error?.message || "تعذر حفظ البراند. يرجى المحاولة مرة أخرى.");
        setIsSubmitting(false);
        return;
      }

      router.push("/brands");
    } catch (err) {
      console.error("Brand save error:", err);
      setServerError("حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك والمحاولة مجدداً.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لملفات البراند</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>ذاكرة البراند الذكية</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        {/* Intro */}
        <div className="mb-10 text-right">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            {isEdit ? "تعديل ملف البراند المحفوظ" : "إنشاء ملف براند جديد"}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
            احفظ معلومات منتجك وهويته التسويقية هنا، وسيتم استيرادها تلقائياً عند إنشاء أي خطة محتوى جديدة.
          </p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mb-8 p-4 rounded-xl bg-zinc-900 border border-red-800 text-red-200 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-zinc-100">تعذر حفظ البراند</p>
              <p className="mt-0.5 text-xs text-red-300">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-right">
          {/* Default Brand Profile Option */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-blue-400" />
                <span>تعيين كبراند افتراضي لحسابك</span>
              </span>
              <p className="text-xs text-zinc-400">
                سيتم اختيار هذا البراند تلقائياً عند فتح نموذج إنشاء خطة جديدة.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => handleInputChange("is_default", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 border border-zinc-800"></div>
            </label>
          </div>

          {/* Section 1: Brand Name & Product Info */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">1. اسم البراند والمنتج</h2>
                <p className="text-xs text-zinc-400">المسميات التعريفية للبراند والمنتج الأساسي</p>
              </div>
            </div>

            {/* Field: Brand Profile Name */}
            <div id="field-name" className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                عنوان ملف البراند <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="مثال: متجر عطور الفخامة / تطبيق ZenFlow"
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.name ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.name && <p className="text-xs text-red-400 font-medium">{errors.name}</p>}
            </div>

            {/* Field: Product Name */}
            <div id="field-product_name" className="space-y-1.5">
              <label htmlFor="product_name" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                اسم المنتج / الخدمة الرئيسية <span className="text-red-400">*</span>
              </label>
              <input
                id="product_name"
                type="text"
                value={formData.product_name}
                onChange={(e) => handleInputChange("product_name", e.target.value)}
                placeholder="اسم المنتج المحدد الذي ستستهدفه الخطط التسويقية"
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.product_name ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.product_name && <p className="text-xs text-red-400 font-medium">{errors.product_name}</p>}
            </div>

            {/* Field: Product Category */}
            <div id="field-product_category" className="space-y-1.5">
              <label htmlFor="product_category" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                فئة وتصنيف المنتج <span className="text-red-400">*</span>
              </label>
              <select
                id="product_category"
                value={formData.product_category}
                onChange={(e) => handleInputChange("product_category", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 focus:outline-none transition-colors ${
                  errors.product_category ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              >
                <option value="" disabled>
                  اختر تصنيف المنتج...
                </option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.product_category && <p className="text-xs text-red-400 font-medium">{errors.product_category}</p>}
            </div>

            {/* Field: Product Description */}
            <div id="field-product_description" className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="product_description" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  وصف المنتج ومزاياه <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-zinc-500">{formData.product_description.length} / 2000</span>
              </div>
              <textarea
                id="product_description"
                rows={4}
                value={formData.product_description}
                onChange={(e) => handleInputChange("product_description", e.target.value)}
                placeholder="اشرح ما هو منتجك، كيف يعمل، أهم الميزات والخصائص الفريدة..."
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.product_description ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.product_description && <p className="text-xs text-red-400 font-medium">{errors.product_description}</p>}
            </div>
          </div>

          {/* Section 2: Audience & Problem Solved */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">2. الجمهور المستهدف والمشكلة المحورية</h2>
                <p className="text-xs text-zinc-400">فهم العميل والمشكلة الأساسية التي يحلها المنتج</p>
              </div>
            </div>

            {/* Field: Target Audience */}
            <div id="field-target_audience" className="space-y-1.5">
              <label htmlFor="target_audience" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                الجمهور المستهدف <span className="text-red-400">*</span>
              </label>
              <textarea
                id="target_audience"
                rows={3}
                value={formData.target_audience}
                onChange={(e) => handleInputChange("target_audience", e.target.value)}
                placeholder="تفاصيل الشريحة المستهدفة، أعمارهم، واهتماماتهم..."
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.target_audience ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.target_audience && <p className="text-xs text-red-400 font-medium">{errors.target_audience}</p>}
            </div>

            {/* Field: Problem Solved */}
            <div id="field-problem_solved" className="space-y-1.5">
              <label htmlFor="problem_solved" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                المشكلة التي يحلها المنتج <span className="text-red-400">*</span>
              </label>
              <textarea
                id="problem_solved"
                rows={3}
                value={formData.problem_solved}
                onChange={(e) => handleInputChange("problem_solved", e.target.value)}
                placeholder="ما هي عقبة العميل والمشكلة الحقيقية التي يقدم المنتج حلاً لها؟"
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.problem_solved ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.problem_solved && <p className="text-xs text-red-400 font-medium">{errors.problem_solved}</p>}
            </div>
          </div>

          {/* Section 3: Brand Tone & Context */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">3. نبرة صوت البراند والموقع الإلكتروني</h2>
                <p className="text-xs text-zinc-400">شخصية البراند في الخطاب والتسويق</p>
              </div>
            </div>

            {/* Field: Brand Tone */}
            <div id="field-brand_tone" className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  نبرة صوت البراند (اختر حتى 3) <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-blue-400 font-bold">
                  تم اختيار {formData.brand_tone.length} من 3
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BRAND_TONES.map((tone) => {
                  const isSelected = formData.brand_tone.includes(tone);
                  const isLimitReached = formData.brand_tone.length >= 3 && !isSelected;

                  return (
                    <button
                      key={tone}
                      type="button"
                      disabled={isLimitReached}
                      onClick={() => toggleTone(tone)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                          : isLimitReached
                          ? "bg-zinc-950/40 border-zinc-800/40 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
                      }`}
                    >
                      <span>{tone}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {errors.brand_tone && <p className="text-xs text-red-400 font-medium">{errors.brand_tone}</p>}
            </div>

            {/* Field: Website URL */}
            <div id="field-website_url" className="space-y-1.5">
              <label htmlFor="website_url" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                رابط المتجر أو الموقع الإلكتروني <span className="text-zinc-500 font-normal">(اختياري)</span>
              </label>
              <input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => handleInputChange("website_url", e.target.value)}
                placeholder="https://yourbrand.com"
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.website_url ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.website_url && <p className="text-xs text-red-400 font-medium">{errors.website_url}</p>}
            </div>

            {/* Field: Additional Context */}
            <div id="field-additional_context" className="space-y-1.5">
              <label htmlFor="additional_context" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                ملاحظات أو سياق إضافي للبراند <span className="text-zinc-500 font-normal">(اختياري)</span>
              </label>
              <textarea
                id="additional_context"
                rows={3}
                value={formData.additional_context}
                onChange={(e) => handleInputChange("additional_context", e.target.value)}
                placeholder="أي قصة، عروض ثابتة، أو تعليمات دائمة لـ AI عند بناء الخطط لهذه الماركة..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري حفظ ملف البراند...</span>
                </>
              ) : (
                <>
                  <span>{isEdit ? "حفظ التعديلات" : "حفظ ملف البراند الجديد"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
