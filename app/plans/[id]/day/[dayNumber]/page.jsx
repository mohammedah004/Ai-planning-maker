"use client";

import { use, Suspense } from "react";
import DayDetailClient from "./DayDetailClient";
import LoadingState from "@/app/components/ui/LoadingState";

export default function DayDetailPage({ params }) {
  const resolvedParams = use(params);
  const planId = resolvedParams.id;
  const dayNumber = resolvedParams.dayNumber;

  return (
    <Suspense
      fallback={
        <LoadingState
          variant="fullscreen"
          size="md"
          title={`جاري تجهيز تفاصيل اليوم ${dayNumber}...`}
          subtitle="MADAR (مدار) يجهز نصوص وصور المنشور"
        />
      }
    >
      <DayDetailClient planId={planId} dayNumber={dayNumber} />
    </Suspense>
  );
}
