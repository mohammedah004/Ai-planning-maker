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

export default function DayDetailClient({ planId, dayNumber }) {
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState(null);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

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

  const parsedDayNum = parseInt(dayNumber, 10);
  const currentItem = (planData?.contentItems || []).find(
    (i) => i.dayNumber === parsedDayNum
  );

  return (
    <AppShell>
      <div className="w-full max-w-5xl mx-auto space-y-8 text-right">
        {loading ? (
          <div className="text-center py-24 space-y-4 max-w-md mx-auto">
            <Loader2 className="w-10 h-10 text-[#0B57D0] animate-spin mx-auto" />
            <p className="text-base font-bold text-[#1A1D1F] dark:text-zinc-100">
              جاري تجهيز بريف اليوم {dayNumber}...
            </p>
            <p className="text-xs text-[#575C61] dark:text-zinc-400">يرجى الانتظار بضع لحظات</p>
          </div>
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
            {/* 1. Day Detail Visual Hero */}
            <DayDetailHero
              item={currentItem}
              planId={planId}
              planTitle={planData?.plan?.productName}
              onRegenerate={() => setIsRegenerateOpen(true)}
            />

            {/* 2. Full Content & Designer Brief */}
            <DayContentBrief
              item={currentItem}
              strategy={planData?.strategy || {}}
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
          </div>
        )}
      </div>
    </AppShell>
  );
}
