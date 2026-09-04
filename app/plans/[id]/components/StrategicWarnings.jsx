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
    <div className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 shadow-xs overflow-hidden text-right transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:px-6 flex items-center justify-between border-b border-amber-200/80 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100/80 border border-amber-200 text-amber-800 dark:bg-amber-900/40 dark:border-amber-800/60 dark:text-amber-300 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                تنبيهات استراتيجية وفرص للتحسين ({activeWarnings.length})
              </h3>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 hidden sm:block">
              ملاحظات يكتشفها المحرك الذكي لمساعدتك في سد الثغرات التسويقية قبل النشر
            </p>
          </div>
        </div>

        {/* Severity Badges & Toggle */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 dark:bg-red-950 dark:border-red-800 dark:text-red-400 text-[10px] font-bold">
              {criticalCount} حرج
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400 text-[10px] font-bold">
              {warningCount} تنبيه
            </span>
          )}
          {infoCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400 text-[10px] font-bold">
              {infoCount} نصيحة
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/80 border border-amber-200 hover:bg-white text-amber-800 dark:bg-amber-900/40 dark:border-amber-800/50 dark:hover:bg-amber-900/60 dark:text-amber-300 transition-colors cursor-pointer mr-1"
            title={isExpanded ? "طي التنبيهات" : "عرض التنبيهات"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Warnings List */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-3 bg-amber-50/20 dark:bg-amber-950/10">
          {activeWarnings.map((item) => {
            const isCritical = item.severity === "critical";
            const isWarning = item.severity === "warning";

            const containerStyle = isCritical
              ? "bg-rose-50/70 border-rose-200/80 text-rose-900 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-200"
              : isWarning
              ? "bg-amber-50/70 border-amber-200/80 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200"
              : "bg-blue-50/60 border-blue-200/80 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-200";

            const iconStyle = isCritical
              ? "text-rose-600 bg-rose-100 border-rose-200 dark:text-red-400 dark:bg-red-950/80 dark:border-red-800"
              : isWarning
              ? "text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-950/80 dark:border-amber-800"
              : "text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-950/80 dark:border-blue-800";

            const tagStyle = isCritical
              ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800"
              : isWarning
              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800"
              : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800";

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 relative shadow-xs ${containerStyle}`}
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
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{item.title}</span>
                        {item.tag && (
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${tagStyle}`}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDismiss(item.id)}
                    className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                    title="إخفاء التنبيه"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Recommendation Callout */}
                {item.recommendation && (
                  <div className="flex items-start gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/30 text-[11px] text-amber-950 dark:text-amber-200 bg-white/80 dark:bg-zinc-950/40 p-2.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-950 dark:text-zinc-200">الإجراء المقترح: </strong>
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
