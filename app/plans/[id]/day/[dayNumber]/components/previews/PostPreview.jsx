"use client";

import { Palette, Film, Megaphone, Check, Copy } from "lucide-react";
import { useState } from "react";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";

export default function PostPreview({
  item,
  isEditing = false,
  editState = {},
  onFieldChange = null,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const designCopy = isEditing
    ? editState.design_copy || {}
    : item.designCopy || item.design_copy || {};

  const handleCopyDesignCopy = () => {
    const text = [
      designCopy.headline ? `العنوان: ${designCopy.headline}` : "",
      designCopy.subtext ? `النص: ${designCopy.subtext}` : "",
      designCopy.cta ? `الزر: ${designCopy.cta}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-5 text-right ${className}`}>
      {/* 1. Canvas Mockup / Design Card */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-zinc-800/80">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#1A1D1F] dark:text-zinc-100">
            <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>تصميم المنشور الثابت (Post Graphic Content)</span>
          </div>

          {!isEditing && (
            <Button
              variant={copied ? "emerald" : "secondary"}
              size="sm"
              onClick={handleCopyDesignCopy}
              startIcon={copied ? Check : Copy}
            >
              {copied ? "تم النسخ" : "نسخ نصوص التصميم"}
            </Button>
          )}
        </div>

        {/* Visual Graphic Representation */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F8F9FB] to-emerald-50/20 dark:from-[#131316] dark:to-emerald-950/10 border border-[#E4E7EC] dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="space-y-2">
            <span className="block text-[11px] font-bold text-[#575C61] dark:text-zinc-400 uppercase tracking-wider">
              العنوان الرئيسي في التصميم (Headline)
            </span>
            {isEditing ? (
              <input
                type="text"
                value={designCopy.headline || ""}
                onChange={(e) =>
                  onFieldChange?.("design_copy", {
                    ...designCopy,
                    headline: e.target.value,
                  })
                }
                className="w-full p-2.5 text-sm font-bold rounded-xl border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-100 focus:outline-none"
                placeholder="أدخل عنوان التصميم..."
              />
            ) : (
              <h3 className="font-black text-[#1A1D1F] dark:text-zinc-100 text-base sm:text-lg leading-snug">
                {designCopy.headline || "—"}
              </h3>
            )}
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] font-bold text-[#575C61] dark:text-zinc-400 uppercase tracking-wider">
              النص التوضيحي داخل التصميم (Subtext)
            </span>
            {isEditing ? (
              <textarea
                rows={2}
                value={designCopy.subtext || ""}
                onChange={(e) =>
                  onFieldChange?.("design_copy", {
                    ...designCopy,
                    subtext: e.target.value,
                  })
                }
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-100 focus:outline-none"
                placeholder="أدخل النص التوضيحي..."
              />
            ) : (
              <p className="text-[#575C61] dark:text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {designCopy.subtext || "—"}
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#575C61] dark:text-zinc-400">
              زر الإجراء على التصميم (Button CTA):
            </span>
            {isEditing ? (
              <input
                type="text"
                value={designCopy.cta || ""}
                onChange={(e) =>
                  onFieldChange?.("design_copy", {
                    ...designCopy,
                    cta: e.target.value,
                  })
                }
                className="p-1.5 px-3 text-xs rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-100"
                placeholder="مثال: اطلب الآن"
              />
            ) : (
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                {designCopy.cta || "اكتشف المزيد"}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Visual Direction & Post CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md" className="space-y-2">
          <span className="flex items-center gap-1.5 font-extrabold text-purple-700 dark:text-purple-400 text-xs">
            <Film className="w-3.5 h-3.5" />
            <span>التوجيه البصري للمصمم (Visual Direction)</span>
          </span>
          {isEditing ? (
            <textarea
              rows={3}
              value={editState.design_reference || ""}
              onChange={(e) => onFieldChange?.("design_reference", e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
            />
          ) : (
            <p className="text-[#575C61] dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
              {item.designReference || "—"}
            </p>
          )}
        </Card>

        <Card padding="md" className="space-y-2">
          <span className="flex items-center gap-1.5 font-extrabold text-emerald-700 dark:text-emerald-400 text-xs">
            <Megaphone className="w-3.5 h-3.5" />
            <span>الدعوة لاتخاذ إجراء في الكابشن (Post CTA)</span>
          </span>
          {isEditing ? (
            <input
              type="text"
              value={editState.cta || ""}
              onChange={(e) => onFieldChange?.("cta", e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
            />
          ) : (
            <p className="text-[#575C61] dark:text-zinc-300 text-xs sm:text-sm font-semibold leading-relaxed">
              {item.cta || "—"}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
