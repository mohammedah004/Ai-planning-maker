"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function StrategicWarnings({ warnings = [] }) {
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [isExpanded, setIsExpanded] = useState(true);

  const activeWarnings = warnings.filter((w) => !dismissedIds.has(w.id));

  if (!activeWarnings || activeWarnings.length === 0) {
    return null;
  }

  const handleDismiss = (id) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const criticalCount = activeWarnings.filter((w) => w.severity === "critical").length;
  const warningCount = activeWarnings.filter((w) => w.severity === "warning").length;
  const infoCount = activeWarnings.filter((w) => w.severity === "info").length;

  return (
    <div className="rounded-2xl bg-zinc-900/95 border border-zinc-800/90 shadow-sm overflow-hidden text-right transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:px-6 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-100">
                تنبيهات استراتيجية وفرص للتحسين ({activeWarnings.length})
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              ملاحظات يكتشفها المحرك الذكي لمساعدتك في سد الثغرات التسويقية قبل النشر
            </p>
          </div>
        </div>

        {/* Severity Badges & Toggle */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400 text-[10px] font-bold">
              {criticalCount} حرج
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-400 text-[10px] font-bold">
              {warningCount} تنبيه
            </span>
          )}
          {infoCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-[10px] font-bold">
              {infoCount} نصيحة
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer mr-1"
            title={isExpanded ? "طي التنبيهات" : "عرض التنبيهات"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Warnings List */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-3 bg-zinc-950/20">
          {activeWarnings.map((item) => {
            const isCritical = item.severity === "critical";
            const isWarning = item.severity === "warning";

            const containerStyle = isCritical
              ? "bg-red-950/20 border-red-900/40 text-red-200"
              : isWarning
              ? "bg-amber-950/20 border-amber-900/40 text-amber-200"
              : "bg-blue-950/20 border-blue-900/40 text-blue-200";

            const iconStyle = isCritical
              ? "text-red-400 bg-red-950/80 border-red-800"
              : isWarning
              ? "text-amber-400 bg-amber-950/80 border-amber-800"
              : "text-blue-400 bg-blue-950/80 border-blue-800";

            const tagStyle = isCritical
              ? "bg-red-950/80 text-red-300 border-red-800"
              : isWarning
              ? "bg-amber-950/80 text-amber-300 border-amber-800"
              : "bg-blue-950/80 text-blue-300 border-blue-800";

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 relative ${containerStyle}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconStyle}`}>
                      {isCritical ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{item.title}</span>
                        {item.tag && (
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${tagStyle}`}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDismiss(item.id)}
                    className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                    title="إخفاء التنبيه"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Recommendation Callout */}
                {item.recommendation && (
                  <div className="flex items-start gap-2 pt-2 border-t border-zinc-800/40 text-[11px] text-zinc-300 bg-zinc-950/40 p-2.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-200">الإجراء المقترح: </strong>
                      {item.recommendation}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
