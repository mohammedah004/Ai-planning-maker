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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1A1D1F] dark:text-zinc-300">
          <Filter className="w-4 h-4 text-[#0B57D0] dark:text-blue-400" />
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
                  ? "bg-[#0B57D0] text-white shadow-sm border border-[#0B57D0]"
                  : "bg-white dark:bg-zinc-900 text-[#575C61] dark:text-zinc-400 hover:text-[#1A1D1F] dark:hover:text-zinc-100 hover:bg-[#F0F4F8] dark:hover:bg-zinc-800 border border-[#E4E7EC] dark:border-zinc-800 shadow-xs"
              }`}
            >
              <span>{f.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-black/30 opacity-80 tabular-nums">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty Filter State */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800 text-center text-[#575C61] dark:text-zinc-400 text-sm space-y-2 shadow-xs">
          <p className="font-bold text-[#1A1D1F] dark:text-zinc-200">لا توجد منشورات تطابق هذا القالب</p>
          <p className="text-xs text-[#575C61] dark:text-zinc-500">اختر قالباً آخر أو اضغط على &quot;جميع المنشورات&quot; لاستعراض الشهر كاملاً.</p>
        </div>
      ) : (
        /* Weekly Sectioned Calendar Grid */
        <div className="space-y-10">
          {weeks.map((week, idx) => (
            <div key={week.title} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC] dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0B57D0]" />
                  <h3 className="text-sm font-extrabold text-[#1A1D1F] dark:text-zinc-200 tracking-tight">
                    {week.title}
                  </h3>
                </div>
                <span className="text-xs text-[#575C61] dark:text-zinc-500 font-medium tabular-nums">
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
