"use client";

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#09090b] border border-zinc-800/80 ${className}`}>
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
                  ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent"
              }
            `.trim()}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-zinc-500"}`} />}
            <span>{tab.label}</span>
            {typeof tab.count !== "undefined" && (
              <span
                className={`
                  px-1.5 py-0.2 text-[10px] rounded-full border tabular-nums
                  ${
                    isActive
                      ? "bg-blue-950/80 text-blue-300 border-blue-800/80 font-extrabold"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800"
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
