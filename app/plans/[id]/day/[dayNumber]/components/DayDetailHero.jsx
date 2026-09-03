"use client";

import Link from "next/link";
import {
  ArrowRight,
  Film,
  Layers,
  Image as ImageIcon,
  Zap,
  Target,
  RefreshCw,
  Play,
  Quote,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";

const formatObjective = (obj) => {
  const map = {
    awareness: "توعية وجذب (Top of Funnel)",
    education: "تعليم وقيمة (Middle of Funnel)",
    engagement: "تفاعل ومجتمع (Community)",
    trust: "بناء ثقة ومصداقية (Trust & Authority)",
    social_proof: "إثبات اجتماعي (Social Proof)",
    objection_handling: "تفنيد الاعتراضات (Objection Handling)",
    conversion: "تحويل ومبيعات (Bottom of Funnel)",
  };
  return map[obj?.toLowerCase()] || obj || "استراتيجي";
};

export default function DayDetailHero({
  item,
  planId,
  planTitle = "",
  onRegenerate = null,
  readOnly = false,
  className = "",
}) {
  const dayNumber = item.dayNumber || item.day_number;
  const postType = (item.postType || item.post_type || "").toLowerCase();

  const isReel = postType === "reel";
  const isCarousel = postType === "carousel";
  const isStory = postType === "story";
  const isStaticPost = postType === "static_post" || postType === "post";

  const headline = item.designCopy?.headline || item.caption?.slice(0, 80);

  return (
    <div className={`space-y-6 text-right ${className}`}>
      {/* Back to Plan Navigation Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E4E7EC] dark:border-zinc-800/80">
        <Link
          href={`/plans/${planId}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#575C61] hover:text-[#1A1D1F] dark:text-zinc-400 dark:hover:text-zinc-100 font-bold transition-colors group"
        >
          <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>العودة إلى مساحة الخطة {planTitle ? `(${planTitle})` : ""}</span>
        </Link>

        {!readOnly && onRegenerate && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRegenerate(item)}
            startIcon={RefreshCw}
          >
            إعادة صياغة المنشور بـ AI
          </Button>
        )}
      </div>

      {/* Main Day Hero Canvas matching Format Visual DNA */}
      <div
        className={`
          relative rounded-3xl border p-6 sm:p-8 overflow-hidden shadow-xs dark:shadow-2xl space-y-5
          ${
            isReel
              ? "bg-gradient-to-br from-purple-50 via-white to-purple-100/30 border-purple-200 dark:from-[#1b1426] dark:via-[#131316] dark:to-[#0d0d10] dark:border-purple-800/50"
              : isCarousel
              ? "bg-gradient-to-br from-blue-50 via-white to-blue-100/30 border-blue-200 dark:from-[#121b2d] dark:via-[#131316] dark:to-[#0d0d10] dark:border-blue-800/50"
              : isStory
              ? "bg-gradient-to-br from-amber-50 via-white to-amber-100/30 border-amber-200 dark:from-[#231b12] dark:via-[#131316] dark:to-[#0d0d10] dark:border-amber-800/50"
              : "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/30 border-emerald-200 dark:from-[#131e17] dark:via-[#131316] dark:to-[#0d0d10] dark:border-emerald-800/50"
          }
        `}
      >
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-xl bg-[#0B57D0] text-white dark:bg-zinc-100 dark:text-zinc-950 font-black text-sm shadow-xs tabular-nums">
              اليوم {dayNumber}
            </span>

            {isReel && (
              <Badge variant="purple" size="md" icon={Film}>
                فيديو ريلز (Reel)
              </Badge>
            )}
            {isCarousel && (
              <Badge variant="blue" size="md" icon={Layers}>
                منشور كاروسيل متعدد الشرائح
              </Badge>
            )}
            {isStaticPost && (
              <Badge variant="emerald" size="md" icon={ImageIcon}>
                منشور ثابت أحادي (Post)
              </Badge>
            )}
            {isStory && (
              <Badge variant="amber" size="md" icon={Zap}>
                ستوري تفاعلي 9:16
              </Badge>
            )}

            {item.contentPillar && (
              <span className="px-3 py-1 rounded-xl bg-white dark:bg-zinc-900/80 border border-[#E4E7EC] dark:border-zinc-700 text-[#1A1D1F] dark:text-zinc-200 text-xs font-bold shadow-xs">
                محور: {item.contentPillar}
              </span>
            )}
          </div>

          <div className="text-xs font-bold text-[#575C61] dark:text-zinc-400">
            {formatObjective(item.contentObjective)}
          </div>
        </div>

        {/* Hero Title & Format Visual Accent */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1A1D1F] dark:text-zinc-100 tracking-tight leading-snug">
              {headline || `محتوى اليوم ${dayNumber}`}
            </h1>
            <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
              بريف المحتوى والتوجيه البصري والصياغة اليومية الجاهزة للنشر والجدولة على إنستغرام.
            </p>
          </div>

          {/* Visual Format DNA Stamp */}
          <div className="shrink-0 self-start md:self-center">
            {isReel && (
              <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-600/20 dark:border-purple-500/40 dark:text-purple-300 flex items-center justify-center shadow-xs">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            )}
            {isCarousel && (
              <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 text-[#0B57D0] dark:bg-blue-600/20 dark:border-blue-500/40 dark:text-blue-300 flex items-center justify-center shadow-xs">
                <Layers className="w-8 h-8" />
              </div>
            )}
            {isStaticPost && (
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-600/20 dark:border-emerald-500/40 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                <Quote className="w-8 h-8" />
              </div>
            )}
            {isStory && (
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-600/20 dark:border-amber-500/40 dark:text-amber-300 flex items-center justify-center shadow-xs">
                <Zap className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
