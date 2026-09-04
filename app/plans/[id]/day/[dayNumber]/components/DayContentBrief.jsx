"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Palette,
  Film,
  Megaphone,
  Lightbulb,
  Target,
  Compass,
  FileText,
} from "lucide-react";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { getWhyThisPostExplanation } from "@/lib/content-insights";

export default function DayContentBrief({
  item,
  strategy = {},
  isEditing = false,
  editState = {},
  onFieldChange = null,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyCaption = () => {
    const textToCopy = isEditing ? editState.caption : item.caption;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const designCopy = isEditing
    ? editState.design_copy || {}
    : item.designCopy || item.design_copy || {};

  const hasDesignCopy = Boolean(designCopy.headline || designCopy.subtext || designCopy.cta || isEditing);
  const whyExplanation = getWhyThisPostExplanation(item, strategy);

  return (
    <div className={`space-y-6 text-right ${className}`}>
      {/* 1. Main Caption Section */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-zinc-800/80">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#1A1D1F] dark:text-zinc-100">
            <FileText className="w-4 h-4 text-[#0B57D0] dark:text-blue-400" />
            <span>نص المنشور الكامل (Caption)</span>
          </div>

          <Button
            variant={copied ? "emerald" : "secondary"}
            size="sm"
            onClick={handleCopyCaption}
            startIcon={copied ? Check : Copy}
          >
            {copied ? "تم النسخ بنجاح!" : "نسخ الكابشن"}
          </Button>
        </div>

        {isEditing ? (
          <textarea
            rows={8}
            value={editState.caption || ""}
            onChange={(e) => onFieldChange("caption", e.target.value)}
            className="w-full p-4 rounded-2xl bg-white dark:bg-[#131316] border border-blue-400 dark:border-blue-600 text-sm sm:text-base text-[#1A1D1F] dark:text-zinc-100 leading-loose focus:outline-none"
            placeholder="أدخل نص الكابشن هنا..."
          />
        ) : (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-800/80 text-sm sm:text-base text-[#1A1D1F] dark:text-zinc-100 leading-loose whitespace-pre-line font-normal selection:bg-blue-100 dark:selection:bg-blue-600/30 shadow-xs">
            {item.caption}
          </div>
        )}
      </Card>

      {/* 2. Designer & Director Drawer */}
      {(hasDesignCopy || item.designReference || item.cta || isEditing) && (
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4E7EC] dark:border-zinc-800/80 font-extrabold text-sm text-[#1A1D1F] dark:text-zinc-100">
            <Palette className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            <span>توجيهات التصميم والتنفيذ الإخراجي (Design Copy & Direction)</span>
          </div>

          {/* Headline, Subtext, CTA Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-800 space-y-1.5 shadow-xs">
              <span className="block text-[11px] font-bold text-[#575C61] dark:text-zinc-400 uppercase tracking-wider">
                العنوان داخل التصميم (Headline)
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={designCopy.headline || ""}
                  onChange={(e) =>
                    onFieldChange("design_copy", {
                      ...designCopy,
                      headline: e.target.value,
                    })
                  }
                  className="w-full p-2 text-xs font-bold rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
                />
              ) : (
                <p className="font-extrabold text-[#1A1D1F] dark:text-zinc-100 text-sm leading-snug">
                  {designCopy.headline || "—"}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-800 space-y-1.5 shadow-xs">
              <span className="block text-[11px] font-bold text-[#575C61] dark:text-zinc-400 uppercase tracking-wider">
                النص التوضيحي (Subtext)
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={designCopy.subtext || ""}
                  onChange={(e) =>
                    onFieldChange("design_copy", {
                      ...designCopy,
                      subtext: e.target.value,
                    })
                  }
                  className="w-full p-2 text-xs rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
                />
              ) : (
                <p className="text-[#575C61] dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  {designCopy.subtext || "—"}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-800 space-y-1.5 shadow-xs">
              <span className="block text-[11px] font-bold text-[#575C61] dark:text-zinc-400 uppercase tracking-wider">
                زر التصميم (Button CTA)
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={designCopy.cta || ""}
                  onChange={(e) =>
                    onFieldChange("design_copy", {
                      ...designCopy,
                      cta: e.target.value,
                    })
                  }
                  className="w-full p-2 text-xs rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
                />
              ) : (
                <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-300 font-extrabold text-xs">
                  {designCopy.cta || "—"}
                </span>
              )}
            </div>
          </div>

          {/* Cinematic / Visual Direction & Post CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8F9FB] dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-800 space-y-2 shadow-xs">
              <span className="flex items-center gap-1.5 font-extrabold text-purple-700 dark:text-purple-400 text-xs">
                <Film className="w-3.5 h-3.5" />
                <span>الفكرة الإخراجية والبصرية للمونتير / المصمم</span>
              </span>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={editState.design_reference || ""}
                  onChange={(e) => onFieldChange("design_reference", e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
                />
              ) : (
                <p className="text-[#575C61] dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  {item.designReference || "—"}
                </p>
              )}
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#F8F9FB] dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-800 space-y-2 shadow-xs">
              <span className="flex items-center gap-1.5 font-extrabold text-emerald-700 dark:text-emerald-400 text-xs">
                <Megaphone className="w-3.5 h-3.5" />
                <span>الدعوة لاتخاذ إجراء (Post CTA)</span>
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editState.cta || ""}
                  onChange={(e) => onFieldChange("cta", e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
                />
              ) : (
                <p className="text-[#575C61] dark:text-zinc-300 text-xs sm:text-sm font-semibold leading-relaxed">
                  {item.cta || "—"}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 3. Strategic Rationale ("Why This Post?") */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E4E7EC] dark:border-zinc-800/80 font-extrabold text-sm text-[#1A1D1F] dark:text-zinc-100">
          <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>التحليل والذكاء الاستراتيجي (لماذا هذا المنشور تحديداً؟)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-white dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-850 space-y-1.5 shadow-xs">
            <span className="font-bold text-[#0B57D0] dark:text-blue-400 flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5" />
              <span>الهدف في القمع التسويقي:</span>
            </span>
            <p className="text-[#575C61] dark:text-zinc-300 text-xs leading-relaxed">
              {whyExplanation.objectivePurpose}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-850 space-y-1.5 shadow-xs">
            <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 text-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>سبب اختيار القالب البصري:</span>
            </span>
            <p className="text-[#575C61] dark:text-zinc-300 text-xs leading-relaxed">
              {whyExplanation.formatFit}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-850 space-y-1.5 shadow-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
              <Megaphone className="w-3.5 h-3.5" />
              <span>نقطة التأثير في الجمهور:</span>
            </span>
            <p className="text-[#575C61] dark:text-zinc-300 text-xs leading-relaxed">
              {whyExplanation.audienceContext}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
