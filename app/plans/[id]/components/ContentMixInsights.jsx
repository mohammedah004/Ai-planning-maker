"use client";

import { useMemo } from "react";
import {
  calculateObjectiveMix,
  calculateFormatMix,
  generateStrategicInsights,
} from "@/lib/content-insights";
import {
  Lightbulb,
  Layers,
  Target,
} from "lucide-react";

export default function ContentMixInsights({ contentItems = [] }) {
  const objectiveMix = useMemo(() => calculateObjectiveMix(contentItems), [contentItems]);
  const formatMix = useMemo(() => calculateFormatMix(contentItems), [contentItems]);
  const insights = useMemo(
    () => generateStrategicInsights(contentItems, objectiveMix, formatMix),
    [contentItems, objectiveMix, formatMix]
  );

  if (!contentItems || contentItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 text-right">
      {/* 1. Strategic Rule-Based Insights Banner */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 text-[11px] font-extrabold">
                    {insight.badge}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-zinc-100 leading-snug">{insight.title}</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Charts Grid: Objectives Distribution & Format Diversity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objective Mix Breakdown */}
        <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs text-zinc-500">إجمالي {contentItems.length} منشور</span>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Target className="w-4 h-4" />
              <h3 className="text-sm sm:text-base text-zinc-100 font-bold">توزيع أهداف المحتوى (Content Objectives)</h3>
            </div>
          </div>

          <div className="space-y-3.5">
            {objectiveMix
              .filter((obj) => obj.count > 0)
              .map((obj) => (
                <div key={obj.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold">
                      <strong className="text-zinc-100">{obj.count}</strong> منشور ({obj.percentage}%)
                    </span>
                    <span className="font-bold text-zinc-200">{obj.shortLabel}</span>
                  </div>

                  {/* CSS Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${obj.color}`}
                      style={{ width: `${Math.max(obj.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Format Diversity Breakdown */}
        <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs text-zinc-500">تنوع القوالب</span>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <h3 className="text-sm sm:text-base text-zinc-100 font-bold">تنوع القوالب والأشكال (Format Diversity)</h3>
            </div>
          </div>

          <div className="space-y-4">
            {formatMix.map((fmt) => (
              <div key={fmt.key} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-bold">
                    <strong className="text-zinc-100">{fmt.count}</strong> منشور ({fmt.percentage}%)
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                    <span>{fmt.label}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${fmt.color}`}
                    style={{ width: `${Math.max(fmt.percentage, 4)}%` }}
                  />
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed pt-0.5">
                  {fmt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
