"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import AppShell from "@/app/components/shell/AppShell";
import DayDetailHero from "./components/DayDetailHero";
import DayContentBrief from "./components/DayContentBrief";
import RelatedDaysNav from "./components/RelatedDaysNav";
import RegenerateModal from "@/app/plans/[id]/components/RegenerateModal";
import Button from "@/app/components/ui/Button";
import LoadingState from "@/app/components/ui/LoadingState";

import ScopedAIModal from "./components/ScopedAIModal";
import ExternalAIModal from "./components/ExternalAIModal";
import DiffPreviewModal from "./components/DiffPreviewModal";
import { calculateStrategicImpactForChangeSet } from "@/shared/strategy-impact";

export default function DayDetailClient({ planId, dayNumber }) {
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState(null);
  const [conflictBanner, setConflictBanner] = useState(null);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [isScopedAIOpen, setIsScopedAIOpen] = useState(false);
  const [isExternalAIOpen, setIsExternalAIOpen] = useState(false);
  const [diffProposal, setDiffProposal] = useState(null);
  const [proposalEditSource, setProposalEditSource] = useState("manual");

  // In-place manual edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState({});
  const [manualSaving, setManualSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        const res = await fetch(`/api/plans/${planId}/content`);
        const json = await res.json();

        if (!isMounted) return;

        if (!res.ok || !json.success) {
          setError(json.error?.message || "تعذر تحميل بيانات الخطة.");
          setLoading(false);
          return;
        }

        setPlanData(json.data);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Day detail fetch error:", err);
        setError("حدث خطأ في الاتصال أثناء تحميل بيانات اليوم.");
        setLoading(false);
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [planId]);

  const parsedDayNum = parseInt(dayNumber, 10);
  const currentItem = (planData?.contentItems || []).find(
    (i) => i.dayNumber === parsedDayNum
  );

  // Initialize edit state when entering edit mode
  const handleToggleEdit = () => {
    if (!isEditing && currentItem) {
      setEditState({
        caption: currentItem.caption || "",
        design_copy: {
          headline: currentItem.designCopy?.headline || "",
          subtext: currentItem.designCopy?.subtext || "",
          cta: currentItem.designCopy?.cta || "",
        },
        post_type: currentItem.postType || currentItem.post_type,
        content_objective: currentItem.contentObjective || currentItem.content_objective,
        content_pillar: currentItem.contentPillar || currentItem.content_pillar,
        design_reference: currentItem.designReference || currentItem.design_reference || "",
        cta: currentItem.cta || "",
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manual save trigger -> open diff preview
  const handleManualReview = () => {
    if (!currentItem) return;

    // Filter only changed fields
    const changes = {};
    if (editState.caption !== currentItem.caption) changes.caption = editState.caption;
    if (editState.post_type !== (currentItem.postType || currentItem.post_type)) changes.post_type = editState.post_type;
    if (editState.content_objective !== (currentItem.contentObjective || currentItem.content_objective)) changes.content_objective = editState.content_objective;
    if (editState.content_pillar !== (currentItem.contentPillar || currentItem.content_pillar)) changes.content_pillar = editState.content_pillar;
    if (editState.design_reference !== (currentItem.designReference || currentItem.design_reference)) changes.design_reference = editState.design_reference;
    if (editState.cta !== currentItem.cta) changes.cta = editState.cta;

    const dcOld = currentItem.designCopy || currentItem.design_copy || {};
    const dcNew = editState.design_copy || {};
    if (dcNew.headline !== dcOld.headline || dcNew.subtext !== dcOld.subtext || dcNew.cta !== dcOld.cta) {
      changes.design_copy = dcNew;
    }

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      return;
    }

    const changeSet = [
      {
        day_number: parsedDayNum,
        expected_revision: currentItem.revision,
        changes,
      },
    ];

    const strategicImpact = calculateStrategicImpactForChangeSet({
      allItems: planData.contentItems,
      changeSet,
    });

    setProposalEditSource("manual");
    setDiffProposal({
      dayNumber: parsedDayNum,
      summary: "تعديل يدوي من صفحة تفاصيل اليوم.",
      changes,
      strategicImpact,
      expectedRevision: currentItem.revision,
      expectedPlanVersion: planData?.plan?.contentVersion || 1,
    });
  };

  // Successful commit handler (from DiffPreviewModal)
  const handleCommitSuccess = (updatedItem) => {
    setPlanData((prev) => {
      if (!prev) return prev;
      const updatedItems = (prev.contentItems || []).map((i) =>
        i.dayNumber === (updatedItem.day_number || updatedItem.dayNumber)
          ? {
              ...i,
              id: updatedItem.id,
              caption: updatedItem.caption,
              designCopy: typeof updatedItem.design_copy === "object" ? updatedItem.design_copy : i.designCopy,
              postType: updatedItem.post_type || i.postType,
              contentObjective: updatedItem.content_objective || i.contentObjective,
              contentPillar: updatedItem.content_pillar || i.contentPillar,
              designReference: updatedItem.design_reference || i.designReference,
              cta: updatedItem.cta || i.cta,
              revision: updatedItem.revision,
              editSource: updatedItem.edit_source,
              previousState: updatedItem.previous_state,
              updatedAt: updatedItem.updated_at,
            }
          : i
      );

      return {
        ...prev,
        plan: {
          ...prev.plan,
          contentVersion: (prev.plan?.contentVersion || 1) + 1,
        },
        contentItems: updatedItems,
      };
    });

    setIsEditing(false);
    setDiffProposal(null);
    setConflictBanner(null);
  };

  // Undo Handler
  const handleUndo = async () => {
    if (!currentItem || !currentItem.previousState) return;

    try {
      const res = await fetch(`/api/plans/${planId}/content/${parsedDayNum}/undo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedRevision: currentItem.revision || 1,
          expectedPlanVersion: planData?.plan?.contentVersion || 1,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (res.status === 409) {
          setConflictBanner(json.error?.message || "حدث تعارض أثناء التراجع.");
        } else {
          setError(json.error?.message || "تعذر التراجع عن التعديل.");
        }
        return;
      }

      handleCommitSuccess(json.data.item);
    } catch (err) {
      console.error("Undo error:", err);
      setError("حدث خطأ في الاتصال أثناء التراجع.");
    }
  };

  const handleRegenerateSuccess = (updatedItem) => {
    setPlanData((prev) => {
      if (!prev) return prev;
      const updatedItems = (prev.contentItems || []).map((i) =>
        i.dayNumber === updatedItem.dayNumber ? updatedItem : i
      );
      return { ...prev, contentItems: updatedItems };
    });
    setIsRegenerateOpen(false);
  };

  return (
    <AppShell>
      <div className="w-full max-w-5xl mx-auto space-y-8 text-right">
        {loading ? (
          <LoadingState
            variant="card"
            size="md"
            title={`جاري تجهيز بريف اليوم ${dayNumber}...`}
            subtitle="MADAR (مدار) يستخرج نصوص التصاميم والتوجيه البصري"
          />
        ) : error ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-red-50 border border-red-200 text-center space-y-4 max-w-xl mx-auto my-12 shadow-md dark:bg-[#131316] dark:border-red-800/80 dark:shadow-2xl">
            <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto" />
            <h2 className="text-lg font-bold text-red-800 dark:text-zinc-100">حدث خطأ أثناء تحميل تفاصيل اليوم</h2>
            <p className="text-xs text-red-600 dark:text-red-300 max-w-md mx-auto leading-relaxed">{error}</p>
            <div className="pt-2">
              <Button href={`/plans/${planId}`} variant="secondary" size="md">
                العودة إلى مساحة الخطة
              </Button>
            </div>
          </div>
        ) : !currentItem ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-[#F8F9FB] border border-[#E4E7EC] text-center space-y-4 max-w-xl mx-auto my-12 shadow-md dark:bg-[#131316] dark:border-zinc-800 dark:shadow-2xl">
            <AlertCircle className="w-10 h-10 text-amber-500 dark:text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-[#1A1D1F] dark:text-zinc-100">منشور اليوم {dayNumber} غير موجود</h2>
            <p className="text-xs text-[#575C61] dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              تأكد من اكتمال توليد الخطة أو اختر يوماً بين 1 و 30.
            </p>
            <div className="pt-2">
              <Button href={`/plans/${planId}`} variant="primary" size="md">
                العودة إلى مساحة الخطة
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Conflict Banner (409) */}
            {conflictBanner && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-200 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-bold">{conflictBanner}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  إعادة تحميل الخطة
                </Button>
              </div>
            )}

            {/* Manual Save Sticky Action Dock */}
            {isEditing && (
              <div className="sticky top-4 z-40 p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-blue-300 dark:border-blue-700 shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 dark:text-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>وضع التحرير اليدوي نشط (0 كوتا) — عدّل أي حقل مباشرة ثم راجع الفروقات.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleManualReview}
                  >
                    معاينة الفروقات وحفظ التعديل
                  </Button>
                </div>
              </div>
            )}

            {/* 1. Day Detail Visual Hero */}
            <DayDetailHero
              item={currentItem}
              planId={planId}
              planTitle={planData?.plan?.productName}
              isEditing={isEditing}
              canUndo={Boolean(currentItem.previousState)}
              onToggleEdit={handleToggleEdit}
              onOpenScopedAI={() => setIsScopedAIOpen(true)}
              onOpenExternalAI={() => setIsExternalAIOpen(true)}
              onUndo={handleUndo}
              onRegenerate={() => setIsRegenerateOpen(true)}
            />

            {/* 2. Full Content & Designer Brief */}
            <DayContentBrief
              item={currentItem}
              strategy={planData?.strategy || {}}
              isEditing={isEditing}
              editState={editState}
              onFieldChange={handleFieldChange}
            />

            {/* 3. Related Days Navigation */}
            <RelatedDaysNav
              allContentItems={planData?.contentItems || []}
              currentDayNumber={parsedDayNum}
              planId={planId}
            />

            {/* AI Single-Post Regeneration Modal */}
            <RegenerateModal
              isOpen={isRegenerateOpen}
              onClose={() => setIsRegenerateOpen(false)}
              planId={planId}
              item={currentItem}
              onSuccess={handleRegenerateSuccess}
            />

            {/* Scoped AI Modal */}
            <ScopedAIModal
              isOpen={isScopedAIOpen}
              onClose={() => setIsScopedAIOpen(false)}
              planId={planId}
              dayNumber={parsedDayNum}
              item={currentItem}
              expectedPlanVersion={planData?.plan?.contentVersion || 1}
              onProposalReady={(proposalData) => {
                setProposalEditSource("ai_scoped");
                setDiffProposal(proposalData);
              }}
            />

            {/* External AI Modal */}
            <ExternalAIModal
              isOpen={isExternalAIOpen}
              onClose={() => setIsExternalAIOpen(false)}
              plan={planData?.plan || {}}
              item={currentItem}
              dayNumber={parsedDayNum}
              onProposalReady={(proposalData) => {
                setProposalEditSource("external_ai");
                const singleProposal = proposalData.changeSet?.[0] || {};
                setDiffProposal({
                  dayNumber: parsedDayNum,
                  summary: proposalData.summary,
                  changes: singleProposal.changes || {},
                  strategicImpact: proposalData.strategicImpact,
                  expectedRevision: singleProposal.expected_revision || currentItem.revision,
                  expectedPlanVersion: proposalData.expectedPlanVersion || planData?.plan?.contentVersion || 1,
                });
              }}
            />

            {/* Diff Preview & Commit Modal */}
            <DiffPreviewModal
              isOpen={Boolean(diffProposal)}
              onClose={() => setDiffProposal(null)}
              planId={planId}
              dayNumber={parsedDayNum}
              currentItem={currentItem}
              proposal={diffProposal}
              editSource={proposalEditSource}
              expectedPlanVersion={planData?.plan?.contentVersion || 1}
              onCommitSuccess={handleCommitSuccess}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
