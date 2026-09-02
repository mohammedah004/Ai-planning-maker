"use client";

import Link from "next/link";
import { Compass, ChevronRight, ChevronLeft } from "lucide-react";
import ContentCard from "@/app/plans/[id]/components/cards/ContentCard";

export default function RelatedDaysNav({
  allContentItems = [],
  currentDayNumber,
  planId,
  readOnly = false,
  className = "",
}) {
  if (!allContentItems || allContentItems.length === 0) return null;

  const currentNum = parseInt(currentDayNumber, 10);

  // Find 2 previous days and 2 next days
  const previousDays = allContentItems.filter((i) => i.dayNumber < currentNum).slice(-2);
  const nextDays = allContentItems.filter((i) => i.dayNumber > currentNum).slice(0, 2);

  const relatedItems = [...previousDays, ...nextDays];

  const prevSingleDay = allContentItems.find((i) => i.dayNumber === currentNum - 1);
  const nextSingleDay = allContentItems.find((i) => i.dayNumber === currentNum + 1);

  return (
    <div className={`space-y-4 pt-6 border-t border-zinc-800/80 text-right ${className}`}>
      {/* Section Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 font-extrabold text-sm text-zinc-200">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>استكشف الخطة (أيام مجاورة)</span>
        </div>

        {/* Quick Prev/Next jumps */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {prevSingleDay && (
            <Link
              href={`/plans/${planId}/day/${prevSingleDay.dayNumber}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>اليوم السابق ({prevSingleDay.dayNumber})</span>
            </Link>
          )}

          {nextSingleDay && (
            <Link
              href={`/plans/${planId}/day/${nextSingleDay.dayNumber}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors"
            >
              <span>اليوم التالي ({nextSingleDay.dayNumber})</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Miniature Cards preserving Content-Type Visual DNA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-2">
        {relatedItems.map((item) => (
          <ContentCard
            key={item.id || item.dayNumber}
            item={item}
            planId={planId}
            isMini={true}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
