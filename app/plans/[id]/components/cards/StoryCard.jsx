"use client";

import { Zap, ArrowLeft, RefreshCw, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function StoryCard({
  item,
  planId,
  isMini = false,
  onRegenerate = null,
  readOnly = false,
  className = "",
}) {
  const dayNumber = item.dayNumber || item.day_number;
  const headline = item.designCopy?.headline || item.caption?.slice(0, 75) || "محتوى ستوري سريع وتفاعلي";
  const hook = item.caption ? item.caption.split("\n")[0].replace(/^[^\w\u0600-\u06FF]+/, "") : headline;

  return (
    <div
      className={`
        group relative flex flex-col justify-between rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800/90 hover:border-amber-500/60 hover:shadow-md transition-all duration-200 text-right overflow-hidden shadow-xs
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800/60 dark:text-amber-300 text-[11px] font-bold">
            <Zap className="w-3 h-3" />
            <span>ستوري</span>
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
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white hover:bg-amber-50 text-[#575C61] hover:text-amber-700 border border-[#E4E7EC] dark:bg-zinc-800 dark:hover:bg-amber-950/60 dark:text-zinc-400 dark:hover:text-amber-300 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 9:16 Vertical Story Simulation Container (Story DNA) */}
      <Link
        href={`/plans/${planId}/day/${dayNumber}`}
        className="block space-y-3 cursor-pointer"
      >
        <div
          className={`
            relative rounded-xl bg-gradient-to-b from-amber-50/60 to-amber-100/30 dark:from-[#1c1914] dark:to-[#0f0e0c] border border-amber-200 dark:border-amber-900/30 p-3.5 flex flex-col justify-between overflow-hidden group-hover:border-amber-500/50 transition-colors
            ${isMini ? "h-28" : "h-36"}
          `}
        >
          {/* Story Progress Bar Cues at Top */}
          <div className="flex items-center gap-1.5 w-full">
            <div className="flex-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400" />
            <div className="flex-1 h-1 rounded-full bg-amber-200 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-900/50" />
            <div className="flex-1 h-1 rounded-full bg-amber-200 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-900/50" />
          </div>

          {/* Central Story Prompt */}
          <div className="my-auto space-y-1">
            <p className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-100 line-clamp-2 leading-relaxed">
              {hook}
            </p>
          </div>

          {/* Interactive Story Sticker / Reply Cue */}
          <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-medium pt-1 border-t border-amber-200 dark:border-amber-900/30">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>تفاعل مباشر</span>
            </div>
            <span>9:16</span>
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
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300 font-bold transition-colors">
              <span>تفاصيل الستوري</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
