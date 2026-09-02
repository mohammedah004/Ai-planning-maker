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
        group relative flex flex-col justify-between rounded-2xl bg-[#131316] border border-zinc-800/90 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-950/20 transition-all duration-200 text-right overflow-hidden
        ${isMini ? "p-3.5 space-y-2.5 min-w-[220px]" : "p-5 space-y-4"}
        ${className}
      `.trim()}
    >
      {/* Top Header: Day Number + Post Type Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-black tabular-nums">
            اليوم {dayNumber}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 text-[11px] font-bold">
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
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-950/60 text-zinc-400 hover:text-blue-300 border border-zinc-700 transition-all cursor-pointer"
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
          <div className="absolute top-0 right-3 left-3 h-4 rounded-t-lg bg-zinc-800/60 border-t border-x border-zinc-700/50" />
          <div className="absolute top-1 right-2 left-2 h-4 rounded-t-lg bg-zinc-800/90 border-t border-x border-zinc-700/70" />

          {/* Front Main Slide Canvas */}
          <div
            className={`
              relative z-10 rounded-xl bg-gradient-to-b from-[#181820] to-[#0f0f14] border border-blue-900/30 p-3.5 flex flex-col justify-between overflow-hidden group-hover:border-blue-500/50 transition-colors
              ${isMini ? "h-28" : "h-36"}
            `}
          >
            {/* Top Carousel Slide Cue */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">
                CAROUSEL SLIDES
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              </div>
            </div>

            {/* Slide Headline & Subtext */}
            <div className="my-auto space-y-1">
              <h4 className="text-xs font-bold text-zinc-100 line-clamp-2 leading-relaxed">
                {headline}
              </h4>
              {subtext && !isMini && (
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  {subtext}
                </p>
              )}
            </div>

            {/* Slide Action Indicator */}
            <div className="flex items-center justify-between text-[10px] text-blue-400/80 font-medium">
              <span>اسحب للشرائح ←</span>
            </div>
          </div>
        </div>

        {/* Pillar & Link */}
        {!isMini && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400">
            {item.contentPillar && (
              <span className="truncate max-w-[140px] text-zinc-300 font-medium">
                {item.contentPillar}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-blue-400 group-hover:text-blue-300 font-bold transition-colors">
              <span>استعراض الشرائح</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
