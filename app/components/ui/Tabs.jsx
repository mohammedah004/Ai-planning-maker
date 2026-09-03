"use client";

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#F8F9FB] dark:bg-[#09090b] border border-[#E4E7EC] dark:border-zinc-800/80 ${className}`}>
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
                  ? "bg-[#0B57D0] text-white shadow-sm border border-[#0B57D0] dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700/60"
                  : "bg-transparent text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/80 border border-transparent"
              }
            `.trim()}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white dark:text-blue-400" : "text-[#575C61] dark:text-zinc-500"}`} />}
            <span>{tab.label}</span>
            {typeof tab.count !== "undefined" && (
              <span
                className={`
                  px-1.5 py-0.2 text-[10px] rounded-full border tabular-nums
                  ${
                    isActive
                      ? "bg-white/20 text-white border-white/30 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/80 font-extrabold"
                      : "bg-[#E4E7EC] text-[#575C61] border-[#E4E7EC] dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800"
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
