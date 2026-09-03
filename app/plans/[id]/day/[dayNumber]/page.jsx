"use client";

import { use, Suspense } from "react";
import { Loader2 } from "lucide-react";
import DayDetailClient from "./DayDetailClient";

export default function DayDetailPage({ params }) {
  const resolvedParams = use(params);
  const planId = resolvedParams.id;
  const dayNumber = resolvedParams.dayNumber;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center text-[#1A1D1F] dark:text-zinc-100">
          <Loader2 className="w-8 h-8 text-[#0B57D0] animate-spin" />
        </div>
      }
    >
      <DayDetailClient planId={planId} dayNumber={dayNumber} />
    </Suspense>
  );
}
