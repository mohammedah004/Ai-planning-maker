"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const PRESET_INSTRUCTIONS = [
  "🔥 اجعل الهوك (الافتتاحية) أقوى وأكثر جاذبية للعين",
  "⚡ اختصر الكابشن واجعله أكثر مباشرة وسرعة",
  "🎯 ركز أكثر على حل المشكلة ونقاط الألم",
  "📱 حول الفكرة إلى سيناريو ريلز تفاعلي ومرح",
  "💬 اجعل نبرة الصوت أكثر عفوية وقريبة للقلب",
  "💰 عزز قوة العرض والدعوة للشراء المباشر",
];

const POST_TYPES = [
  { value: "", label: "نفس نوع المنشور الحالي" },
  { value: "reel", label: "ريلز (Reel)" },
  { value: "carousel", label: "كاروسيل (Carousel)" },
  { value: "static_post", label: "منشور ثابت (Static Post)" },
  { value: "story", label: "ستوري (Story)" },
];

const OBJECTIVES = [
  { value: "", label: "نفس الهدف التسويقي الحالي" },
  { value: "awareness", label: "توعية وجذب (Awareness)" },
  { value: "education", label: "تعليم وقيمة (Education)" },
  { value: "engagement", label: "تفاعل ومجتمع (Engagement)" },
  { value: "trust", label: "بناء ثقة ومصداقية (Trust)" },
  { value: "social_proof", label: "إثبات اجتماعي (Social Proof)" },
  { value: "objection_handling", label: "تفنيد الاعتراضات (Objection Handling)" },
  { value: "conversion", label: "تحويل ومبيعات (Conversion)" },
];

export default function RegenerateModal({
  isOpen,
  onClose,
  planId,
  item,
  onSuccess,
}) {
  const [instruction, setInstruction] = useState("");
  const [postType, setPostType] = useState("");
  const [objective, setObjective] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !item) return null;

  const handleSelectPreset = (preset) => {
    if (instruction.includes(preset)) return;
    setInstruction((prev) => (prev ? `${prev}، ${preset}` : preset));
  };

  const handleRegenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/plans/${planId}/content/${item.dayNumber}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction,
          post_type: postType || undefined,
          content_objective: objective || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "تعذر إعادة التوليد. يرجى المحاولة مرة أخرى.");
        setIsLoading(false);
        return;
      }

      if (onSuccess) {
        onSuccess(json.data);
      }
      onClose();
    } catch (err) {
      console.error("Regeneration error:", err);
      setError("حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك والمحاولة مجدداً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md text-right">
      <div
        className="w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="text-base font-extrabold text-zinc-100">إعادة توليد وتخصيص المنشور</h3>
              <p className="text-xs text-blue-400 font-bold">اليوم {item.dayNumber} ({item.postType})</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-red-800 text-red-200 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegenerate} className="space-y-5">
          {/* Preset Chips */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-zinc-300">
              توجيهات سريعة جاهزة (اختر أو أضف عليها):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_INSTRUCTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-[11px] font-medium transition-all text-right cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-instruction" className="block text-xs font-bold text-zinc-200">
                تعليماتك الخاصة للذكاء الاصطناعي:
              </label>
              <span className="text-[10px] text-zinc-500">{instruction.length} / 500</span>
            </div>
            <textarea
              id="custom-instruction"
              rows={3}
              maxLength={500}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="اكتب أي ملاحظة أو زاوية تريد التركيز عليها (مثال: ركز على الضمان الذهبي، اجعل الافتتاحية سؤالاً صادماً)..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
            />
          </div>

          {/* Format & Objective Overrides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-zinc-400">تغيير قالب المنشور (اختياري):</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                {POST_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-zinc-400">تغيير الهدف التسويقي (اختياري):</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                {OBJECTIVES.map((obj) => (
                  <option key={obj.value} value={obj.value}>
                    {obj.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إعادة التوليد...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>توليد النسخة الجديدة الآن</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
