"use client";

import { Film, Play, ArrowLeft, RefreshCw, Target } from "lucide-react";
import Link from "next/link";

export default function ReelCard({
  item,
  planId,
  isMini = false,
  onRegenerate = null,
  readOnly = false,
  className = "",
}) {
  const dayNumber = item.dayNumber || item.day_number;
  const headline = item.designCopy?.headline || item.caption?.slice(0, 75) || "محتوى ريلز تفاعلي";
  const hook = item.caption ? item.caption.split("\n")[0].replace(/^[^\w\u0600-\u06FF]+/, "") : headline;

  return (
    <div
      className={`
        group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#131316] border border-slate-200/80 dark:border-zinc-800/90 hover:border-purple-500/60 hover:shadow-md transition-all duration-200 text-right overflow-hidden shadow-xs
        ${isMini ? "p-3.5 space-y-2.5 min-w-[220px]" : "p-5 space-y-4"}
        ${className}
      `.trim()}
    >
      {/* Top Header: Day Number + Post Type Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs font-black tabular-nums shadow-xs">
            اليوم {dayNumber}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-50/70 border border-violet-200/80 text-violet-700 dark:bg-purple-950/60 dark:border-purple-800/60 dark:text-purple-300 text-[11px] font-bold">
            <Film className="w-3 h-3" />
            <span>ريلز</span>
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
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white hover:bg-purple-50 text-[#575C61] hover:text-purple-700 border border-[#E4E7EC] dark:bg-zinc-800 dark:hover:bg-purple-950/60 dark:text-zinc-400 dark:hover:text-purple-300 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Video Framing Simulation Container (Cinematic DNA) */}
      <Link
        href={`/plans/${planId}/day/${dayNumber}`}
        className="block space-y-3 cursor-pointer"
      >
        <div
          className={`
            relative rounded-xl bg-gradient-to-b from-purple-50/60 to-purple-100/30 dark:from-[#18181f] dark:to-[#0d0d10] border border-purple-200 dark:border-purple-900/30 p-3 flex flex-col justify-between overflow-hidden group-hover:border-purple-600/50 transition-colors
            ${isMini ? "h-28" : "h-36"}
          `}
        >
          {/* Vertical Video Cue lines */}
          <div className="absolute top-2 left-2 flex items-center gap-1 opacity-60">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
            <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">REEL</span>
          </div>

          {/* Central Play Badge */}
          <div className="my-auto self-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-600/20 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-700 group-hover:text-white transition-all shadow-xs">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>

          {/* Hook / Visual Headline */}
          <div className="z-10">
            <p className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-100 line-clamp-2 leading-relaxed">
              {hook}
            </p>
          </div>

          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Pillar & Objective Preview */}
        {!isMini && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#575C61] dark:text-zinc-400">
            {item.contentPillar && (
              <span className="truncate max-w-[140px] text-[#1A1D1F] dark:text-zinc-300 font-medium">
                {item.contentPillar}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300 font-bold transition-colors">
              <span>تفاصيل المشهد</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
