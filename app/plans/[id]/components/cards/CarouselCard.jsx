"use client";

import { Layers, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CarouselCard({
  item,
  planId,
  isMini = false,
  onRegenerate = null,
  readOnly = false,
  className = "",
}) {
  const dayNumber = item.dayNumber || item.day_number;
  const headline = item.designCopy?.headline || item.caption?.slice(0, 75) || "محتوى كاروسيل تعليمي";
  const subtext = item.designCopy?.subtext;

  return (
    <div
      className={`
        group relative flex flex-col justify-between rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800/90 hover:border-blue-500/60 hover:shadow-md transition-all duration-200 text-right overflow-hidden shadow-xs
        ${isMini ? "p-3.5 space-y-2.5 min-w-[220px]" : "p-5 space-y-4"}
        ${className}
      `.trim()}
    >
      {/* Top Header: Day Number + Post Type Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 text-[#1A1D1F] dark:text-zinc-200 text-xs font-black tabular-nums shadow-xs">
            اليوم {dayNumber}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-300 text-[11px] font-bold">
            <Layers className="w-3 h-3" />
            <span>كاروسيل</span>
          </span>
        </div>

        {!readOnly && onRegenerate && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRegenerate(item);
            }}
            title="إعادة صياغة المنشور بـ AI"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#575C61] hover:text-[#0B57D0] border border-[#E4E7EC] dark:bg-zinc-800 dark:hover:bg-blue-950/60 dark:text-zinc-400 dark:hover:text-blue-300 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Layered Multi-Slide Card Simulation Container (Carousel DNA) */}
      <Link
        href={`/plans/${planId}/day/${dayNumber}`}
        className="block space-y-3 cursor-pointer"
      >
        <div className="relative pt-2 px-1">
          {/* Stacked background slide edges to visually shout "Multi-Slide" */}
          <div className="absolute top-0 right-3 left-3 h-4 rounded-t-lg bg-zinc-200/80 dark:bg-zinc-800/60 border-t border-x border-zinc-300/80 dark:border-zinc-700/50" />
          <div className="absolute top-1 right-2 left-2 h-4 rounded-t-lg bg-zinc-100/90 dark:bg-zinc-800/90 border-t border-x border-zinc-300/90 dark:border-zinc-700/70" />

          {/* Front Main Slide Canvas */}
          <div
            className={`
              relative z-10 rounded-xl bg-gradient-to-b from-blue-50/60 to-blue-100/30 dark:from-[#181820] dark:to-[#0f0f14] border border-blue-200 dark:border-blue-900/30 p-3.5 flex flex-col justify-between overflow-hidden group-hover:border-blue-500/50 transition-colors
              ${isMini ? "h-28" : "h-36"}
            `}
          >
            {/* Top Carousel Slide Cue */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#0B57D0] dark:text-blue-300 uppercase tracking-wider">
                CAROUSEL SLIDES
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-700" />
              </div>
            </div>

            {/* Slide Headline & Subtext */}
            <div className="my-auto space-y-1">
              <h4 className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-100 line-clamp-2 leading-relaxed">
                {headline}
              </h4>
              {subtext && !isMini && (
                <p className="text-[11px] text-[#575C61] dark:text-zinc-400 line-clamp-1">
                  {subtext}
                </p>
              )}
            </div>

            {/* Slide Action Indicator */}
            <div className="flex items-center justify-between text-[10px] text-[#0B57D0] dark:text-blue-400/80 font-medium">
              <span>اسحب للشرائح ←</span>
            </div>
          </div>
        </div>

        {/* Pillar & Link */}
        {!isMini && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#575C61] dark:text-zinc-400">
            {item.contentPillar && (
              <span className="truncate max-w-[140px] text-[#1A1D1F] dark:text-zinc-300 font-medium">
                {item.contentPillar}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[#0B57D0] dark:text-blue-400 group-hover:text-[#0842a0] dark:group-hover:text-blue-300 font-bold transition-colors">
              <span>استعراض الشرائح</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
