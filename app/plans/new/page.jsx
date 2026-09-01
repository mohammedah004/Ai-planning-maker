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
  Sparkles,
  Building2,
  RotateCcw,
  Plus,
  Compass,
  Lightbulb,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";
import { pingBackendHealth } from "@/lib/backend-health";
import AppShell from "@/app/components/shell/AppShell";
import PageHeader from "@/app/components/shell/PageHeader";
import Button from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Select from "@/app/components/ui/Select";

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

          // If URL has ?brandId=, automatically select and fill
          if (queryBrandId) {
            const matched = json.data.find((b) => b.id === queryBrandId);
            if (matched) {
              applyBrandToForm(matched);
            }
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
      brand_tone: Array.isArray(brand.brand_tone) ? brand.brand_tone : [],
      website_url: brand.website_url || "",
      additional_context: brand.additional_context || "",
    }));
    setErrors({});
  };

  const handleBrandSelect = (e) => {
    const bId = e.target.value;
    if (!bId) {
      handleClearBrand();
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
    if (isSubmitting) return; // Prevent double submission
    setServerError(null);

    const validation = validatePlanInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErrorKey = Object.keys(validation.errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          brand_profile_id: selectedBrandId || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg =
          json.error?.details?.[0]?.message ||
          json.error?.message ||
          "حدث خطأ أثناء إرسال النموذج. يرجى مراجعة الحقول والمحاولة مجدداً.";
        setServerError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const planId = json.data?.planId || json.data?.id;
      router.push(`/plans/${planId}`);
    } catch (err) {
      console.error("Submission error:", err);
      setServerError("حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك والمحاولة مجدداً.");
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell brandCount={brands.length}>
      <div className="w-full space-y-8 text-right">
        {/* Contextual Header */}
        <PageHeader
          backHref="/dashboard"
          backLabel="العودة للوحة التحكم"
          title="استوديو البريف الاستراتيجي"
          description="زوّد المحرك الذكي بتفاصيل منتجك وجمهورك لبناء استراتيجية تموضع وتشخيص دقيق، وتوليد تقويم محتوى كامل لـ 30 يوماً وتصديره لـ Google Sheets."
          badge={<Badge variant="blue">محرك التخطيط لـ 30 يوماً</Badge>}
        />

        {/* Global Error Banner */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-200 flex items-start gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-zinc-100">تعذر بدء إنشاء الخطة</p>
              <p className="text-red-300 leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Briefing Form (8 cols on desktop) */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8 text-right">
            {/* Brand Memory Anchor */}
            <Card padding="md" className="space-y-4 border-zinc-800/80 bg-[#131316]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <span>ذاكرة البراند الذكية</span>
                      <Badge variant="blue" size="sm">تعبئة فورية</Badge>
                    </h3>
                    <p className="text-[11px] text-zinc-400">استورد بيانات منتج محفوظ لتسريع التخطيط</p>
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
                <div className="flex-1 w-full">
                  <Select
                    id="brand_selector"
                    value={selectedBrandId}
                    onChange={handleBrandSelect}
                    disabled={loadingBrands || brands.length === 0}
                    placeholder={
                      loadingBrands
                        ? "جاري تحميل البراندات المحفوظة..."
                        : brands.length === 0
                        ? "لا توجد ملفات براند محفوظة (إدخال يدوي)"
                        : "اختر ملف براند لتعبئة النموذج تلقائياً..."
                    }
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id} className="bg-zinc-900 text-zinc-100">
                        {brand.name} ({brand.product_name}) {brand.is_default ? "★ افتراضي" : ""}
                      </option>
                    ))}
                  </Select>
                </div>

                {selectedBrandId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleClearBrand}
                    startIcon={RotateCcw}
                    title="تفريغ الحقول والبدء يدوياً"
                  >
                    تفريغ
                  </Button>
                )}
              </div>

              {selectedBrandId && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/50 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>تم استيراد بيانات البراند تلقائياً. يمكنك تعديل أي تفاصيل أو اختيار هدف هذا الشهر أدناه.</span>
                </div>
              )}
            </Card>

            {/* Station 1: Product & Value Proposition */}
            <Card padding="lg" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-zinc-100">هوية المنتج والحل الجوهري</h2>
                  <p className="text-xs text-zinc-400">التفاصيل الأساسية لما تقوم بتسويقه وبيعه</p>
                </div>
              </div>

              <div className="space-y-5">
                <Input
                  id="product_name"
                  label="اسم المنتج أو الخدمة"
                  required={true}
                  value={formData.product_name}
                  onChange={(e) => handleInputChange("product_name", e.target.value)}
                  placeholder="مثال: تطبيق تنظيم الوقت الفردي ZenFlow أو استوديو التصميم الرقمي"
                  error={errors.product_name}
                  helperText="الاسم التجاري الذي سيظهر في الكابشن والخطط"
                />

                <Select
                  id="product_category"
                  label="فئة وتصنيف المنتج"
                  required={true}
                  value={formData.product_category}
                  onChange={(e) => handleInputChange("product_category", e.target.value)}
                  options={PRODUCT_CATEGORIES}
                  placeholder="اختر تصنيف المنتج..."
                  error={errors.product_category}
                />

                <Textarea
                  id="product_description"
                  label="وصف المنتج ومزاياه التنافسية"
                  required={true}
                  rows={4}
                  maxLength={2000}
                  value={formData.product_description}
                  onChange={(e) => handleInputChange("product_description", e.target.value)}
                  placeholder="اشرح ما هو منتجك، كيف يعمل، وأهم الميزات والخصائص الفريدة التي تجعله خياراً لا غنى عنه..."
                  error={errors.product_description}
                  helperText="كلما كان الوصف دقيقاً، كانت الأفكار والزوايا الإعلانية أكثر إقناعاً."
                />

                <Textarea
                  id="problem_solved"
                  label="المشكلة أو العقبة التي يحلها المنتج"
                  required={true}
                  rows={3}
                  maxLength={1000}
                  value={formData.problem_solved}
                  onChange={(e) => handleInputChange("problem_solved", e.target.value)}
                  placeholder="ما هي الفجوة أو المعاناة التي يعاني منها عميلك قبل استخدام هذا المنتج؟"
                  error={errors.problem_solved}
                  helperText="يستخدم المحرك هذه المشكلة لصياغة هوكات (Hooks) قوية ومقنعة للريلز."
                />
              </div>
            </Card>

            {/* Station 2: Audience & Monthly Objective */}
            <Card padding="lg" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80">
                <div className="w-8 h-8 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-zinc-100">الجمهور والهدف التسويقي</h2>
                  <p className="text-xs text-zinc-400">فهم عميق لنفسية المشتري وتحديد بوصلة الشهر</p>
                </div>
              </div>

              <div className="space-y-5">
                <Textarea
                  id="target_audience"
                  label="الجمهور المستهدف ونفسية الشراء"
                  required={true}
                  rows={3}
                  maxLength={1000}
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange("target_audience", e.target.value)}
                  placeholder="مثال: رواد أعمال ومستقلون تتراوح أعمارهم بين 24-38 عاماً يبحثون عن حلول سريعة لزيادة المبيعات..."
                  error={errors.target_audience}
                />

                <Select
                  id="marketing_objective"
                  label="الهدف التسويقي الأساسي لخطة هذا الشهر"
                  required={true}
                  value={formData.marketing_objective}
                  onChange={(e) => handleInputChange("marketing_objective", e.target.value)}
                  placeholder="اختر الهدف التسويقي..."
                  error={errors.marketing_objective}
                  helperText="يحدد هذا الخيار نسب توزيع المحتوى بين التوعية، التعليم، الإثبات الاجتماعي، والمبيعات."
                >
                  {MARKETING_OBJECTIVES.map((obj) => (
                    <option key={obj.value} value={obj.value} className="bg-zinc-900 text-zinc-100">
                      {obj.label}
                    </option>
                  ))}
                </Select>
              </div>
            </Card>

            {/* Station 3: Brand Voice & Delivery Tone */}
            <Card padding="lg" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80">
                <div className="w-8 h-8 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-zinc-100">نبرة صوت المحتوى (Brand Tone)</h2>
                  <p className="text-xs text-zinc-400">اختر من 1 إلى 3 نبرات لتوجيه صياغة الكابشن والسيناريو</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">النبرات المتاحة</span>
                  <span className="text-xs text-blue-400 font-bold tabular-nums">
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
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/30"
                            : isLimitReached
                            ? "bg-zinc-950/40 border-zinc-850 text-zinc-600 cursor-not-allowed opacity-50"
                            : "bg-[#09090b] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
                        }`}
                      >
                        <span>{tone}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {errors.brand_tone && <p className="text-xs text-red-400 font-bold">{errors.brand_tone}</p>}
              </div>
            </Card>

            {/* Station 4: Tactical Context & Links */}
            <Card padding="lg" className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-zinc-100">الملاحظات التكتيكية وتوجيهات الـ CTA</h2>
                  <p className="text-xs text-zinc-400">تفاصيل إضافية لتخصيص الدعوة لاتخاذ إجراء والعروض الموسمية (اختياري)</p>
                </div>
              </div>

              <div className="space-y-5">
                <Input
                  id="website_url"
                  label="رابط المتجر أو الموقع الإلكتروني"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange("website_url", e.target.value)}
                  placeholder="https://yourbrand.com"
                  error={errors.website_url}
                  helperText="يستخدم لإدراج روابط موجهة في نصوص الستوري والبايو."
                />

                <Textarea
                  id="additional_context"
                  label="عروض خاصة، أكواد خصم، أو مواسم مستهدفة"
                  rows={3}
                  maxLength={2000}
                  value={formData.additional_context}
                  onChange={(e) => handleInputChange("additional_context", e.target.value)}
                  placeholder="مثال: خصم 20% بمناسبة الإطلاق بكود LAUNCH20، التركيز على بداية العام، استبعاد ذكر المنافسين..."
                  error={errors.additional_context}
                  helperText="أي قيود أو تفاصيل تكتيكية تود أن يلتزم بها المحرك."
                />
              </div>
            </Card>

            {/* Submit Action Card */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth={true}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                startIcon={Sparkles}
                className="py-4 text-sm sm:text-base font-extrabold"
              >
                {isSubmitting ? "جاري إعداد محرك التوليد والربط..." : "توليد خطة واستراتيجية الـ 30 يوماً"}
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-3 leading-relaxed">
                تستغرق عملية التحليل وبناء الاستراتيجية وتنسيق تقويم الـ 30 يوماً وتصدير Google Sheet من 60 إلى 90 ثانية.
              </p>
            </div>
          </form>

          {/* Strategic Guidance Sidebar (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-5 sticky top-6 hidden lg:block">
            <Card padding="md" className="space-y-4 bg-[#0d0d10] border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-extrabold text-blue-400">
                <Compass className="w-4 h-4" />
                <span>كيف يعمل المحرك الاستراتيجي؟</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                لا يقوم المحرك بتوليد نصوص عشوائية، بل يعالج هذا البريف عبر 4 مراحل هندسية متتالية:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                  <div className="text-xs font-bold text-zinc-200">1. التشخيص وتحديد التموضع</div>
                  <div className="text-[11px] text-zinc-400">تحليل مرحلة نضج المنتج وصياغة زوايا الإقناع الفريدة.</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                  <div className="text-xs font-bold text-zinc-200">2. هندسة محاور المحتوى</div>
                  <div className="text-[11px] text-zinc-400">موازنة نسب التوعية والتعليم والتفاعل والتحويل المباشر.</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                  <div className="text-xs font-bold text-zinc-200">3. تقويم الـ 30 يوماً والمخرج البصري</div>
                  <div className="text-[11px] text-zinc-400">صياغة كابشن كامل مع توجيهات التصميم وسيناريو الريلز.</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                  <div className="text-xs font-bold text-zinc-200">4. تصدير Google Sheet المعتمد</div>
                  <div className="text-[11px] text-zinc-400">ملف جداول منظم وجاهز للتسليم لفريق التنفيذ أو العميل.</div>
                </div>
              </div>
            </Card>

            <Card padding="md" className="bg-zinc-900/30 border-zinc-800/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Lightbulb className="w-4 h-4" />
                <span>نصيحة لصياغة بريف فعال</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                ركّز في خانة <strong className="text-zinc-200">المشكلة التي يحلها المنتج</strong> على مشاعر الإحباط أو الهدر التي يشعر بها العميل؛ حيث تُنتج هذه المدخلات أقوى خطافات (Hooks) للريلز في الأسابيع الأولى.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function NewPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-100">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <PlanFormContent />
    </Suspense>
  );
}
