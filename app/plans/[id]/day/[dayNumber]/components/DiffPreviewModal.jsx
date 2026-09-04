"use client";

import { useState } from "react";
import {
  X,
  Check,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Loader2,
  FileText,
  Palette,
  Sparkles,
  Layers,
} from "lucide-react";
import Button from "@/app/components/ui/Button";

const FIELD_LABELS = {
  caption: "نص الكابشن (Caption)",
  "design_copy.headline": "العنوان في التصميم (Headline)",
  "design_copy.subtext": "النص الفرعي (Subtext)",
  "design_copy.cta": "زر التصميم (Button CTA)",
  post_type: "نوع المنشور (Post Type)",
  content_objective: "الهدف التسويقي (Objective)",
  content_pillar: "ركيزة المحتوى (Pillar)",
  design_reference: "التوجيه البصري (Design Reference)",
  cta: "الدعوة للإجراء (CTA)",
};

export default function DiffPreviewModal({
  isOpen,
  onClose,
  planId,
  dayNumber,
  currentItem,
  proposal,
  editSource = "manual",
  expectedPlanVersion,
  onCommitSuccess,
}) {
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState(null);

  if (!isOpen || !proposal || !currentItem) return null;

  const changes = proposal.changes || {};
  const strategicImpact = proposal.strategicImpact;

  // Build diff list
  const diffEntries = [];

  if (changes.caption !== undefined && changes.caption !== currentItem.caption) {
    diffEntries.push({
      key: "caption",
      label: FIELD_LABELS.caption,
      oldVal: currentItem.caption,
      newVal: changes.caption,
    });
  }

  if (changes.design_copy) {
    const dcOld = currentItem.designCopy || currentItem.design_copy || {};
    const dcNew = changes.design_copy;
    if (dcNew.headline !== undefined && dcNew.headline !== dcOld.headline) {
      diffEntries.push({
        key: "design_copy.headline",
        label: FIELD_LABELS["design_copy.headline"],
        oldVal: dcOld.headline,
        newVal: dcNew.headline,
      });
    }
    if (dcNew.subtext !== undefined && dcNew.subtext !== dcOld.subtext) {
      diffEntries.push({
        key: "design_copy.subtext",
        label: FIELD_LABELS["design_copy.subtext"],
        oldVal: dcOld.subtext,
        newVal: dcNew.subtext,
      });
    }
    if (dcNew.cta !== undefined && dcNew.cta !== dcOld.cta) {
      diffEntries.push({
        key: "design_copy.cta",
        label: FIELD_LABELS["design_copy.cta"],
        oldVal: dcOld.cta,
        newVal: dcNew.cta,
      });
    }
  }

  if (changes.post_type !== undefined && changes.post_type !== (currentItem.postType || currentItem.post_type)) {
    diffEntries.push({
      key: "post_type",
      label: FIELD_LABELS.post_type,
      oldVal: currentItem.postType || currentItem.post_type,
      newVal: changes.post_type,
    });
  }

  if (changes.content_objective !== undefined && changes.content_objective !== (currentItem.contentObjective || currentItem.content_objective)) {
    diffEntries.push({
      key: "content_objective",
      label: FIELD_LABELS.content_objective,
      oldVal: currentItem.contentObjective || currentItem.content_objective,
      newVal: changes.content_objective,
    });
  }

  if (changes.content_pillar !== undefined && changes.content_pillar !== (currentItem.contentPillar || currentItem.content_pillar)) {
    diffEntries.push({
      key: "content_pillar",
      label: FIELD_LABELS.content_pillar,
      oldVal: currentItem.contentPillar || currentItem.content_pillar,
      newVal: changes.content_pillar,
    });
  }

  if (changes.design_reference !== undefined && changes.design_reference !== (currentItem.designReference || currentItem.design_reference)) {
    diffEntries.push({
      key: "design_reference",
      label: FIELD_LABELS.design_reference,
      oldVal: currentItem.designReference || currentItem.design_reference,
      newVal: changes.design_reference,
    });
  }

  if (changes.cta !== undefined && changes.cta !== currentItem.cta) {
    diffEntries.push({
      key: "cta",
      label: FIELD_LABELS.cta,
      oldVal: currentItem.cta,
      newVal: changes.cta,
    });
  }

  const handleCommit = async () => {
    setCommitting(true);
    setCommitError(null);

    try {
      const res = await fetch(`/api/plans/${planId}/content/${dayNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedRevision: proposal.expectedRevision || currentItem.revision || 1,
          expectedPlanVersion: proposal.expectedPlanVersion || expectedPlanVersion || 1,
          editSource,
          changes,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setCommitError(json.error?.message || "حدث تعارض أثناء الحفظ. يرجى تحديث الصفحة والمحاولة مجدداً.");
        setCommitting(false);
        return;
      }

      setCommitting(false);
      onClose();
      onCommitSuccess(json.data.item);
    } catch (err) {
      console.error("Commit error:", err);
      setCommitError("حدث خطأ في الاتصال أثناء حفظ التعديل.");
      setCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-right">
      <div
        className="w-full max-w-3xl p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
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
              معاينة الفروقات واعتماد التعديل (اليوم {dayNumber})
            </h3>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
          </div>
        </div>

        {commitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{commitError}</span>
          </div>
        )}

        {/* Summary note if present */}
        {proposal.summary && (
          <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800 space-y-1">
            <span className="text-[11px] font-bold text-[#575C61] dark:text-zinc-400">ملخص الاقتراح:</span>
            <p className="text-xs sm:text-sm font-semibold text-[#1A1D1F] dark:text-zinc-100">{proposal.summary}</p>
          </div>
        )}

        {/* Strategic Impact Preview Banner (System explains impact, User decides) */}
        {strategicImpact && strategicImpact.hasStrategicImpact && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-xs text-amber-900 dark:text-amber-200">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>الأثر الاستراتيجي للتعديل المقترح:</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
              {strategicImpact.summaryArabic}
            </p>
          </div>
        )}

        {/* Diff Table / Cards */}
        <div className="space-y-3">
          <span className="text-xs font-extrabold text-[#1A1D1F] dark:text-zinc-100 block">
            الحقول التي ستتغير ({diffEntries.length}):
          </span>

          {diffEntries.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#575C61] dark:text-zinc-400 bg-[#F8F9FB] dark:bg-[#131316] rounded-2xl border border-[#E4E7EC] dark:border-zinc-800">
              لم يتم رصد أي تغييرات عن المنشور الحالي.
            </div>
          ) : (
            diffEntries.map((entry) => (
              <div
                key={entry.key}
                className="p-4 rounded-2xl border border-[#E4E7EC] dark:border-zinc-800 bg-[#F8F9FB] dark:bg-[#131316] space-y-2.5"
              >
                <div className="font-extrabold text-xs text-[#1A1D1F] dark:text-zinc-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0B57D0] dark:text-blue-300 text-[10px]">
                    {entry.key}
                  </span>
                  <span>{entry.label}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Before */}
                  <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-red-950 dark:text-red-200 space-y-1">
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 block uppercase">
                      الحالي (Before)
                    </span>
                    <p className="whitespace-pre-line leading-relaxed">{entry.oldVal || "—"}</p>
                  </div>

                  {/* After */}
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                      المقترح (After)
                    </span>
                    <p className="whitespace-pre-line leading-relaxed">{entry.newVal || "—"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
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
            إلغاء التعديل
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleCommit}
            disabled={committing || diffEntries.length === 0}
            startIcon={committing ? Loader2 : Check}
          >
            {committing ? "جاري اعتماد وحفظ التعديل..." : "اعتماد وتطبيق التعديل"}
          </Button>
        </div>
      </div>
    </div>
  );
}
