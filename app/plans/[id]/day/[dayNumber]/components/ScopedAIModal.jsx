"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  ArrowLeft,
} from "lucide-react";
import Button from "@/app/components/ui/Button";

const SCOPE_OPTIONS = [
  { id: "caption", label: "الكابشن بالكامل (Caption)" },
  { id: "design_copy.headline", label: "العنوان في التصميم (Headline)" },
  { id: "design_copy.subtext", label: "النص الفرعي في التصميم (Subtext)" },
  { id: "design_copy.cta", label: "زر التصميم (Button CTA)" },
  { id: "post_type", label: "نوع القالب (Post Type)" },
  { id: "content_objective", label: "الهدف التسويقي (Objective)" },
  { id: "content_pillar", label: "الركيزة (Content Pillar)" },
  { id: "design_reference", label: "التوجيه البصري والإخراجي (Design Reference)" },
  { id: "cta", label: "الدعوة للإجراء الختامية (Post CTA)" },
];

export default function ScopedAIModal({
  isOpen,
  onClose,
  planId,
  dayNumber,
  item,
  expectedPlanVersion,
  onProposalReady,
}) {
  const [selectedScopes, setSelectedScopes] = useState(["caption"]);
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !item) return null;

  const toggleScope = (scopeId) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId]
    );
  };

  const selectEntirePost = () => {
    setSelectedScopes(["entire_post"]);
  };

  const isEntirePost = selectedScopes.includes("entire_post");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedScopes.length === 0) {
      setError("يرجى تحديد نطاق واحد على الأقل للتعديل.");
      return;
    }
    if (!instruction.trim()) {
      setError("يرجى كتابة تعليمات التعديل المطلوبة.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/plans/${planId}/content/${dayNumber}/scoped-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: selectedScopes,
          instruction: instruction.trim(),
          expectedRevision: item.revision || 1,
          expectedPlanVersion: expectedPlanVersion || 1,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "تعذر توليد الاقتراح عبر الذكاء الاصطناعي.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();
      onProposalReady(json.data);
    } catch (err) {
      console.error("Scoped AI generation error:", err);
      setError("حدث خطأ في الاتصال بالخدمة الخلفية.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-right">
      <div
        className="w-full max-w-xl p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 shadow-2xl space-y-6 relative"
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
              تعديل ذكي محدد النطاق (Scoped AI)
            </h3>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Scope Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={selectEntirePost}
                className={`text-xs font-bold transition-colors ${
                  isEntirePost ? "text-purple-600 dark:text-purple-400" : "text-[#575C61] dark:text-zinc-400 hover:text-purple-600"
                }`}
              >
                [تحديد المنشور بالكامل (9 حقول)]
              </button>
              <label className="text-xs font-extrabold text-[#1A1D1F] dark:text-zinc-100">
                اختر الحقول المسموح للذكاء الاصطناعي بتعديلها:
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border rounded-2xl border-[#E4E7EC] dark:border-zinc-800">
              {SCOPE_OPTIONS.map((opt) => {
                const isChecked = isEntirePost || selectedScopes.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => {
                      if (isEntirePost) {
                        setSelectedScopes([opt.id]);
                      } else {
                        toggleScope(opt.id);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all text-right ${
                      isChecked
                        ? "bg-purple-50/80 border-purple-300 text-purple-900 dark:bg-purple-950/40 dark:border-purple-700 dark:text-purple-200"
                        : "bg-[#F8F9FB] border-[#E4E7EC] text-[#575C61] dark:bg-[#131316] dark:border-zinc-800 dark:text-zinc-400 hover:border-zinc-300"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-[#575C61] dark:text-zinc-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt / Instruction Input */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-[#1A1D1F] dark:text-zinc-100">
              تعليمات التعديل والتوجيه:
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="مثال: اجعل نبرة الكابشن أكثر حماساً، وأضف إشارة إلى أن الخصم ينتهي الليلة..."
              className="w-full p-3 text-sm rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800 text-[#1A1D1F] dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
            <span>يستهلك التعديل الذكي رصيداً واحداً (1) من كوتا إعادة الصياغة اليومية.</span>
          </div>

          {/* Buttons */}
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
              disabled={loading || selectedScopes.length === 0 || !instruction.trim()}
              startIcon={loading ? Loader2 : Sparkles}
            >
              {loading ? "جاري توليد الاقتراح..." : "توليد الاقتراح ومراجعته"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
