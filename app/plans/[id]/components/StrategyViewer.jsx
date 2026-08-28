"use client";

import {
  Target,
  AlertCircle,
  CheckCircle2,
  Compass,
  Megaphone,
  Zap,
} from "lucide-react";

export default function StrategyViewer({ strategy = {}, plan = {} }) {
  if (!strategy || Object.keys(strategy).length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-zinc-400 text-sm">
        لا توجد تفاصيل استراتيجية متاحة لهذه الخطة.
      </div>
    );
  }

  const painPoints = Array.isArray(strategy.pain_points)
    ? strategy.pain_points
    : strategy.pain_points ? [strategy.pain_points] : [];

  const desiredOutcomes = Array.isArray(strategy.desired_outcomes)
    ? strategy.desired_outcomes
    : strategy.desired_outcomes ? [strategy.desired_outcomes] : [];

  const messagingAngles = Array.isArray(strategy.messaging_angles)
    ? strategy.messaging_angles
    : strategy.messaging_angles ? [strategy.messaging_angles] : [];

  return (
    <div className="space-y-6 text-right">
      {/* 1. Target Audience Analysis */}
      {strategy.target_audience_analysis && (
        <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm border-b border-zinc-800 pb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base text-zinc-100 font-bold">التحليل الاستراتيجي للجمهور المستهدف</h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {strategy.target_audience_analysis}
          </p>
        </div>
      )}

      {/* 2. Pain Points & Desired Outcomes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pain Points */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm pb-2.5 border-b border-zinc-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <h4 className="text-sm font-bold text-zinc-100">نقاط الألم والمخاوف (Pain Points)</h4>
          </div>
          {painPoints.length > 0 ? (
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              {painPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-2" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500">تم استخلاصها وتحليلها في نصوص المنشورات.</p>
          )}
        </div>

        {/* Desired Outcomes */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm pb-2.5 border-b border-zinc-800">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <h4 className="text-sm font-bold text-zinc-100">النتائج والتحول المرجو (Desired Outcomes)</h4>
          </div>
          {desiredOutcomes.length > 0 ? (
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              {desiredOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500">تم استخلاصها وتوجيهها في عروض المنتج.</p>
          )}
        </div>
      </div>

      {/* 3. Positioning & Messaging Angles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Positioning */}
        {strategy.positioning && (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm pb-2.5 border-b border-zinc-800">
              <Compass className="w-4 h-4 shrink-0" />
              <h4 className="text-sm font-bold text-zinc-100">التموضع والرسالة الفريدة (Positioning)</h4>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {strategy.positioning}
            </p>
          </div>
        )}

        {/* Messaging Angles */}
        {messagingAngles.length > 0 && (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-sm pb-2.5 border-b border-zinc-800">
              <Zap className="w-4 h-4 shrink-0" />
              <h4 className="text-sm font-bold text-zinc-100">زوايا الخطاب الإعلاني (Messaging Angles)</h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
              {messagingAngles.map((angle, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0 mt-2" />
                  <span>{angle}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4. CTA Strategy */}
      {strategy.cta_strategy && (
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100">استراتيجية الدعوة لاتخاذ إجراء (CTA Strategy)</h4>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
              {strategy.cta_strategy}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
