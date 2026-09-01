"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PRODUCT_CATEGORIES,
  MARKETING_OBJECTIVES,
  BRAND_TONES,
  validatePlanInput,
} from "@/lib/validations/plan";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Layers,
  Target,
  Flame,
  Building2,
  RotateCcw,
  Plus,
} from "lucide-react";
import { pingBackendHealth } from "@/lib/backend-health";

function PlanFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryBrandId = searchParams.get("brandId");

  useEffect(() => {
    pingBackendHealth();
  }, []);

  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [loadingBrands, setLoadingBrands] = useState(true);

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

  // Fetch user's saved brand profiles
  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch("/api/brands");
        const json = await res.json();
        if (json.success && json.data) {
          setBrands(json.data);

          const targetBrand = queryBrandId
            ? json.data.find((b) => b.id === queryBrandId)
            : json.data.find((b) => b.is_default);

          if (targetBrand) {
            applyBrandToForm(targetBrand);
          }
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
      } finally {
        setLoadingBrands(false);
      }
    }
    loadBrands();
  }, [queryBrandId]);

  const applyBrandToForm = (brand) => {
    setSelectedBrandId(brand.id);
    setFormData((prev) => ({
      ...prev,
      product_name: brand.product_name || "",
      product_description: brand.product_description || "",
      product_category: brand.product_category || "",
      target_audience: brand.target_audience || "",
      problem_solved: brand.problem_solved || "",
      brand_tone: brand.brand_tone || [],
      website_url: brand.website_url || "",
      additional_context: brand.additional_context || "",
    }));
    setErrors({});
  };

  const handleBrandSelect = (e) => {
    const bId = e.target.value;
    if (!bId) {
      setSelectedBrandId("");
      return;
    }
    const brand = brands.find((b) => b.id === bId);
    if (brand) {
      applyBrandToForm(brand);
    }
  };

  const handleClearBrand = () => {
    setSelectedBrandId("");
    setFormData({
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
  };

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

    const validation = validatePlanInput(formData);
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
      const payload = {
        ...formData,
        brand_profile_id: selectedBrandId || null,
      };

      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

      const planId = result.data.planId;
      router.push(`/plans/${planId}`);
    } catch (err) {
      console.error("Submission error:", err);
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
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحة التحكم</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-bold">
            <span>مخطط استراتيجية 30 يوماً</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        {/* Intro */}
        <div className="mb-10 text-right">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">إنشاء خطة تسويقية جديدة</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
            أدخل تفاصيل منتجك بدقة. سيقوم المحرك بتحليل جمهورك، تحديد التموضع، ابتكار محاور المحتوى، وبناء جدول منشورات إنستغرام لشهر كامل وتصديره لـ Google Sheets.
          </p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mb-8 p-4 rounded-xl bg-zinc-900 border border-red-800 text-red-200 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-zinc-100">تعذر بدء إنشاء الخطة</p>
              <p className="mt-0.5 text-xs text-red-300">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-right">
          {/* Brand Profile Selector Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <span>ذاكرة البراند الذكية</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/60 font-extrabold">
                      تعبئة فورية
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">اختر ملف براند محفوظ لتعبئة بيانات المنتج تلقائياً</p>
                </div>
              </div>

              <Link
                href="/brands/new"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold self-start sm:self-auto hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة براند جديد</span>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <select
                  value={selectedBrandId}
                  onChange={handleBrandSelect}
                  disabled={loadingBrands || brands.length === 0}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                >
                  <option value="">
                    {loadingBrands
                      ? "جاري تحميل البراندات المحفوظة..."
                      : brands.length === 0
                      ? "لا توجد ملفات براند محفوظة (إدخال يدوي)"
                      : "-- اختر ملف براند لتعبئة النموذج تلقائياً --"}
                  </option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id} className="bg-zinc-900 text-zinc-100">
                      {brand.name} ({brand.product_name}) {brand.is_default ? "★ افتراضي" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBrandId && (
                <button
                  type="button"
                  onClick={handleClearBrand}
                  className="inline-flex items-center gap-1.5 px-3 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  title="تفريغ الحقول والبدء يدوياً"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تفريغ</span>
                </button>
              )}
            </div>

            {selectedBrandId && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم استيراد بيانات البراند تلقائياً! يمكنك تعديل أي حقل واختيار الهدف التسويقي أدناه.</span>
              </div>
            )}
          </div>

          {/* Section 1: Product Identity */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">1. هوية المنتج والتصنيف</h2>
                <p className="text-xs text-zinc-400">التفاصيل الأساسية لما تقوم بتسويقه وبيعه</p>
              </div>
            </div>

            {/* Field 1: Product Name */}
            <div id="field-product_name" className="space-y-1.5">
              <label htmlFor="product_name" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                اسم المنتج / البراند <span className="text-red-400">*</span>
              </label>
              <input
                id="product_name"
                type="text"
                value={formData.product_name}
                onChange={(e) => handleInputChange("product_name", e.target.value)}
                placeholder="مثال: صانعة القهوة الذكية ZenFlow أو استوديو التصميم الرقمي"
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.product_name ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.product_name && <p className="text-xs text-red-400 font-medium">{errors.product_name}</p>}
            </div>

            {/* Field 2: Product Category */}
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

            {/* Field 3: Product Description */}
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
                placeholder="اشرح ما هو منتجك، كيف يعمل، أهم الميزات والخصائص الفريدة التي تجعله خياراً لا غنى عنه..."
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.product_description ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.product_description && <p className="text-xs text-red-400 font-medium">{errors.product_description}</p>}
            </div>
          </div>

          {/* Section 2: Audience & Value Proposition */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">2. الجمهور المستهدف والمشكلة المحورية</h2>
                <p className="text-xs text-zinc-400">فهم عميق لنفسية العميل لبناء زوايا إقناع قوية</p>
              </div>
            </div>

            {/* Field 4: Target Audience */}
            <div id="field-target_audience" className="space-y-1.5">
              <label htmlFor="target_audience" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                الجمهور المستهدف <span className="text-red-400">*</span>
              </label>
              <textarea
                id="target_audience"
                rows={3}
                value={formData.target_audience}
                onChange={(e) => handleInputChange("target_audience", e.target.value)}
                placeholder="مثال: مبرمجون ورواد أعمال يعملون عن بُعد وتتراوح أعمارهم بين 24-38 عاماً ويبحثون عن زيادة التركيز..."
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.target_audience ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.target_audience && <p className="text-xs text-red-400 font-medium">{errors.target_audience}</p>}
            </div>

            {/* Field 5: Problem It Solves */}
            <div id="field-problem_solved" className="space-y-1.5">
              <label htmlFor="problem_solved" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                المشكلة التي يحلها المنتج <span className="text-red-400">*</span>
              </label>
              <textarea
                id="problem_solved"
                rows={3}
                value={formData.problem_solved}
                onChange={(e) => handleInputChange("problem_solved", e.target.value)}
                placeholder="ما هي العقبة المزعجة أو التحدي الذي يعاني منه العميل حالياً؟"
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
                  errors.problem_solved ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
                }`}
              />
              {errors.problem_solved && <p className="text-xs text-red-400 font-medium">{errors.problem_solved}</p>}
            </div>
          </div>

          {/* Section 3: Strategy & Brand Tone */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-pink-600/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">3. الهدف التسويقي ونبرة البراند</h2>
                <p className="text-xs text-zinc-400">توجيه صياغة الكابشن والنسب المئوية لنوعية المنشورات</p>
              </div>
            </div>

            {/* Field 6: Marketing Objective */}
            <div id="field-marketing_objective" className="space-y-1.5">
              <label htmlFor="marketing_objective" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                الهدف التسويقي الأساسي لهذا الشهر <span className="text-red-400">*</span>
              </label>
              <select
                id="marketing_objective"
                value={formData.marketing_objective}
                onChange={(e) => handleInputChange("marketing_objective", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-zinc-100 focus:outline-none transition-colors ${
                  errors.marketing_objective ? "border-red-500" : "border-zinc-800 focus:border-blue-500"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  نبرة صوت البراند (Brand Tone) <span className="text-red-400">*</span>
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
          </div>

          {/* Section 4: Optional Context */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">4. الروابط والملاحظات الإضافية</h2>
                <p className="text-xs text-zinc-400">تفاصيل إضافية لتخصيص روابط الدعوة لاتخاذ إجراء (CTA) والعروض</p>
              </div>
            </div>

            {/* Field 8: Website URL */}
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

            {/* Field 9: Additional Context */}
            <div id="field-additional_context" className="space-y-1.5">
              <label htmlFor="additional_context" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                عروض خاصة أو ملاحظات إضافية <span className="text-zinc-500 font-normal">(اختياري)</span>
              </label>
              <textarea
                id="additional_context"
                rows={3}
                value={formData.additional_context}
                onChange={(e) => handleInputChange("additional_context", e.target.value)}
                placeholder="مثال: خصم 20% بمناسبة الإطلاق مع كود LAUNCH20، التركيز على موسم الصيف..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري بناء الاستراتيجية والتقويم...</span>
                </>
              ) : (
                <>
                  <span>توليد خطة التسويق لـ 30 يوماً</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-zinc-500 mt-3">
              تستغرق عملية التحليل وبناء المحتوى وتصدير ملف Google Sheet من 60 إلى 90 ثانية تقريباً.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <PlanFormContent />
    </Suspense>
  );
}
