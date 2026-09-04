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
    default: "text-slate-900 dark:text-zinc-100",
    emerald: "text-slate-900 dark:text-emerald-400",
    blue: "text-slate-900 dark:text-blue-400",
    purple: "text-slate-900 dark:text-purple-400",
    amber: "text-slate-900 dark:text-amber-400",
  };

  const iconBgColors = {
    default: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60",
    emerald: "bg-emerald-50/80 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60",
    blue: "bg-blue-50/80 text-blue-700 border-blue-200/80 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20",
    purple: "bg-violet-50/80 text-violet-700 border-violet-200/80 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60",
    amber: "bg-amber-50/80 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60",
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
