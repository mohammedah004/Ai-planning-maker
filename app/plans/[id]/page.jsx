"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Clock,
  Target,
  Calendar,
  XCircle,
  Compass,
  Filter,
  Share2,
} from "lucide-react";
import StrategyViewer from "./components/StrategyViewer";
import PillarCards from "./components/PillarCards";
import ContentItemCard from "./components/ContentItemCard";
import ContentMixInsights from "./components/ContentMixInsights";
import ShareModal from "./components/ShareModal";

export default function PlanDetailPage({ params }) {
  const resolvedParams = use(params);
  const planId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToken, setShareToken] = useState(null);

  // Viewer state: "calendar" | "insights" | "strategy" | "pillars"
  const [activeTab, setActiveTab] = useState("calendar");
  const [formatFilter, setFormatFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function getInitialStatus() {
      try {
        const res = await fetch(`/api/plans/${planId}/status`);
        const json = await res.json();

        if (!isMounted) return;

        if (!res.ok || !json.success) {
          setError(json.error?.message || "تعذر جلب تفاصيل الخطة.");
          setLoading(false);
          return;
        }

        setStatusData(json.data);
        setLoading(false);

        if (json.data?.plan?.status === "completed" || json.data?.job?.status === "completed") {
          loadPlanContent();
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Status check error:", err);
        setError("حدث خطأ في الاتصال أثناء تحديث الحالة.");
        setLoading(false);
      }
    }

    getInitialStatus();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/plans/${planId}/status`);
        const json = await res.json();
        if (isMounted && json.success) {
          setStatusData(json.data);
          if (json.data?.plan?.status === "completed" || json.data?.job?.status === "completed") {
            clearInterval(interval);
            loadPlanContent();
          } else if (json.data?.plan?.status === "failed" || json.data?.job?.status === "failed") {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Background poll error:", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [planId]);

  const loadPlanContent = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/plans/${planId}/content`);
      const json = await res.json();
      if (json.success && json.data) {
        setContentData(json.data);
      }
    } catch (err) {
      console.error("Error loading plan content:", err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/plans/${planId}/retry`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setError(null);
        const resPoll = await fetch(`/api/plans/${planId}/status`);
        const jsonPoll = await resPoll.json();
        if (jsonPoll.success) setStatusData(jsonPoll.data);
      } else {
        setError(json.error?.message || "تعذرت إعادة محاولة التوليد.");
      }
    } catch (err) {
      console.error("Retry error:", err);
      setError("تعذرت إعادة المحاولة. يرجى التحقق من اتصالك بالإنترنت.");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("هل أنت متأكد من إلغاء عملية التوليد؟ سيتم تحرير الحساب فوراً للبدء من جديد.")) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/plans/${planId}/cancel`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        router.push("/plans/new");
      } else {
        alert(json.error?.message || "تعذر إلغاء العملية.");
        setIsCancelling(false);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("تعذر الإلغاء. يرجى المحاولة مجدداً.");
      setIsCancelling(false);
    }
  };

  const steps = [
    {
      id: "strategy",
      label: "المرحلة 1: تحليل الاستراتيجية والجمهور",
      description: "استخراج نقاط الألم والمحفزات النفسية وزوايا التموضع الفريدة",
      activeStates: ["generating_strategy"],
      completedStates: ["generating_pillars", "generating_content", "exporting_sheet", "completed"],
    },
    {
      id: "pillars",
      label: "المرحلة 2: محاور المحتوى وتوزيع الأهداف",
      description: "موازنة أهداف التوعية، التعليم، الثقة، التفاعل، والمبيعات",
      activeStates: ["generating_pillars"],
      completedStates: ["generating_content", "exporting_sheet", "completed"],
    },
    {
      id: "content",
      label: "المرحلة 3: تقويم منشورات إنستغرام لـ 30 يوماً",
      description: "صياغة الكابشن اليومي، نصوص التصاميم المقسمة، والتوجيه البصري",
      activeStates: ["generating_content"],
      completedStates: ["exporting_sheet", "completed"],
    },
    {
      id: "export",
      label: "المرحلة 4: تصدير وتنسيق Google Sheet",
      description: "إنشاء ملف منظم بتبويبين مع تجميد الترويسة والتنسيق اللوني",
      activeStates: ["exporting_sheet"],
      completedStates: ["completed"],
    },
  ];

  const currentJobStatus = statusData?.job?.status || statusData?.plan?.status || "queued";
  const isCompleted = statusData?.plan?.status === "completed" || currentJobStatus === "completed";
  const isFailed = statusData?.plan?.status === "failed" || currentJobStatus === "failed";
  const sheetUrl = statusData?.export?.spreadsheet_url || contentData?.plan?.sheetUrl;

  const planInfo = contentData?.plan || statusData?.plan || {};
  const allContentItems = contentData?.contentItems || [];

  const handleItemUpdate = (updatedItem) => {
    setContentData((prev) => {
      if (!prev || !prev.contentItems) return prev;
      const newItems = prev.contentItems.map((item) =>
        item.dayNumber === updatedItem.dayNumber ? updatedItem : item
      );
      return { ...prev, contentItems: newItems };
    });
  };

  const filteredItems = formatFilter === "all"
    ? allContentItems
    : allContentItems.filter((item) => item.postType?.toLowerCase() === formatFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white pb-24">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>لوحة التحكم</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-bold">
            <span>مخطط التسويق الذكي</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="text-center py-24 space-y-4 max-w-md mx-auto">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <p className="text-base font-bold text-zinc-100">جاري تحميل بيانات الخطة التسويقية...</p>
            <p className="text-xs text-zinc-400">يرجى الانتظار بضع لحظات</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-zinc-900 border border-red-800/80 text-center space-y-4 max-w-2xl mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-zinc-100">حدث خطأ أثناء تحميل الخطة</h2>
            <p className="text-xs sm:text-sm text-red-300 max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold transition-colors"
              >
                العودة إلى لوحة التحكم
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Title & Metadata Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-800/80 text-right">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">{planInfo.productName || planInfo.product_name}</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-blue-400 font-bold">
                    {planInfo.productCategory || planInfo.product_category}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">
                  الهدف التسويقي: <strong className="text-zinc-200">{(planInfo.marketingObjective || planInfo.marketing_objective)?.replace(/_/g, " ")}</strong>
                </p>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {isCompleted ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>الخطة مكتملة</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>مشاركة الخطة مع العميل</span>
                    </button>

                    {sheetUrl && (
                      <a
                        href={sheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-extrabold text-xs transition-all shadow-sm"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>فتح Google Sheet</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </>
                ) : isFailed ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>تعثرت عملية التوليد</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-bold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التوليد بواسطة AI...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Failure Box */}
            {isFailed && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-red-800/80 space-y-4 text-right">
                <div className="flex items-center gap-2 text-red-300 font-bold text-base">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>واجه الذكاء الاصطناعي صعوبة أثناء المعالجة</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {statusData?.job?.error_message ||
                    "تعثر أحد مسارات المعالجة. يمكنك إعادة المحاولة وسيقوم النظام باستئناف الخطوات فوراً."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>إعادة محاولة التوليد الآن</span>
                  </button>
                </div>
              </div>
            )}

            {/* In-Progress Live Timeline */}
            {!isCompleted && !isFailed && (
              <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-sm space-y-6 text-right max-w-3xl mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">مراحل المحرك الذكي</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-blue-400 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>{statusData?.job?.current_step || "جاري التنفيذ في الخلفية..."}</span>
                    </span>
                    <button
                      id="cancel-plan-btn"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      title="إلغاء عملية التوليد"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-red-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCancelling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{isCancelling ? "جاري الإلغاء..." : "إلغاء والبدء من جديد"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {steps.map((step, idx) => {
                    const isActive = step.activeStates.includes(currentJobStatus);
                    const isDone = isCompleted || step.completedStates.includes(currentJobStatus);

                    return (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className="shrink-0 mt-0.5">
                          {isDone ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-400 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : isActive ? (
                            <div className="w-8 h-8 rounded-full bg-blue-950/80 border border-blue-500 text-blue-400 flex items-center justify-center animate-pulse">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                isDone ? "text-zinc-200" : isActive ? "text-blue-400 font-extrabold" : "text-zinc-500"
                              }`}
                            >
                              {step.label}
                            </h4>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Viewer UI */}
            {isCompleted && (
              <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("calendar")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "calendar"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>تقويم الـ 30 يوماً ({allContentItems.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("insights")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "insights"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
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
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
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
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    }`}
                  >
                    <span>محاور المحتوى</span>
                  </button>
                </div>

                {/* Tab 1: 30-Day Content Calendar */}
                {activeTab === "calendar" && (
                  <div className="space-y-6">
                    {/* Format Filter Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800/80">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                        <Filter className="w-4 h-4 text-blue-400" />
                        <span>تصفية بحسب القالب البصري:</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: "all", label: "جميع المنشورات" },
                          { id: "reel", label: "ريلز (Reel)" },
                          { id: "carousel", label: "كاروسيل" },
                          { id: "static_post", label: "منشور ثابت" },
                          { id: "story", label: "ستوري" },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFormatFilter(f.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              formatFilter === f.id
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content Items List */}
                    {loadingContent ? (
                      <div className="text-center py-12 space-y-3">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                        <p className="text-xs text-zinc-400">جاري تحميل منشورات الخطة...</p>
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="p-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-zinc-400 text-sm">
                        لا توجد منشورات تطابق القالب المحدد.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {filteredItems.map((item) => (
                          <ContentItemCard
                            key={item.id || item.dayNumber}
                            item={item}
                            planId={planId}
                            strategy={contentData?.strategy}
                            onUpdate={handleItemUpdate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Content Mix Intelligence */}
                {activeTab === "insights" && (
                  <ContentMixInsights contentItems={allContentItems} />
                )}

                {/* Tab 3: Strategy & Audience Analysis */}
                {activeTab === "strategy" && (
                  <StrategyViewer strategy={contentData?.strategy} plan={planInfo} />
                )}

                {/* Tab 4: Content Pillars */}
                {activeTab === "pillars" && (
                  <PillarCards pillars={contentData?.pillars} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Share Plan Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        planId={planId}
        initialShareToken={planInfo.shareToken || planInfo.share_token || shareToken}
        onShareTokenChange={(newToken) => setShareToken(newToken)}
      />
    </div>
  );
}
