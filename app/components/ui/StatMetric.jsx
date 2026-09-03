"use client";

import Card from "./Card";

export default function StatMetric({
  label,
  value,
  subtitle = null,
  icon: Icon = null,
  variant = "default", // default | emerald | blue | purple | amber
  className = "",
}) {
  const valueColors = {
    default: "text-[#1A1D1F] dark:text-zinc-100",
    emerald: "text-[#1A1D1F] dark:text-emerald-400",
    blue: "text-[#1A1D1F] dark:text-blue-400",
    purple: "text-[#1A1D1F] dark:text-purple-400",
    amber: "text-[#1A1D1F] dark:text-amber-400",
  };

  const iconBgColors = {
    default: "bg-zinc-100 text-[#575C61] border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60",
    blue: "bg-blue-50 text-[#0B57D0] border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20",
    purple: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60",
    amber: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60",
  };

  return (
    <Card padding="md" className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[#575C61] dark:text-zinc-400 font-bold">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${iconBgColors[variant] || iconBgColors.default}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${valueColors[variant] || valueColors.default}`}>
          {value}
        </div>
        {subtitle && <p className="text-[11px] text-[#575C61] dark:text-zinc-500 font-medium leading-normal">{subtitle}</p>}
      </div>
    </Card>
  );
}
