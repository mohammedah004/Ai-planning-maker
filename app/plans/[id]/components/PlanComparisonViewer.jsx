"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  History,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Clock,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { comparePlans } from "@/lib/plan-comparison";

export default function PlanComparisonViewer({
  currentPlan = {},
  previousPlan = null,
  currentItems = [],
  previousItems = [],
}) {
  const comparison = useMemo(() => {
    return comparePlans(currentPlan, previousPlan, currentItems, previousItems);
  }, [currentPlan, previousPlan, currentItems, previousItems]);

  if (!comparison.hasComparison) {
    return (
      <div className="p-6 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/60 border border-[#E4E7EC] dark:border-zinc-800/80 text-right space-y-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-bold text-[#0B57D0] dark:text-blue-400">
          <History className="w-4 h-4" />
          <span>ذاكرة البراند الذكية (Brand Memory)</span>
        </div>
        <p className="text-xs text-[#1A1D1F] dark:text-zinc-300 leading-relaxed">
          {comparison.summary}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[#575C61] dark:text-zinc-500 pt-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>الخطط القادمة لهذا البراند ستستفيد تلقائياً من مخرجات هذه الخطة ولن تكرر نفس الأفكار.</span>
        </div>
      </div>
    );
  }

  const { shifts, metricsDelta, pillarsComparison, summary, previousPlanId, previousPlanDate } = comparison;

  return (
    <div className="space-y-6 text-right">
      {/* Comparison Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#F8F9FB] via-white to-blue-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/20 border border-[#E4E7EC] dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1D1F] dark:text-zinc-100">تطور الاستراتيجية عبر ذاكرة البراند</h3>
              <p className="text-xs text-[#575C61] dark:text-zinc-400">
                مقارنة ذكية مع الخطة السابقة المؤرخة في <strong className="text-[#1A1D1F] dark:text-zinc-200">{previousPlanDate}</strong>
              </p>
            </div>
          </div>

          {previousPlanId && (
            <Link
              href={`/plans/${previousPlanId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 hover:bg-[#F0F4F8] dark:hover:border-zinc-700 text-[#1A1D1F] dark:text-zinc-300 dark:hover:text-zinc-100 text-xs font-bold transition-colors self-start sm:self-auto shadow-xs"
            >
              <span>استعراض الخطة السابقة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-950/50 p-4 rounded-xl border border-[#E4E7EC] dark:border-zinc-800/60 shadow-xs">
          {summary}
        </p>
      </div>

      {/* 1. Format Distribution Shifts Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0B57D0] dark:text-blue-400" />
          <span>التحولات في توزيع القوالب البصرية:</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metricsDelta.map((metric, idx) => {
            const isUp = metric.direction === "up";
            const isDown = metric.direction === "down";

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-2 shadow-xs"
              >
                <span className="block text-[11px] font-bold text-[#575C61] dark:text-zinc-400">{metric.label}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-black text-[#1A1D1F] dark:text-zinc-100">{metric.current}</span>
                  <span
                    className={`inline-flex items-center text-xs font-extrabold ${
                      isUp ? "text-emerald-600 dark:text-emerald-400" : isDown ? "text-amber-600 dark:text-amber-400" : "text-[#575C61] dark:text-zinc-500"
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : isDown ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                    <span>{metric.delta}</span>
                  </span>
                </div>
                <span className="block text-[10px] text-[#575C61] dark:text-zinc-500">
                  السابق: {metric.previous}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Content Pillars Evolution */}
      <div className="p-6 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 space-y-4 shadow-xs">
        <h4 className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-700 dark:text-purple-400" />
          <span>تطور ركائز ومحاور المحتوى:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Retained Pillars */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-2 shadow-xs">
            <span className="block text-[11px] font-bold text-[#0B57D0] dark:text-blue-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>محاور أساسية مستمرة ({pillarsComparison.retained.length}):</span>
            </span>
            {pillarsComparison.retained.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {pillarsComparison.retained.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-950/40 dark:border-blue-800/40 dark:text-blue-300 text-xs">
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#575C61] dark:text-zinc-500 text-[11px]">تم استبدال جميع المحاور بأفكار جديدة كلياً.</p>
            )}
          </div>

          {/* Newly Added Pillars */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-2 shadow-xs">
            <span className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>محاور متجددة ومستحدثة ({pillarsComparison.added.length}):</span>
            </span>
            {pillarsComparison.added.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {pillarsComparison.added.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300 text-xs">
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#575C61] dark:text-zinc-500 text-[11px]">تم الحفاظ على نفس المحاور لتعميق ترسيخها.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Strategic Shifts Cards */}
      {shifts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>التحولات والقرارات الاستراتيجية المسجلة:</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shifts.map((shift, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 space-y-1.5 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B57D0]" />
                  <h5 className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-200">{shift.title}</h5>
                </div>
                <p className="text-xs text-[#575C61] dark:text-zinc-400 leading-relaxed pr-4">{shift.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
