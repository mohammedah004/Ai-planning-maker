"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Lock,
  Calendar,
  Layers,
  Target,
  Compass,
  Filter,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import DiagnosisViewer from "@/app/plans/[id]/components/DiagnosisViewer";
import StrategyViewer from "@/app/plans/[id]/components/StrategyViewer";
import PillarCards from "@/app/plans/[id]/components/PillarCards";
import ContentItemCard from "@/app/plans/[id]/components/ContentItemCard";
import PlanCalendarView from "@/app/plans/[id]/components/calendar/PlanCalendarView";
import ContentMixInsights from "@/app/plans/[id]/components/ContentMixInsights";
import LoadingState from "@/app/components/ui/LoadingState";

export default function PublicPlanViewer({ token }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("diagnosis");
  const [formatFilter, setFormatFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function loadPublicPlan() {
      try {
        const res = await fetch(`/api/share/${token}`);
        const json = await res.json();

        if (!isMounted) return;

        if (!res.ok || !json.success) {
          setError(json.error?.message || "تعذر تحميل الخطة التسويقية العامة.");
          setLoading(false);
          return;
        }

        setData(json.data);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading public plan:", err);
        setError("حدث خطأ في الاتصال أثناء تحميل البيانات.");
        setLoading(false);
      }
    }

    loadPublicPlan();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <LoadingState
        variant="fullscreen"
        size="lg"
        title="جاري تجهيز الخطة التسويقية العامة..."
        subtitle="MADAR (مدار) يعرض الاستراتيجية وتقويم المنشورات"
      />
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="p-8 sm:p-10 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 text-center space-y-5 max-w-lg mx-auto shadow-sm text-right">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 dark:bg-zinc-950 dark:border-zinc-800 dark:text-red-400 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1D1F] dark:text-zinc-100 text-center">الخطة غير متاحة</h2>
          <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed text-center">
            {error || "الخطة المطلوبة غير موجودة أو أن رابط المشاركة قد تم إيقافه من قبل صاحب الخطة."}
          </p>
          <div className="pt-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-xs transition-all shadow-sm"
            >
              <span>البدء وإنشاء خطتك الخاصة</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { plan, strategy, pillars, objectiveDistribution, contentItems } = data;

  const filteredItems =
    formatFilter === "all"
      ? contentItems
      : contentItems.filter((item) => item.postType?.toLowerCase() === formatFilter);

  const formattedDate = plan.createdAt
    ? new Date(plan.createdAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-[#1A1D1F] dark:text-zinc-100 selection:bg-blue-100 selection:text-[#0B57D0] dark:selection:bg-blue-600 dark:selection:text-white pb-32">
      {/* Header */}
      <header className="border-b border-[#E4E7EC] dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1A1D1F] dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-[#0B57D0] flex items-center justify-center text-white text-[10px] font-black">
              AI
            </div>
            <span>AI Marketing Planner</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800/60 px-3 py-1 rounded-full font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>عرض عام للعرض والتنفيذ</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Banner Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs space-y-6 text-right">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E4E7EC] dark:border-zinc-800 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D1F] dark:text-zinc-100">
                  خطة تسويقية: {plan.productName}
                </h1>
                <span className="text-xs px-3 py-1 rounded-xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 text-[#0B57D0] dark:text-blue-400 font-bold shadow-xs">
                  {plan.productCategory}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 mt-2 leading-relaxed">
                الهدف التسويقي:{" "}
                <strong className="text-[#1A1D1F] dark:text-zinc-200 font-bold">
                  {plan.marketingObjective?.replace(/_/g, " ")}
                </strong>
                {formattedDate && (
                  <span className="mr-4 text-[#575C61] dark:text-zinc-500 font-normal">
                    • تاريخ الإنشاء: {formattedDate}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 text-[#1A1D1F] dark:text-zinc-300 text-xs font-bold shadow-xs">
                <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>نسخة معتمدة للقراءة والتنفيذ</span>
              </span>
            </div>
          </div>

          {/* Key Indicators Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 shadow-xs">
              <span className="block text-[10px] text-[#575C61] dark:text-zinc-500 mb-1 font-bold">عدد المنشورات</span>
              <span className="text-base font-extrabold text-[#1A1D1F] dark:text-zinc-100">30 منشوراً يومياً</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 shadow-xs">
              <span className="block text-[10px] text-[#575C61] dark:text-zinc-500 mb-1 font-bold">القناة المستهدفة</span>
              <span className="text-base font-extrabold text-purple-700 dark:text-purple-300">Instagram</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 shadow-xs">
              <span className="block text-[10px] text-[#575C61] dark:text-zinc-500 mb-1 font-bold">النبرة الصوتية</span>
              <span className="text-xs font-bold text-[#0B57D0] dark:text-blue-400 truncate block">
                {Array.isArray(plan.brandTone) ? plan.brandTone.join(" • ") : plan.brandTone || "احترافية"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-[#E4E7EC] dark:border-zinc-800 shadow-xs">
              <span className="block text-[10px] text-[#575C61] dark:text-zinc-500 mb-1 font-bold">حالة الخطة</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>جاهزة للتطبيق</span>
              </span>
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E7EC] dark:border-zinc-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("diagnosis")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "diagnosis"
                ? "bg-[#0B57D0] text-white shadow-sm"
                : "bg-[#F8F9FB] text-[#575C61] hover:bg-[#F0F4F8] hover:text-[#1A1D1F] border border-[#E4E7EC] dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>التشخيص الاستراتيجي (Diagnosis)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "calendar"
                ? "bg-[#0B57D0] text-white shadow-sm"
                : "bg-[#F8F9FB] text-[#575C61] hover:bg-[#F0F4F8] hover:text-[#1A1D1F] border border-[#E4E7EC] dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:border-transparent"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>تقويم الـ 30 يوماً ({contentItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("insights")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "insights"
                ? "bg-[#0B57D0] text-white shadow-sm"
                : "bg-[#F8F9FB] text-[#575C61] hover:bg-[#F0F4F8] hover:text-[#1A1D1F] border border-[#E4E7EC] dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:border-transparent"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>تحليلات توزيع المحتوى</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("strategy")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "strategy"
                ? "bg-[#0B57D0] text-white shadow-sm"
                : "bg-[#F8F9FB] text-[#575C61] hover:bg-[#F0F4F8] hover:text-[#1A1D1F] border border-[#E4E7EC] dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:border-transparent"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>ملخص الاستراتيجية والجمهور</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pillars")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pillars"
                ? "bg-[#0B57D0] text-white shadow-sm"
                : "bg-[#F8F9FB] text-[#575C61] hover:bg-[#F0F4F8] hover:text-[#1A1D1F] border border-[#E4E7EC] dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:border-transparent"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>محاور المحتوى</span>
          </button>
        </div>

        {/* Tab 1: Strategic Business Diagnosis */}
        {activeTab === "diagnosis" && (
          <DiagnosisViewer
            strategy={strategy}
            plan={plan}
            onSwitchTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Tab 2: 30-Day Content Calendar */}
        {activeTab === "calendar" && (
          <PlanCalendarView
            contentItems={contentItems}
            planId={plan.id}
            readOnly={true}
          />
        )}

        {/* Tab 3: Content Mix Analytics */}
        {activeTab === "insights" && (
          <ContentMixInsights contentItems={contentItems} />
        )}

        {/* Tab 4: Strategy & Audience Analysis */}
        {activeTab === "strategy" && (
          <StrategyViewer strategy={strategy} plan={plan} />
        )}

        {/* Tab 5: Content Pillars */}
        {activeTab === "pillars" && (
          <PillarCards pillars={pillars} />
        )}

        {/* Bottom Conversion / Viral Footer */}
        <footer className="pt-12">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 text-center space-y-5 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-600/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
              <Globe className="w-6 h-6" />
            </div>

            <div className="max-w-2xl mx-auto space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1A1D1F] dark:text-zinc-100">
                تم إعداد وتنسيق هذه الخطة بواسطة منصة AI Marketing Planner
              </h3>
              <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed">
                هل تريد خطة تسويقية متكاملة ومصممة لمنتجك أو مشروعك خلال ثوانٍ؟ ابدأ خطتك التسويقية الذكية الآن.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white font-extrabold text-xs sm:text-sm transition-all shadow-sm"
              >
                <span>ابدأ خطتك التسويقية الذكية الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
