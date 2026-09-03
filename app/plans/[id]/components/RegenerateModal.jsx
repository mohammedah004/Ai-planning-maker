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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-zinc-950/80 backdrop-blur-md text-right">
      <div
        className="w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC] dark:border-zinc-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="text-base font-extrabold text-[#1A1D1F] dark:text-zinc-100">إعادة توليد وتخصيص المنشور</h3>
              <p className="text-xs text-[#0B57D0] dark:text-blue-400 font-bold">اليوم {item.dayNumber} ({item.postType})</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-600/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-zinc-950 dark:border-red-800 dark:text-red-200 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegenerate} className="space-y-5">
          {/* Preset Chips */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-[#1A1D1F] dark:text-zinc-300">
              توجيهات سريعة جاهزة (اختر أو أضف عليها):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_INSTRUCTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#F8F9FB] hover:bg-[#F0F4F8] border border-[#E4E7EC] text-[#1A1D1F] dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100 text-[11px] font-medium transition-all text-right cursor-pointer shadow-xs"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-instruction" className="block text-xs font-bold text-[#1A1D1F] dark:text-zinc-200">
                تعليماتك الخاصة للذكاء الاصطناعي:
              </label>
              <span className="text-[10px] text-[#575C61] dark:text-zinc-500">{instruction.length} / 500</span>
            </div>
            <textarea
              id="custom-instruction"
              rows={3}
              maxLength={500}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="اكتب أي ملاحظة أو زاوية تريد التركيز عليها (مثال: ركز على الضمان الذهبي، اجعل الافتتاحية سؤالاً صادماً)..."
              className="w-full px-4 py-3 rounded-xl bg-[#F8F9FB] border border-[#E4E7EC] text-xs text-[#1A1D1F] placeholder-[#575C61] focus:outline-none focus:border-[#0B57D0] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500 transition-colors leading-relaxed"
            />
          </div>

          {/* Format & Objective Overrides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#575C61] dark:text-zinc-400">تغيير قالب المنشور (اختياري):</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E4E7EC] text-xs text-[#1A1D1F] focus:outline-none focus:border-[#0B57D0] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200 dark:focus:border-blue-500"
              >
                {POST_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value} className="bg-white text-[#1A1D1F] dark:bg-zinc-900 dark:text-zinc-200">
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#575C61] dark:text-zinc-400">تغيير الهدف التسويقي (اختياري):</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8F9FB] border border-[#E4E7EC] text-xs text-[#1A1D1F] focus:outline-none focus:border-[#0B57D0] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200 dark:focus:border-blue-500"
              >
                {OBJECTIVES.map((obj) => (
                  <option key={obj.value} value={obj.value} className="bg-white text-[#1A1D1F] dark:bg-zinc-900 dark:text-zinc-200">
                    {obj.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E4E7EC] dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#E4E7EC] hover:bg-[#F0F4F8] text-[#575C61] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 dark:bg-zinc-800 dark:border-transparent dark:hover:bg-zinc-700 dark:text-zinc-300 shadow-xs"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-extrabold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
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
