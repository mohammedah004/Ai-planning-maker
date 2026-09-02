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
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-100">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <DayDetailClient planId={planId} dayNumber={dayNumber} />
    </Suspense>
  );
}
