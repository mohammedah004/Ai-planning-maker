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
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyCaption = () => {
    if (!item.caption) return;
    navigator.clipboard.writeText(item.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const designCopy = item.designCopy || {};
  const hasDesignCopy = Boolean(designCopy.headline || designCopy.subtext || designCopy.cta);
  const whyExplanation = getWhyThisPostExplanation(item, strategy);

  return (
    <div className={`space-y-6 text-right ${className}`}>
      {/* 1. Main Caption Section */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 font-extrabold text-sm text-zinc-100">
            <FileText className="w-4 h-4 text-blue-400" />
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

        <div className="p-5 sm:p-6 rounded-2xl bg-[#09090b] border border-zinc-800/80 text-sm sm:text-base text-zinc-100 leading-loose whitespace-pre-line font-normal selection:bg-blue-600/30">
          {item.caption}
        </div>
      </Card>

      {/* 2. Designer & Director Drawer */}
      {(hasDesignCopy || item.designReference || item.cta) && (
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80 font-extrabold text-sm text-zinc-100">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>توجيهات التصميم والتنفيذ الإخراجي (Design Copy & Direction)</span>
          </div>

          {/* Headline, Subtext, CTA Grid */}
          {hasDesignCopy && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {designCopy.headline && (
                <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-1.5">
                  <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    العنوان داخل التصميم (Headline)
                  </span>
                  <p className="font-extrabold text-zinc-100 text-sm leading-snug">
                    {designCopy.headline}
                  </p>
                </div>
              )}

              {designCopy.subtext && (
                <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-1.5">
                  <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    النص التوضيحي (Subtext)
                  </span>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    {designCopy.subtext}
                  </p>
                </div>
              )}

              {designCopy.cta && (
                <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-1.5">
                  <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    زر التصميم (Button CTA)
                  </span>
                  <span className="inline-block px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 font-extrabold text-xs">
                    {designCopy.cta}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cinematic / Visual Direction & Post CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {item.designReference && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#09090b] border border-zinc-800 space-y-2">
                <span className="flex items-center gap-1.5 font-extrabold text-purple-400 text-xs">
                  <Film className="w-3.5 h-3.5" />
                  <span>الفكرة الإخراجية والبصرية للمونتير / المصمم</span>
                </span>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  {item.designReference}
                </p>
              </div>
            )}

            {item.cta && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#09090b] border border-zinc-800 space-y-2">
                <span className="flex items-center gap-1.5 font-extrabold text-emerald-400 text-xs">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>الدعوة لاتخاذ إجراء (Post CTA)</span>
                </span>
                <p className="text-zinc-300 text-xs sm:text-sm font-semibold leading-relaxed">
                  {item.cta}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 3. Strategic Rationale ("Why This Post?") */}
      <Card padding="lg" className="space-y-4 bg-[#111114]">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80 font-extrabold text-sm text-zinc-100">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>التحليل والذكاء الاستراتيجي (لماذا هذا المنشور تحديداً؟)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-850 space-y-1.5">
            <span className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5" />
              <span>الهدف في القمع التسويقي:</span>
            </span>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {whyExplanation.objectivePurpose}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-850 space-y-1.5">
            <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>سبب اختيار القالب البصري:</span>
            </span>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {whyExplanation.formatFit}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-850 space-y-1.5">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
              <Megaphone className="w-3.5 h-3.5" />
              <span>نقطة التأثير في الجمهور:</span>
            </span>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {whyExplanation.audienceContext}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
