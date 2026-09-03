"use client";

import {
  Sparkles,
  Target,
  AlertTriangle,
  Compass,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  Clock,
  Layers,
} from "lucide-react";

const MATURITY_CONFIG = {
  early_stage: {
    label: "مرحلة التأسيس والبداية (Early Stage)",
    badgeColor: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/80 dark:border-amber-800/80 dark:text-amber-300",
    iconColor: "text-amber-600 dark:text-amber-400",
    description: "التركيز على بناء الوعي الأولي، ترسيخ الهوية، واكتساب أول شريحة من المتابعين والعملاء المهتمين.",
  },
  growing: {
    label: "مرحلة النمو والتوسع (Growing / Scale)",
    badgeColor: "bg-blue-50 border-blue-200 text-[#0B57D0] dark:bg-blue-950/80 dark:border-blue-800/80 dark:text-blue-300",
    iconColor: "text-[#0B57D0] dark:text-blue-400",
    description: "التركيز على مضاعفة الانتشار، بناء مجتمع متفاعل، وتوسيع قاعدة التحويل والمبيعات المنتظمة.",
  },
  established: {
    label: "مرحلة الترسخ والنضج (Established Brand)",
    badgeColor: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/80 dark:border-emerald-800/80 dark:text-emerald-300",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    description: "التركيز على حماية الحصة السوقية، تعزيز الولاء، ورفع القيمة الدائمة للعميل (LTV).",
  },
};

export default function DiagnosisViewer({ strategy = {}, plan = {}, onSwitchTab }) {
  const diagnosis = strategy?.diagnosis;

  // Graceful fallback for legacy plans generated before Phase 1
  if (!diagnosis) {
    return (
      <div className="p-8 sm:p-10 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 text-center space-y-4 max-w-2xl mx-auto my-6 text-right shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Lightbulb className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">التشخيص الاستراتيجي الذكي (Phase 1)</h3>
        <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed max-w-lg mx-auto">
          تم توليد هذه الخطة بالإصدار السابق قبل تفعيل محرك التشخيص المعمق. الاستراتيجية الأساسية ومحاور المحتوى والتقويم متوفرة بالكامل في التبويبات المجاورة.
        </p>
        {onSwitchTab && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSwitchTab("strategy")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>استعراض ملخص الاستراتيجية والجمهور</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const maturityKey = (diagnosis.marketing_maturity || "early_stage").toLowerCase();
  const maturityInfo = MATURITY_CONFIG[maturityKey] || MATURITY_CONFIG.early_stage;
  const fitScore = Math.min(10, Math.max(1, parseInt(diagnosis.instagram_fit_score || 8, 10)));

  return (
    <div className="space-y-6 text-right">
      {/* 1. Executive Diagnosis & Maturity Hero Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#F8F9FB] to-white dark:from-zinc-900 dark:to-zinc-950 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E4E7EC] dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">التشخيص التسويقي ومرحلة النضج</h3>
                <p className="text-xs text-[#575C61] dark:text-zinc-400">تقييم الوضع الحالي للبزنس وجاهزيته للنمو على إنستقرام</p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${maturityInfo.badgeColor}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{maturityInfo.label}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Maturity Analysis */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#0B57D0] dark:text-blue-400" />
                <span>تحليل وتبرير مرحلة النضج:</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-950/60 p-4 rounded-xl border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
                {diagnosis.maturity_reasoning || maturityInfo.description}
              </p>
            </div>

            {/* Instagram Fit Score Gauge */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950/80 border border-[#E4E7EC] dark:border-zinc-800/80 flex flex-col justify-between space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#575C61] dark:text-zinc-400">ملاءمة منصة إنستغرام:</span>
                <span className="text-base font-black text-[#0B57D0] dark:text-blue-400">{fitScore} / 10</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0B57D0] to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(fitScore / 10) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-[#575C61] dark:text-zinc-400 leading-normal">
                {diagnosis.instagram_fit_reasoning || "إنستقرام منصة مثالية للمحتوى البصري والتفاعل المباشر مع هذا القطاع."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Strategic Priorities (3 cards) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1A1D1F] dark:text-zinc-300">
          <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>الأولويات الاستراتيجية القصوى خلال الـ 30 يوماً القادمة:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(diagnosis.top_priorities || [
            "بناء الوعي والتعريف بالقيمة الجوهرية للمنتج",
            "صناعة محتوى تفاعلي يعالج شكوك واعتراضات العميل",
            "توجيه المتابعين نحو روابط الشراء المباشرة",
          ]).map((priority, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-zinc-900/90 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-2 flex items-start gap-3 shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/80 dark:border-emerald-800/80 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-xs text-[#1A1D1F] dark:text-zinc-200 font-bold leading-relaxed">{priority}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Realistic Expectations & Strategic Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Realistic Expectations */}
        <div className="p-6 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B57D0] dark:text-blue-400">
            <Clock className="w-4 h-4" />
            <span>التوقعات الواقعية لما يمكن تحقيقه (30 يوماً):</span>
          </div>
          <p className="text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-950/50 p-4 rounded-xl border border-[#E4E7EC] dark:border-zinc-800/60 shadow-xs">
            {diagnosis.realistic_expectations ||
              "مع الالتزام بنشر الـ 30 يوماً والتفاعل مع التعليقات والرسائل، يتوقع تحسين معدل الوصول لغير المتابعين، وتكوين قاعدة صلبة من المتابعين المتفاعلين المؤهلين للتحويل التجاري."}
          </p>
        </div>

        {/* Strategic Assumptions */}
        <div className="p-6 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400">
            <Layers className="w-4 h-4" />
            <span>الافتراضات الاستراتيجية التي بنيت عليها الخطة:</span>
          </div>
          <ul className="space-y-2 text-xs text-[#1A1D1F] dark:text-zinc-300">
            {(diagnosis.strategic_assumptions || [
              "تواجد العميل المثالي بشكل نشط على منصة إنستقرام.",
              "القدرة على إنتاج صور وفيديوهات واضحة متناسقة مع التوجيه البصري المقترح.",
            ]).map((assumption, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white dark:bg-zinc-950/50 p-2.5 rounded-lg border border-[#E4E7EC] dark:border-zinc-800/60 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Strategic Risks & Challenges */}
      {Array.isArray(diagnosis.key_risks) && diagnosis.key_risks.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 dark:bg-zinc-900 dark:border-amber-900/40 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>المخاطر والتحديات الاستراتيجية الواجب الانتباه لها:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {diagnosis.key_risks.map((risk, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-200/90 flex items-start gap-2.5 text-xs leading-relaxed shadow-xs"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
