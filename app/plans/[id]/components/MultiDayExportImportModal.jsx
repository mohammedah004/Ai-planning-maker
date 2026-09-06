"use client";

import { useState } from "react";
import {
  X,
  Layers,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  FileCode,
  Sparkles,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import { generateMultiDayPortableContext } from "@/lib/portableContext";

export default function MultiDayExportImportModal({
  isOpen,
  onClose,
  plan,
  contentItems = [],
  onProposalReady,
}) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [rawResponse, setRawResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const promptText = generateMultiDayPortableContext({
    plan,
    contentItems,
  });

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleParse = async (e) => {
    e.preventDefault();
    if (!rawResponse.trim()) {
      setError("يرجى لصق الرد المستلم من الذكاء الاصطناعي.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/plans/${plan.id}/external-ai/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "multi_day",
          raw_response: rawResponse.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        console.warn("[MultiDayExportImportModal] Contract parsing error:", json.error?.code, json.error?.details);
        setError(json.error?.message || "تعذر تطبيق التعديل المطلوب على الخطة. جرّب تعديل الطلب بما يتوافق مع معيار التعديل.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();
      onProposalReady(json.data);
    } catch (err) {
      console.error("Parse multi-day error:", err);
      setError("حدث خطأ في الاتصال بالخدمة أثناء تحليل الرد.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-right">
      <div
        className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC] dark:border-zinc-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-[#575C61] hover:text-[#1A1D1F] dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-[#1A1D1F] dark:text-zinc-100">
              تصدير واستيراد الخطة للذكاء الاصطناعي الخارجي (Multi-Day AI Round-Trip)
            </h3>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Step 1: Copy Plan Context */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant={copiedPrompt ? "emerald" : "secondary"}
                size="sm"
                onClick={handleCopyPrompt}
                startIcon={copiedPrompt ? Check : Copy}
              >
                {copiedPrompt ? "تم نسخ السياق بالكامل!" : "نسخ سياق الـ 30 يوماً كبرومبت"}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#575C61] dark:text-zinc-400">
                  انسخ السياق وشاركه مع ChatGPT o3 / Claude 3.5 Sonnet
                </span>
                <span className="w-6 h-6 rounded-full bg-[#0B57D0] text-white flex items-center justify-center font-black text-xs">
                  1
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800 text-xs text-[#575C61] dark:text-zinc-400 max-h-36 overflow-y-auto whitespace-pre-line font-mono text-left dir-ltr">
              {promptText}
            </div>
          </div>

          {/* Step 2: Paste Multi-day Return */}
          <form onSubmit={handleParse} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                ⚡ 0 استهلاك كوتا (استيراد وفحص مجاني)
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs font-extrabold text-[#1A1D1F] dark:text-zinc-100">
                  الصق رد الذكاء الاصطناعي متعدد الأيام:
                </label>
                <span className="w-6 h-6 rounded-full bg-[#0B57D0] text-white flex items-center justify-center font-black text-xs">
                  2
                </span>
              </div>
            </div>

            <textarea
              rows={7}
              value={rawResponse}
              onChange={(e) => setRawResponse(e.target.value)}
              placeholder="الصق كود ```madar-changes بالكامل هنا..."
              className="w-full p-3.5 text-xs font-mono rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800 text-[#1A1D1F] dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors dir-ltr"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E7EC] dark:border-zinc-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={loading || !rawResponse.trim()}
                startIcon={loading ? Loader2 : FileCode}
              >
                {loading ? "جاري فحص وتدقيق الرد..." : "تدقيق الرد ومعاينة التغييرات الجماعية"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
