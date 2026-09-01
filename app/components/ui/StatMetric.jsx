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
    default: "text-zinc-100",
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
  };

  const iconBgColors = {
    default: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    emerald: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
    blue: "bg-blue-600/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-950/60 text-purple-400 border-purple-800/60",
    amber: "bg-amber-950/60 text-amber-400 border-amber-800/60",
  };

  return (
    <Card padding="md" className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-400 font-bold">{label}</span>
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
        {subtitle && <p className="text-[11px] text-zinc-500 font-medium leading-normal">{subtitle}</p>}
      </div>
    </Card>
  );
}
