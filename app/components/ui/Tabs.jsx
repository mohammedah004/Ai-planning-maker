"use client";

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer select-none
              ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs border border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                  : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/80 border border-transparent"
              }
            `.trim()}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white dark:text-slate-900" : "text-slate-500 dark:text-zinc-500"}`} />}
            <span>{tab.label}</span>
            {typeof tab.count !== "undefined" && (
              <span
                className={`
                  px-1.5 py-0.2 text-[10px] rounded-full border tabular-nums
                  ${
                    isActive
                      ? "bg-white/20 text-white border-white/30 dark:bg-black/10 dark:text-slate-900 dark:border-black/10 font-extrabold"
                      : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800"
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
