"use client";

import { useState } from "react";
import {
  Film,
  Layers,
  Image as ImageIcon,
  Zap,
  Copy,
  Check,
  Target,
  Palette,
  Megaphone,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Lightbulb,
  Compass,
} from "lucide-react";
import { getWhyThisPostExplanation } from "@/lib/content-insights";
import RegenerateModal from "./RegenerateModal";

const formatPostType = (type) => {
  switch (type?.toLowerCase()) {
    case "reel":
      return { label: "ريلز (Reel)", icon: Film, bg: "bg-purple-50 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-800/40", text: "text-purple-700 dark:text-purple-300" };
    case "carousel":
      return { label: "كاروسيل (Carousel)", icon: Layers, bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800/40", text: "text-blue-700 dark:text-blue-300" };
    case "static_post":
      return { label: "منشور ثابت (Post)", icon: ImageIcon, bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/40", text: "text-emerald-700 dark:text-emerald-300" };
    case "story":
      return { label: "ستوري (Story)", icon: Zap, bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800/40", text: "text-amber-800 dark:text-amber-300" };
    default:
      return { label: type || "منشور", icon: Layers, bg: "bg-slate-100 dark:bg-zinc-800/60", border: "border-slate-200 dark:border-zinc-700/60", text: "text-slate-700 dark:text-zinc-300" };
  }
};

const formatObjective = (obj) => {
  const map = {
    awareness: "توعية وجذب",
    education: "تعليم وقيمة",
    engagement: "تفاعل ومجتمع",
    trust: "بناء ثقة ومصداقية",
    social_proof: "إثبات اجتماعي",
    objection_handling: "تفنيد الاعتراضات",
    conversion: "تحويل ومبيعات",
  };
  return map[obj?.toLowerCase()] || obj || "عام";
};

export default function ContentItemCard({ item, planId, strategy = {}, onUpdate = null, readOnly = false }) {
  const [copied, setCopied] = useState(false);
  const [showWhyThisPost, setShowWhyThisPost] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);

  const postTypeInfo = formatPostType(item.postType);
  const PostIcon = postTypeInfo.icon;

  const handleCopyCaption = () => {
    if (!item.caption) return;
    navigator.clipboard.writeText(item.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateSuccess = (updatedItem) => {
    setRecentlyUpdated(true);
    if (onUpdate) {
      onUpdate(updatedItem);
    }
    setTimeout(() => setRecentlyUpdated(false), 4000);
  };

  const designCopy = item.designCopy || {};
  const hasDesignCopy = Boolean(designCopy.headline || designCopy.subtext || designCopy.cta);

  const whyExplanation = getWhyThisPostExplanation(item, strategy);

  return (
    <>
      <div
        id={`day-${item.dayNumber}`}
        className={`p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border transition-all text-right space-y-6 shadow-xs ${
          recentlyUpdated
            ? "border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-50/30 dark:bg-zinc-900"
            : "border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700"
        }`}
      >
        {/* 1. Header Meta Bar: Day badge, Type badge, Objective, Pillar, Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Day Badge */}
            <span className="px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-extrabold text-xs shadow-xs">
              اليوم {item.dayNumber}
            </span>

            {/* Post Type Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${postTypeInfo.bg} ${postTypeInfo.border} ${postTypeInfo.text}`}>
              <PostIcon className="w-3.5 h-3.5" />
              <span>{postTypeInfo.label}</span>
            </span>

            {/* Objective Badge */}
            <span className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium shadow-xs">
              {formatObjective(item.contentObjective)}
            </span>

            {/* Recently Updated Badge */}
            {recentlyUpdated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 text-xs font-bold animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>تم التحديث!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Pillar Tag */}
            {item.contentPillar && (
              <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 font-semibold bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 px-3 py-1 rounded-xl shadow-xs">
                <Target className="w-3 h-3" />
                <span className="truncate max-w-[180px]">{item.contentPillar}</span>
              </div>
            )}

            {/* AI Regenerate Button */}
            {!readOnly && planId && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-50/80 hover:bg-violet-100/80 border border-violet-200 text-violet-700 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 dark:border-violet-800/60 dark:text-violet-300 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="إعادة صياغة المنشور بذكاء"
              >
                <RefreshCw className="w-3 h-3" />
                <span>تعديل بـ AI</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Main Caption Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              نص المنشور (الكابشن)
            </span>
            <button
              type="button"
              onClick={handleCopyCaption}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="نسخ الكابشن"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className={copied ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                {copied ? "تم النسخ!" : "نسخ النص"}
              </span>
            </button>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50/60 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 text-sm text-slate-900 dark:text-zinc-100 leading-relaxed whitespace-pre-line font-normal shadow-xs">
            {item.caption}
          </div>
        </div>

        {/* 3. Designer Drawer: Design Copy & Visual Direction */}
        {(hasDesignCopy || item.designReference || item.cta) && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50/50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-zinc-300">
              <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>توجيهات التصميم والتنفيذ البصري (Design Copy)</span>
            </div>

            {hasDesignCopy && (
              <div className="space-y-3">
                {/* Structured Carousel slides indicator */}
                {Array.isArray(designCopy.slides) && designCopy.slides.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-800 dark:text-blue-300">
                      📚 كاروسيل ({designCopy.slides.length} شرائح)
                    </span>
                    <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium truncate max-w-[220px]">
                      غلاف: {designCopy.slides[0]?.headline || designCopy.headline || "—"}
                    </span>
                  </div>
                )}

                {/* Structured Reel scenes indicator */}
                {Array.isArray(designCopy.scenes) && designCopy.scenes.length > 0 && (
                  <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/50 flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-800 dark:text-purple-300">
                      🎬 سيناريو ريلز ({designCopy.scenes.length} مشاهد • {designCopy.totalDurationSec || designCopy.total_duration_sec || 30} ث)
                    </span>
                    {(designCopy.hookLine || designCopy.hook_line) && (
                      <span className="text-[11px] text-purple-700 dark:text-purple-400 font-medium truncate max-w-[220px]">
                        الخطاف: "{designCopy.hookLine || designCopy.hook_line}"
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {designCopy.headline && (
                    <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                        العنوان الرئيسي (Headline)
                      </span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm leading-snug">
                        {designCopy.headline}
                      </span>
                    </div>
                  )}

                  {designCopy.subtext && (
                    <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                        النص الفرعي (Subtext)
                      </span>
                      <span className="text-slate-600 dark:text-zinc-300 text-xs leading-snug">
                        {designCopy.subtext}
                      </span>
                    </div>
                  )}

                  {designCopy.cta && (
                    <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                        زر الإجراء (Button CTA)
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-300 font-bold text-xs">
                        {designCopy.cta}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              {item.designReference && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                  <span className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-400 text-[11px]">
                    <Film className="w-3 h-3" />
                    <span>الفكرة الإخراجية والبصرية</span>
                  </span>
                  <p className="text-slate-600 dark:text-zinc-300 text-xs leading-relaxed">
                    {item.designReference}
                  </p>
                </div>
              )}

              {item.cta && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                    <Megaphone className="w-3 h-3" />
                    <span>الدعوة لاتخاذ إجراء (Post CTA)</span>
                  </span>
                  <p className="text-slate-600 dark:text-zinc-300 text-xs font-medium leading-relaxed">
                    {item.cta}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Bottom Disclosure: "Why This Post?" Accordion */}
        <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => setShowWhyThisPost((prev) => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-900 dark:bg-zinc-950/60 dark:hover:bg-zinc-800/60 dark:border-zinc-800 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>لماذا هذا المنشور تحديداً؟ (التحليل الاستراتيجي)</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
              <span>{showWhyThisPost ? "إخفاء التحليل" : "عرض التحليل"}</span>
              {showWhyThisPost ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showWhyThisPost && (
            <div className="mt-3 p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs shadow-xs">
              <div className="space-y-1">
                <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 text-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>الهدف التسويقي في القمع:</span>
                </span>
                <p className="text-slate-600 dark:text-zinc-300 text-xs leading-relaxed pr-5">
                  {whyExplanation.objectivePurpose}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200/80 dark:border-zinc-900">
                <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 text-xs">
                  <PostIcon className="w-3.5 h-3.5" />
                  <span>سبب اختيار قالب ({postTypeInfo.label}):</span>
                </span>
                <p className="text-slate-600 dark:text-zinc-300 text-xs leading-relaxed pr-5">
                  {whyExplanation.formatFit}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200/80 dark:border-zinc-900">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                  <Compass className="w-3.5 h-3.5" />
                  <span>الشريحة المستهدفة ونقطة التأثير:</span>
                </span>
                <p className="text-slate-600 dark:text-zinc-300 text-xs leading-relaxed pr-5">
                  {whyExplanation.audienceContext}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regenerate Modal */}
      {!readOnly && planId && (
        <RegenerateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planId={planId}
          item={item}
          onSuccess={handleRegenerateSuccess}
        />
      )}
    </>
  );
}
