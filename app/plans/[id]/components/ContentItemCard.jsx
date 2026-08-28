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
      return { label: "ريلز (Reel)", icon: Film, bg: "bg-purple-950/40", border: "border-purple-800/40", text: "text-purple-300" };
    case "carousel":
      return { label: "كاروسيل (Carousel)", icon: Layers, bg: "bg-blue-950/40", border: "border-blue-800/40", text: "text-blue-300" };
    case "static_post":
      return { label: "منشور ثابت (Post)", icon: ImageIcon, bg: "bg-emerald-950/40", border: "border-emerald-800/40", text: "text-emerald-300" };
    case "story":
      return { label: "ستوري (Story)", icon: Zap, bg: "bg-amber-950/40", border: "border-amber-800/40", text: "text-amber-300" };
    default:
      return { label: type || "منشور", icon: Layers, bg: "bg-zinc-800/60", border: "border-zinc-700/60", text: "text-zinc-300" };
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
        className={`p-6 sm:p-7 rounded-2xl bg-zinc-900 border transition-all text-right space-y-6 shadow-sm ${
          recentlyUpdated
            ? "border-emerald-500 ring-1 ring-emerald-500/40 bg-zinc-900"
            : "border-zinc-800/80 hover:border-zinc-700"
        }`}
      >
        {/* 1. Header Meta Bar: Day badge, Type badge, Objective, Pillar, Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Day Badge */}
            <span className="px-3 py-1 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs shadow-sm">
              اليوم {item.dayNumber}
            </span>

            {/* Post Type Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${postTypeInfo.bg} ${postTypeInfo.border} ${postTypeInfo.text}`}>
              <PostIcon className="w-3.5 h-3.5" />
              <span>{postTypeInfo.label}</span>
            </span>

            {/* Objective Badge */}
            <span className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-medium">
              {formatObjective(item.contentObjective)}
            </span>

            {/* Recently Updated Badge */}
            {recentlyUpdated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-xs font-bold animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>تم التحديث!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Pillar Tag */}
            {item.contentPillar && (
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-xl">
                <Target className="w-3 h-3 text-blue-400" />
                <span className="truncate max-w-[180px]">{item.contentPillar}</span>
              </div>
            )}

            {/* AI Regenerate Button */}
            {!readOnly && planId && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-bold transition-colors cursor-pointer"
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
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              نص المنشور (الكابشن)
            </span>
            <button
              type="button"
              onClick={handleCopyCaption}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-100 px-2.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="نسخ الكابشن"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className={copied ? "text-emerald-400 font-bold" : ""}>
                {copied ? "تم النسخ!" : "نسخ النص"}
              </span>
            </button>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-sm text-zinc-100 leading-relaxed whitespace-pre-line font-normal">
            {item.caption}
          </div>
        </div>

        {/* 3. Designer Drawer: Design Copy & Visual Direction */}
        {(hasDesignCopy || item.designReference || item.cta) && (
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              <span>توجيهات التصميم والتنفيذ البصري (Design Copy)</span>
            </div>

            {hasDesignCopy && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {designCopy.headline && (
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="block text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                      العنوان الرئيسي (Headline)
                    </span>
                    <span className="font-bold text-zinc-100 text-xs sm:text-sm leading-snug">
                      {designCopy.headline}
                    </span>
                  </div>
                )}

                {designCopy.subtext && (
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="block text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                      النص الفرعي (Subtext)
                    </span>
                    <span className="text-zinc-300 text-xs leading-snug">
                      {designCopy.subtext}
                    </span>
                  </div>
                )}

                {designCopy.cta && (
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="block text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                      زر الإجراء (Button CTA)
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 font-bold text-xs">
                      {designCopy.cta}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              {item.designReference && (
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="flex items-center gap-1.5 font-bold text-purple-400 text-[11px]">
                    <Film className="w-3 h-3" />
                    <span>الفكرة الإخراجية والبصرية</span>
                  </span>
                  <p className="text-zinc-300 text-xs leading-relaxed">
                    {item.designReference}
                  </p>
                </div>
              )}

              {item.cta && (
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                    <Megaphone className="w-3 h-3" />
                    <span>الدعوة لاتخاذ إجراء (Post CTA)</span>
                  </span>
                  <p className="text-zinc-300 text-xs font-medium leading-relaxed">
                    {item.cta}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Bottom Disclosure: "Why This Post?" Accordion */}
        <div className="pt-1 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setShowWhyThisPost((prev) => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>لماذا هذا المنشور تحديداً؟ (التحليل الاستراتيجي)</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <span>{showWhyThisPost ? "إخفاء التحليل" : "عرض التحليل"}</span>
              {showWhyThisPost ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showWhyThisPost && (
            <div className="mt-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>الهدف التسويقي في القمع:</span>
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed pr-5">
                  {whyExplanation.objectivePurpose}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-zinc-900">
                <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                  <PostIcon className="w-3.5 h-3.5" />
                  <span>سبب اختيار قالب ({postTypeInfo.label}):</span>
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed pr-5">
                  {whyExplanation.formatFit}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-zinc-900">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <Compass className="w-3.5 h-3.5" />
                  <span>الشريحة المستهدفة ونقطة التأثير:</span>
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed pr-5">
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
