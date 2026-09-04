"use client";

import { Image as ImageIcon, ArrowLeft, RefreshCw, Quote } from "lucide-react";
import Link from "next/link";

export default function PostCard({
  item,
  planId,
  isMini = false,
  onRegenerate = null,
  readOnly = false,
  className = "",
}) {
  const dayNumber = item.dayNumber || item.day_number;
  const headline = item.designCopy?.headline || item.caption?.slice(0, 75) || "منشور ثابت";
  const hook = item.caption ? item.caption.split("\n")[0].replace(/^[^\w\u0600-\u06FF]+/, "") : headline;

  return (
    <div
      className={`
        group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#131316] border border-slate-200/80 dark:border-zinc-800/90 hover:border-emerald-500/60 hover:shadow-md transition-all duration-200 text-right overflow-hidden shadow-xs
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 text-[11px] font-bold">
            <ImageIcon className="w-3 h-3" />
            <span>منشور ثابت</span>
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
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-[#575C61] hover:text-emerald-700 border border-[#E4E7EC] dark:bg-zinc-800 dark:hover:bg-emerald-950/60 dark:text-zinc-400 dark:hover:text-emerald-300 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Single Graphic Canvas Preview (Static Post DNA) */}
      <Link
        href={`/plans/${planId}/day/${dayNumber}`}
        className="block space-y-3 cursor-pointer"
      >
        <div
          className={`
            relative rounded-xl bg-gradient-to-b from-emerald-50/60 to-emerald-100/30 dark:from-[#151a17] dark:to-[#0c0f0d] border border-emerald-200 dark:border-emerald-900/30 p-3.5 flex flex-col justify-between overflow-hidden group-hover:border-emerald-500/50 transition-colors
            ${isMini ? "h-28" : "h-36"}
          `}
        >
          {/* Top Post Cue */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              STATIC GRAPHIC
            </span>
            <Quote className="w-3.5 h-3.5 text-emerald-600/60 dark:text-emerald-500/40" />
          </div>

          {/* Central Headline / Insight Quote */}
          <div className="my-auto space-y-1">
            <p className="text-xs font-extrabold text-[#1A1D1F] dark:text-zinc-100 line-clamp-3 leading-relaxed">
              &ldquo;{hook}&rdquo;
            </p>
          </div>

          {/* Canvas Tag */}
          <div className="flex items-center justify-between text-[10px] text-emerald-700/90 dark:text-emerald-400/80 font-medium">
            <span>تصميم أحادي</span>
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
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 font-bold transition-colors">
              <span>تفاصيل التصميم</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
