"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PRODUCT_CATEGORIES,
  MARKETING_OBJECTIVES,
  BRAND_TONES,
  validatePlanInput,
} from "@/lib/validations/plan";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Layers,
  Target,
  Flame,
} from "lucide-react";

export default function NewPlanPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_category: "",
    target_audience: "",
    problem_solved: "",
    marketing_objective: "",
    brand_tone: [],
    website_url: "",
    additional_context: "",
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
      const current = prev.brand_tone;
      let updated;
      if (current.includes(tone)) {
        updated = current.filter((t) => t !== tone);
      } else {
        if (current.length >= 3) {
          return prev; // Max 3
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

    // 1. Client-side validation
    const validation = validatePlanInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(`field-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // 2. Submit to API
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.error?.fields) {
          setErrors(result.error.fields);
        }
        setServerError(result.error?.message || "تعذر بدء إنشاء الخطة. يرجى المحاولة مرة أخرى.");
        setIsSubmitting(false);
        return;
      }

      // Success -> Redirect to plan status/progress page
      const planId = result.data.planId;
      router.push(`/plans/${planId}`);
    } catch (err) {
      console.error("Submission error:", err);
      setServerError("حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك والمحاولة مجدداً.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحة التحكم</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مخطط استراتيجية 30 يوماً</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        {/* Intro */}
        <div className="mb-10 text-right">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">إنشاء خطة تسويقية جديدة</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            أدخل تفاصيل منتجك بدقة. سيقوم محرك الذكاء الاصطناعي بتحليل جمهورك، تحديد التموضع، ابتكار محاور المحتوى، وبناء جدول منشورات إنستغرام لشهر كامل وتصديره لـ Google Sheets.
          </p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mb-8 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-3 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-100">تعذر بدء إنشاء الخطة</p>
              <p className="mt-0.5 text-xs text-red-300">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-right">
          {/* Section 1: Product Identity */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">1. هوية المنتج والتصنيف</h2>
                <p className="text-xs text-slate-400">التفاصيل الأساسية لما تقوم بتسويقه وبيعه</p>
              </div>
            </div>

            {/* Field 1: Product Name */}
            <div id="field-product_name" className="space-y-1.5">
              <label htmlFor="product_name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                اسم المنتج / البراند <span className="text-red-400">*</span>
              </label>
              <input
                id="product_name"
                type="text"
                value={formData.product_name}
                onChange={(e) => handleInputChange("product_name", e.target.value)}
                placeholder="مثال: صانعة القهوة الذكية ZenFlow أو استوديو التصميم الرقمي"
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.product_name ? "border-red-500 ring-1 ring-red-500" : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {errors.product_name && <p className="text-xs text-red-400 font-medium">{errors.product_name}</p>}
            </div>

            {/* Field 2: Product Category */}
            <div id="field-product_category" className="space-y-1.5">
              <label htmlFor="product_category" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                فئة وتصنيف المنتج <span className="text-red-400">*</span>
              </label>
              <select
                id="product_category"
                value={formData.product_category}
                onChange={(e) => handleInputChange("product_category", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.product_category ? "border-red-500 ring-1 ring-red-500" : "border-slate-800 focus:border-indigo-500"
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

            {/* Field 3: Product Description */}
            <div id="field-product_description" className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="product_description" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  وصف المنتج ومزاياه <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">{formData.product_description.length} / 2000</span>
              </div>
              <textarea
                id="product_description"
                rows={4}
                value={formData.product_description}
                onChange={(e) => handleInputChange("product_description", e.target.value)}
                placeholder="اشرح ما هو منتجك، كيف يعمل، أهم الميزات والخصائص الفريدة التي تجعله خياراً لا غنى عنه..."
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.product_description ? "border-red-500 ring-1 ring-red-500" : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {errors.product_description && <p className="text-xs text-red-400 font-medium">{errors.product_description}</p>}
            </div>
          </div>

          {/* Section 2: Audience & Value Proposition */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">2. الجمهور المستهدف والمشكلة المحورية</h2>
                <p className="text-xs text-slate-400">فهم عميق لنفسية العميل لبناء زوايا إقناع قوية</p>
              </div>
            </div>

            {/* Field 4: Target Audience */}
            <div id="field-target_audience" className="space-y-1.5">
              <label htmlFor="target_audience" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                الجمهور المستهدف <span className="text-red-400">*</span>
              </label>
              <textarea
                id="target_audience"
                rows={3}
                value={formData.target_audience}
                onChange={(e) => handleInputChange("target_audience", e.target.value)}
                placeholder="مثال: مبرمجون ورواد أعمال يعملون عن بُعد وتتراوح أعمارهم بين 24-38 عاماً ويبحثون عن زيادة التركيز وراحة الظهر في مكاتبهم المنزلية..."
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.target_audience ? "border-red-500 ring-1 ring-red-500" : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {errors.target_audience && <p className="text-xs text-red-400 font-medium">{errors.target_audience}</p>}
            </div>

            {/* Field 5: Problem It Solves */}
            <div id="field-problem_solved" className="space-y-1.5">
              <label htmlFor="problem_solved" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                المشكلة التي يحلها المنتج <span className="text-red-400">*</span>
              </label>
              <textarea
                id="problem_solved"
                rows={3}
                value={formData.problem_solved}
                onChange={(e) => handleInputChange("problem_solved", e.target.value)}
                placeholder="ما هي العقبة المزعجة أو التحدي الذي يعاني منه العميل حالياً؟ ولماذا لم تنجح الحلول الأخرى معه؟"
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.problem_solved ? "border-red-500 ring-1 ring-red-500" : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {errors.problem_solved && <p className="text-xs text-red-400 font-medium">{errors.problem_solved}</p>}
            </div>
          </div>

          {/* Section 3: Strategy & Brand Tone */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-pink-600/20 border border-pink-500/30 text-pink-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">3. الهدف التسويقي ونبرة البراند</h2>
                <p className="text-xs text-slate-400">توجيه صياغة الكابشن والنسب المئوية لنوعية المنشورات</p>
              </div>
            </div>

            {/* Field 6: Marketing Objective */}
            <div id="field-marketing_objective" className="space-y-1.5">
              <label htmlFor="marketing_objective" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                الهدف التسويقي الأساسي لهذا الشهر <span className="text-red-400">*</span>
              </label>
              <select
                id="marketing_objective"
                value={formData.marketing_objective}
                onChange={(e) => handleInputChange("marketing_objective", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.marketing_objective ? "border-red-500 ring-1 ring-red-500" : "border-slate-800 focus:border-indigo-500"
                }`}
              >
                <option value="" disabled>
                  اختر الهدف التسويقي...
                </option>
                {MARKETING_OBJECTIVES.map((obj) => (
                  <option key={obj.value} value={obj.value}>
                    {obj.label}
                  </option>
                ))}
              </select>
              {errors.marketing_objective && <p className="text-xs text-red-400 font-medium">{errors.marketing_objective}</p>}
            </div>

            {/* Field 7: Brand Tone (Multi-select, max 3) */}
            <div id="field-brand_tone" className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  نبرة صوت البراند (Brand Tone) <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-indigo-400 font-bold">
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
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                          : isLimitReached
                          ? "bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
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
          </div>

          {/* Section 4: Optional Context */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">4. الروابط والملاحظات الإضافية</h2>
                <p className="text-xs text-slate-400">تفاصيل إضافية لتخصيص روابط الدعوة لاتخاذ إجراء (CTA) والعروض</p>
              </div>
            </div>

            {/* Field 8: Website URL */}
            <div id="field-website_url" className="space-y-1.5">
              <label htmlFor="website_url" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                رابط المتجر أو الموقع الإلكتروني <span className="text-slate-500 font-normal">(اختياري)</span>
              </label>
              <input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => handleInputChange("website_url", e.target.value)}
                placeholder="https://yourbrand.com"
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.website_url ? "border-red-500 ring-1 ring-red-500" : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {errors.website_url && <p className="text-xs text-red-400 font-medium">{errors.website_url}</p>}
            </div>

            {/* Field 9: Additional Context */}
            <div id="field-additional_context" className="space-y-1.5">
              <label htmlFor="additional_context" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                عروض خاصة أو ملاحظات إضافية <span className="text-slate-500 font-normal">(اختياري)</span>
              </label>
              <textarea
                id="additional_context"
                rows={3}
                value={formData.additional_context}
                onChange={(e) => handleInputChange("additional_context", e.target.value)}
                placeholder="مثال: خصم 20% بمناسبة الإطلاق مع كود LAUNCH20، التركيز على موسم الصيف، قصة تأسيس المشروع..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تهيئة محرك الذكاء الاصطناعي وبناء الاستراتيجية...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>توليد خطة التسويق لـ 30 يوماً</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              تستغرق عملية التحليل وبناء المحتوى وتصدير ملف Google Sheet من 60 إلى 90 ثانية تقريباً.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
