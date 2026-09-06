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
import ContentFormatPreview from "./previews/ContentFormatPreview";

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

      {/* 2. Specialized Format Preview (Carousel Slides / Reel Storyboard / Post Graphic) */}
      <ContentFormatPreview
        item={item}
        isEditing={isEditing}
        editState={editState}
        onFieldChange={onFieldChange}
      />

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
