"use client";

import { useState } from "react";
import {
  X,
  Check,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Layers,
} from "lucide-react";
import Button from "@/app/components/ui/Button";

export default function MultiDayBatchReviewModal({
  isOpen,
  onClose,
  planId,
  proposal,
  onBatchCommitSuccess,
}) {
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState(null);

  if (!isOpen || !proposal) return null;

  const changeSet = proposal.changeSet || [];
  const strategicImpact = proposal.strategicImpact;

  const handleCommitBatch = async () => {
    setCommitting(true);
    setCommitError(null);

    try {
      const res = await fetch(`/api/plans/${planId}/content/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedPlanVersion: proposal.expectedPlanVersion || 1,
          editSource: "external_ai",
          batch: changeSet,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setCommitError(json.error?.message || "فشل تطبيق التعديل الجماعي لوجود تعارض في الإصدارات.");
        setCommitting(false);
        return;
      }

      setCommitting(false);
      onClose();
      onBatchCommitSuccess();
    } catch (err) {
      console.error("Batch commit error:", err);
      setCommitError("حدث خطأ في الاتصال أثناء حفظ التعديل الجماعي.");
      setCommitting(false);
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
            disabled={committing}
            className="p-2 rounded-xl text-[#575C61] hover:text-[#1A1D1F] dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-[#1A1D1F] dark:text-zinc-100">
              مراجعة التعديلات الجماعية ({changeSet.length} أيام)
            </h3>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {commitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{commitError}</span>
          </div>
        )}

        {/* Summary */}
        {proposal.summary && (
          <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800 space-y-1">
            <span className="text-[11px] font-bold text-[#575C61] dark:text-zinc-400">ملخص التعديلات:</span>
            <p className="text-xs sm:text-sm font-semibold text-[#1A1D1F] dark:text-zinc-100">{proposal.summary}</p>
          </div>
        )}

        {/* Strategic Impact Preview */}
        {strategicImpact && strategicImpact.hasStrategicImpact && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-xs text-amber-900 dark:text-amber-200">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>الأثر الاستراتيجي الجماعي على توزيع الخطة:</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
              {strategicImpact.summaryArabic}
            </p>
          </div>
        )}

        {/* Changed Days List */}
        <div className="space-y-3">
          <span className="text-xs font-extrabold text-[#1A1D1F] dark:text-zinc-100 block">
            الأيام المشمولة بالتحديث ({changeSet.length}):
          </span>

          <div className="space-y-3 max-h-64 overflow-y-auto p-1">
            {changeSet.map((item) => (
              <div
                key={item.day_number}
                className="p-4 rounded-2xl border border-[#E4E7EC] dark:border-zinc-800 bg-[#F8F9FB] dark:bg-[#131316] space-y-2"
              >
                <div className="flex items-center justify-between font-extrabold text-xs">
                  <span className="text-[#575C61] dark:text-zinc-400">
                    الحقول المعدلة: {Object.keys(item.changes || {}).join("، ")}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-black">
                    اليوم {item.day_number}
                  </span>
                </div>

                {item.changes?.caption && (
                  <p className="text-xs text-[#1A1D1F] dark:text-zinc-200 line-clamp-2 leading-relaxed">
                    {item.changes.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4E7EC] dark:border-zinc-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={committing}
          >
            إلغاء
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleCommitBatch}
            disabled={committing || changeSet.length === 0}
            startIcon={committing ? Loader2 : Check}
          >
            {committing ? "جاري اعتماد الدفعة ذرياً..." : `اعتماد وتطبيق ${changeSet.length} أيام في خطوة واحدة`}
          </Button>
        </div>
      </div>
    </div>
  );
}
