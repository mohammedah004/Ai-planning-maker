"use client";

import { useState } from "react";
import { Filter, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import ContentCard from "../cards/ContentCard";
import RegenerateModal from "../RegenerateModal";

export default function PlanCalendarView({
  contentItems = [],
  planId,
  onItemUpdate = null,
  readOnly = false,
  className = "",
}) {
  const [formatFilter, setFormatFilter] = useState("all");
  const [selectedItemForRegenerate, setSelectedItemForRegenerate] = useState(null);

  const filteredItems = formatFilter === "all"
    ? contentItems
    : contentItems.filter((item) => (item.postType || item.post_type || "").toLowerCase() === formatFilter);

  const handleRegenerateSuccess = (updatedItem) => {
    if (onItemUpdate) {
      onItemUpdate(updatedItem);
    }
    setSelectedItemForRegenerate(null);
  };

  // Chronological 7-day week chunks for clear editorial scanning
  const weeks = [
    { title: "الأسبوع الأول (الأيام 1 - 7)", items: filteredItems.filter((i) => i.dayNumber >= 1 && i.dayNumber <= 7) },
    { title: "الأسبوع الثاني (الأيام 8 - 14)", items: filteredItems.filter((i) => i.dayNumber >= 8 && i.dayNumber <= 14) },
    { title: "الأسبوع الثالث (الأيام 15 - 21)", items: filteredItems.filter((i) => i.dayNumber >= 15 && i.dayNumber <= 21) },
    { title: "الأسبوع الرابع (الأيام 22 - 28)", items: filteredItems.filter((i) => i.dayNumber >= 22 && i.dayNumber <= 28) },
    { title: "ختام الشهر (الأيام 29 - 30)", items: filteredItems.filter((i) => i.dayNumber >= 29 && i.dayNumber <= 30) },
  ].filter((w) => w.items.length > 0);

  return (
    <div className={`space-y-8 text-right ${className}`}>
      {/* Top Filter Bar (Preserved existing format filter functionality) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#131316] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-300">
          <Filter className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          <span>تصفية بحسب القالب البصري:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "جميع المنشورات", count: contentItems.length },
            { id: "reel", label: "ريلز (Reels)", count: contentItems.filter((i) => (i.postType || i.post_type) === "reel").length },
            { id: "carousel", label: "كاروسيل", count: contentItems.filter((i) => (i.postType || i.post_type) === "carousel").length },
            { id: "static_post", label: "منشور ثابت", count: contentItems.filter((i) => (i.postType || i.post_type) === "static_post" || (i.postType || i.post_type) === "post").length },
            { id: "story", label: "ستوري", count: contentItems.filter((i) => (i.postType || i.post_type) === "story").length },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormatFilter(f.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                formatFilter === f.id
                  ? "bg-slate-900 text-white shadow-xs border border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                  : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md tabular-nums ${
                  formatFilter === f.id
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-900 font-extrabold"
                    : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty Filter State */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#131316] border border-slate-200/80 dark:border-zinc-800 text-center text-slate-600 dark:text-zinc-400 text-sm space-y-2 shadow-xs">
          <p className="font-bold text-slate-900 dark:text-zinc-200">لا توجد منشورات تطابق هذا القالب</p>
          <p className="text-xs text-slate-500 dark:text-zinc-500">اختر قالباً آخر أو اضغط على &quot;جميع المنشورات&quot; لاستعراض الشهر كاملاً.</p>
        </div>
      ) : (
        /* Weekly Sectioned Calendar Grid */
        <div className="space-y-10">
          {weeks.map((week, idx) => (
            <div key={week.title} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-zinc-300" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-200 tracking-tight">
                    {week.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium tabular-nums">
                  {week.items.length} منشورات
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {week.items.map((item) => (
                  <ContentCard
                    key={item.id || item.dayNumber}
                    item={item}
                    planId={planId}
                    readOnly={readOnly}
                    onRegenerate={(selected) => setSelectedItemForRegenerate(selected)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Single-Post Regeneration Modal */}
      {!readOnly && planId && selectedItemForRegenerate && (
        <RegenerateModal
          isOpen={Boolean(selectedItemForRegenerate)}
          onClose={() => setSelectedItemForRegenerate(null)}
          planId={planId}
          item={selectedItemForRegenerate}
          onSuccess={handleRegenerateSuccess}
        />
      )}
    </div>
  );
}
