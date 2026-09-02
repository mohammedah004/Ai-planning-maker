"use client";

import { Layers, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function GenericContentCard({
  item,
  planId,
  isMini = false,
  onRegenerate = null,
  readOnly = false,
  className = "",
}) {
  const dayNumber = item.dayNumber || item.day_number;
  const headline = item.designCopy?.headline || item.caption?.slice(0, 75) || "منشور تسويقي";
  const hook = item.caption ? item.caption.split("\n")[0].replace(/^[^\w\u0600-\u06FF]+/, "") : headline;

  return (
    <div
      className={`
        group relative flex flex-col justify-between rounded-2xl bg-[#131316] border border-zinc-800/90 hover:border-zinc-700 hover:shadow-lg transition-all duration-200 text-right overflow-hidden
        ${isMini ? "p-3.5 space-y-2.5 min-w-[220px]" : "p-5 space-y-4"}
        ${className}
      `.trim()}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-black tabular-nums">
            اليوم {dayNumber}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-850 border border-zinc-750 text-zinc-300 text-[11px] font-bold">
            <Layers className="w-3 h-3" />
            <span>{item.postType || "منشور"}</span>
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
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 border border-zinc-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Main Canvas Preview */}
      <Link
        href={`/plans/${planId}/day/${dayNumber}`}
        className="block space-y-3 cursor-pointer"
      >
        <div
          className={`
            relative rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 flex flex-col justify-between overflow-hidden group-hover:border-zinc-700 transition-colors
            ${isMini ? "h-28" : "h-36"}
          `}
        >
          <div className="my-auto space-y-1">
            <p className="text-xs font-bold text-zinc-100 line-clamp-3 leading-relaxed">
              {hook}
            </p>
          </div>
        </div>

        {!isMini && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400">
            {item.contentPillar && (
              <span className="truncate max-w-[140px] text-zinc-300 font-medium">
                {item.contentPillar}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-blue-400 group-hover:text-blue-300 font-bold transition-colors">
              <span>عرض التفاصيل</span>
              <ArrowLeft className="w-3 h-3" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
