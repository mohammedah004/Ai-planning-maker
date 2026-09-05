"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Lightbulb, Sparkles, RefreshCw } from "lucide-react";
import { GENERATION_INSIGHTS } from "@/app/data/generation-insights";

/**
 * Maps the job status / step identifier to one of the 4 insight stage keys
 */
function resolveStageKey(currentStep) {
  if (!currentStep) return "strategy";
  const step = String(currentStep).toLowerCase();

  if (step.includes("strategy") || step === "queued") return "strategy";
  if (step.includes("pillar")) return "pillars";
  if (step.includes("content")) return "content";
  if (step.includes("export") || step.includes("sheet")) return "export";

  return "strategy";
}

const STAGE_BADGES = {
  strategy: "التشخيص والاستراتيجية",
  pillars: "المحاور وتوزيع الأهداف",
  content: "صناعة المحتوى والكابشن",
  export: "جدولة وتصدير الخطة",
};

export default function GenerationInsightCard({
  currentStep = "generating_strategy",
  productCategory = "general",
  className = "",
}) {
  const stageKey = useMemo(() => resolveStageKey(currentStep), [currentStep]);

  // Filter insights suitable for the active stage and product category
  const suitableInsights = useMemo(() => {
    const stageItems = GENERATION_INSIGHTS.filter((item) => item.stage === stageKey);
    if (stageItems.length === 0) return GENERATION_INSIGHTS;

    const categorySpecific = productCategory && productCategory !== "general"
      ? stageItems.filter((item) => item.category === productCategory)
      : [];

    const generalItems = stageItems.filter((item) => item.category === "general");

    // Combine category-specific and general items
    const combined = [...categorySpecific, ...generalItems];
    return combined.length > 0 ? combined : stageItems;
  }, [stageKey, productCategory]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const timerRef = useRef(null);
  const currentIndexRef = useRef(0);

  // Keep ref synchronized
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Pick the next index ensuring no immediate repetition (if length > 1)
  const getNextIndex = useCallback(() => {
    const total = suitableInsights.length;
    if (total <= 1) return 0;

    let nextIdx = Math.floor(Math.random() * total);
    if (nextIdx === currentIndexRef.current) {
      nextIdx = (nextIdx + 1) % total;
    }
    return nextIdx;
  }, [suitableInsights.length]);

  // Transition to next tip with smooth fade effect
  const transitionToNext = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(getNextIndex());
      setIsFading(false);
    }, 300);
  }, [getNextIndex]);

  // Reset index when stageKey changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFading(false);
  }, [stageKey]);

  // Set up 13-second auto-rotation timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      transitionToNext();
    }, 13000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [transitionToNext, stageKey]);

  // Manual trigger button resets the timer and immediately swaps tip
  const handleManualNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    transitionToNext();
    timerRef.current = setInterval(() => {
      transitionToNext();
    }, 13000);
  };

  const currentTip = suitableInsights[currentIndex] || suitableInsights[0];

  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950/80 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs text-right space-y-3 transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E4E7EC]/60 dark:border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1A1D1F] dark:text-zinc-100 flex items-center gap-1.5">
              <span>إضاءة استراتيجية للمرحلة</span>
              <Sparkles className="w-3 h-3 text-[#0B57D0] dark:text-blue-400" />
            </span>
            <span className="text-[11px] text-[#575C61] dark:text-zinc-400">
              {STAGE_BADGES[stageKey]}
            </span>
          </div>
        </div>

        {/* Manual Refresh Button */}
        <button
          type="button"
          onClick={handleManualNext}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-[#575C61] hover:text-[#1A1D1F] dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 border border-[#E4E7EC] dark:border-zinc-800 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
          title="عرض نصيحة أخرى"
        >
          <RefreshCw className="w-3 h-3 text-[#0B57D0] dark:text-blue-400" />
          <span>نصيحة أخرى</span>
        </button>
      </div>

      {/* Rotating Tip Content with Fade Transition */}
      <div className="min-h-[52px] flex items-center">
        <p
          className={`text-xs sm:text-sm text-[#1A1D1F] dark:text-zinc-200 leading-relaxed font-medium transition-opacity duration-500 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentTip?.text}
        </p>
      </div>
    </div>
  );
}
