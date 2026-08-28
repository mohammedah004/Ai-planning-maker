"use client";

import { Layers } from "lucide-react";

export default function PillarCards({ pillars = [] }) {
  if (!pillars || pillars.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-zinc-400 text-sm">
        لا توجد محاور محتوى محددة لهذه الخطة.
      </div>
    );
  }

  const colorVariants = [
    { border: "border-blue-800/60", bg: "bg-blue-950/40", text: "text-blue-400", bar: "bg-blue-500" },
    { border: "border-purple-800/60", bg: "bg-purple-950/40", text: "text-purple-300", bar: "bg-purple-500" },
    { border: "border-pink-800/60", bg: "bg-pink-950/40", text: "text-pink-300", bar: "bg-pink-500" },
    { border: "border-emerald-800/60", bg: "bg-emerald-950/40", text: "text-emerald-300", bar: "bg-emerald-500" },
    { border: "border-amber-800/60", bg: "bg-amber-950/40", text: "text-amber-300", bar: "bg-amber-500" },
  ];

  return (
    <div className="space-y-4 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillars.map((pillar, idx) => {
          const color = colorVariants[idx % colorVariants.length];
          const percentage = pillar.percentage || Math.round(100 / pillars.length);

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                {/* Header with name and percentage badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full ${color.bg} ${color.text} border ${color.border} text-xs font-bold`}>
                    {percentage}% من المحتوى
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-100 text-sm">
                    <Layers className={`w-4 h-4 ${color.text}`} />
                    <span>المحور {idx + 1}</span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-zinc-100 leading-snug">{pillar.name}</h3>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              {/* Progress bar representing pillar percentage */}
              <div className="space-y-1 pt-2 border-t border-zinc-800">
                <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color.bar}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
