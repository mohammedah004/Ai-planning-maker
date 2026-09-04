"use client";

import { useEffect, useState, use, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  Sparkles,
  ShieldCheck,
  Activity,
} from "lucide-react";
import DiagnosisViewer from "./components/DiagnosisViewer";
import PlanComparisonViewer from "./components/PlanComparisonViewer";
import StrategicWarnings from "./components/StrategicWarnings";
import StrategyViewer from "./components/StrategyViewer";
import PillarCards from "./components/PillarCards";
import ContentItemCard from "./components/ContentItemCard";
import PlanCalendarView from "./components/calendar/PlanCalendarView";
import ContentMixInsights from "./components/ContentMixInsights";
import ShareModal from "./components/ShareModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import MultiDayExportImportModal from "./components/MultiDayExportImportModal";
import MultiDayBatchReviewModal from "./components/MultiDayBatchReviewModal";
import { detectStrategicWarnings } from "@/lib/strategic-warnings";
import { computeStrategyConfidenceScore } from "@/lib/strategic-rationale";
import { pingBackendHealth } from "@/lib/backend-health";
import AppShell from "@/app/components/shell/AppShell";
import { useVoice } from "@/app/contexts/VoiceContext";
import LoadingState from "@/app/components/ui/LoadingState";

export default function PlanDetailPage({ params }) {
  const resolvedParams = use(params);
  const planId = resolvedParams.id;
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useVoice();

  useEffect(() => {
    pingBackendHealth();
  }, []);

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [isMultiDayExportOpen, setIsMultiDayExportOpen] = useState(false);
  const [batchProposal, setBatchProposal] = useState(null);

  // Viewer state: "diagnosis" | "calendar" | "insights" | "strategy" | "pillars"
  const [activeTab, setActiveTab] = useState("diagnosis");
  const [formatFilter, setFormatFilter] = useState("all");

  const contentLoadedRef = useRef(false);

  const loadPlanContent = useCallback(async () => {
    if (contentLoadedRef.current) return;
    contentLoadedRef.current = true;
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/plans/${planId}/content`);
      const json = await res.json();
      if (json.success && json.data) {
        setContentData(json.data);
      } else {
        contentLoadedRef.current = false;
      }
    } catch (err) {
      console.error("Error loading plan content:", err);
      contentLoadedRef.current = false;
    } finally {
      setLoadingContent(false);
    }
  }, [planId]);

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
  }, [planId, loadPlanContent]);

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

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/plans/${planId}/cancel`, { method: "POST" });
      let json = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        json = await res.json();
      }

      if (res.ok && json?.success) {
        setShowCancelModal(false);
        router.push("/plans/new");
      } else {
        setCancelError(json?.error?.message || "تعذر إلغاء العملية.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setCancelError("تعذر الإلغاء. يرجى المحاولة مجدداً.");
    } finally {
      setIsCancelling(false);
    }
  };

  const steps = [
    {
      id: "strategy",
      label: "المرحلة 1: التشخيص الاستراتيجي والجمهور",
      description: "تشخيص مرحلة النضج، استخراج نقاط الألم، والتموضع الفريد",
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

  const planInfo = useMemo(() => {
    return contentData?.plan || statusData?.plan || {};
  }, [contentData?.plan, statusData?.plan]);

  // Google Sheets sync state tracking
  const exportData = statusData?.export || (contentData?.plan ? {
    spreadsheet_url: contentData.plan.sheetUrl,
    status: contentData.plan.sheetStatus,
    target_version: contentData.plan.sheetTargetVersion,
    exported_version: contentData.plan.sheetExportedVersion,
  } : null);

  const contentVersion = planInfo?.contentVersion || planInfo?.content_version || 1;
  const exportedVersion = exportData?.exported_version;
  const sheetStatus = exportData?.status;

  const isSheetSynced = sheetStatus === "completed" && exportedVersion === contentVersion;
  const isSheetSyncing = sheetStatus === "stale" || (exportedVersion !== null && exportedVersion !== undefined && exportedVersion < contentVersion);
  const isSheetFailed = sheetStatus === "failed";

  const [isRetryingSync, setIsRetryingSync] = useState(false);

  // Poll status while sheet synchronization is in flight
  useEffect(() => {
    if (!isSheetSyncing) return;

    const syncPollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/plans/${planId}/status`);
        const json = await res.json();
        if (json.success && json.data) {
          setStatusData(json.data);
        }
      } catch (e) {
        console.warn("Sheet sync poll error:", e);
      }
    }, 3000);

    return () => clearInterval(syncPollInterval);
  }, [isSheetSyncing, planId]);

  const handleRetrySheetSync = async () => {
    setIsRetryingSync(true);
    try {
      const res = await fetch(`/api/plans/${planId}/retry-export`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        const resPoll = await fetch(`/api/plans/${planId}/status`);
        const jsonPoll = await resPoll.json();
        if (jsonPoll.success) setStatusData(jsonPoll.data);
      }
    } catch (err) {
      console.error("Retry sheet sync error:", err);
    } finally {
      setIsRetryingSync(false);
    }
  };

  const allContentItems = useMemo(() => {
    return contentData?.contentItems || [];
  }, [contentData?.contentItems]);

  // Deterministic Engines
  const confidenceScore = useMemo(() => {
    return computeStrategyConfidenceScore(planInfo, null);
  }, [planInfo]);

  const strategicWarnings = useMemo(() => {
    if (!isCompleted) return [];
    return detectStrategicWarnings(planInfo, allContentItems);
  }, [isCompleted, planInfo, allContentItems]);

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
    <AppShell user={session?.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading ? (
          <LoadingState
            variant="card"
            size="lg"
            title="جاري قراءة وتحليل بيانات الخطة التسويقية..."
            subtitle="MADAR (مدار) يستحضر التشخيص الاستراتيجي وتقويم المحتوى"
          />
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-50 border border-red-200 dark:bg-zinc-900 dark:border-red-800/80 text-center space-y-4 max-w-2xl mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-[#1A1D1F] dark:text-zinc-100">حدث خطأ أثناء تحميل الخطة</h2>
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#E4E7EC] hover:bg-[#F0F4F8] text-[#1A1D1F] dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 text-xs font-bold transition-colors shadow-xs"
              >
                العودة إلى لوحة التحكم
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Title & Metadata Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#E4E7EC] dark:border-zinc-800/80 text-right">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D1F] dark:text-zinc-100">{planInfo.productName || planInfo.product_name}</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-zinc-900 dark:border-zinc-800 dark:text-blue-400 font-bold">
                    {planInfo.productCategory || planInfo.product_category}
                  </span>

                  {/* Strategy Confidence Score Badge */}
                  {isCompleted && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
                        confidenceScore.score >= 8
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300"
                          : confidenceScore.score >= 6
                          ? "bg-blue-50 border-blue-200 text-[#0B57D0] dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-300"
                          : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/70 dark:border-amber-800 dark:text-amber-300"
                      }`}
                      title={confidenceScore.grade}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>ثقة الاستراتيجية: {confidenceScore.score}/10</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#575C61] dark:text-zinc-400 mt-1.5">
                  الهدف التسويقي: <strong className="text-[#1A1D1F] dark:text-zinc-200">{(planInfo.marketingObjective || planInfo.marketing_objective)?.replace(/_/g, " ")}</strong>
                </p>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {isCompleted ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t("plans.detail.completedBadge")}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 font-bold text-xs transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{t("plans.detail.sharePlan")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMultiDayExportOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50/80 text-violet-700 border border-violet-200 hover:bg-violet-100/80 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800 shadow-xs font-bold text-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span>تحرير وتصدير بـ External AI</span>
                    </button>

                    {/* Google Sheet Action & Synchronized Version Indicator */}
                    {sheetUrl && (
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={sheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-700 border border-slate-200 hover:bg-emerald-50/50 shadow-xs dark:bg-slate-900 dark:text-emerald-400 dark:border-slate-800 font-bold text-xs transition-all cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>{t("plans.detail.openSheet")}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        </a>

                        {isSheetSynced ? (
                          <span
                            title={`Google Sheet متزامن مع أحدث تعديلات الخطة التسويقية (الإصدار V${contentVersion})`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>متزامن (V{contentVersion})</span>
                          </span>
                        ) : isSheetSyncing ? (
                          <span
                            title="جاري مزامنة التعديلات الأخيرة مع Google Sheet في الخلفية..."
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold animate-pulse"
                          >
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            <span>جاري المزامنة...</span>
                          </span>
                        ) : isSheetFailed ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              title={exportData?.error_message || "تعذرت مزامنة التعديلات مع Google Sheet"}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              <span>تعذرت المزامنة</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleRetrySheetSync}
                              disabled={isRetryingSync}
                              className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                            >
                              {isRetryingSync ? <Loader2 className="w-3 h-3 animate-spin" /> : "إعادة المحاولة"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </>
                ) : isFailed ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/60 dark:border-red-800/60 dark:text-red-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t("plans.detail.failedBadge")}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B57D0] dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-300 text-xs font-bold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("plans.detail.generatingBadge")}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Strategic Warnings Box (Deterministic Engine) */}
            {isCompleted && strategicWarnings.length > 0 && (
              <StrategicWarnings warnings={strategicWarnings} />
            )}

            {/* Failure Box */}
            {isFailed && (
              <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 dark:bg-zinc-900 dark:border-red-800/80 space-y-4 text-right">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-base">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
                  <span>واجه الذكاء الاصطناعي صعوبة أثناء المعالجة</span>
                </div>
                <p className="text-xs text-[#575C61] dark:text-zinc-300 leading-relaxed">
                  {statusData?.job?.error_message ||
                    "تعثر أحد مسارات المعالجة. يمكنك إعادة المحاولة وسيقوم النظام باستئناف الخطوات فوراً."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>{t("plans.detail.retryBtn")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* In-Progress Live Timeline */}
            {!isCompleted && !isFailed && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs space-y-6 text-right max-w-3xl mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC] dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#575C61] dark:text-zinc-400">مراحل المحرك الذكي</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#0B57D0] dark:text-blue-400 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>{statusData?.job?.current_step || "جاري التنفيذ في الخلفية..."}</span>
                    </span>
                    <button
                      id="cancel-plan-btn"
                      onClick={() => {
                        setCancelError(null);
                        setShowCancelModal(true);
                      }}
                      disabled={isCancelling}
                      title="إلغاء عملية التوليد"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E7EC] hover:bg-red-50 hover:border-red-200 text-red-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-red-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCancelling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{isCancelling ? "جاري الإلغاء..." : t("plans.detail.cancelBtn")}</span>
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
                            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 dark:bg-emerald-950/80 dark:border-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : isActive ? (
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-300 text-[#0B57D0] dark:bg-blue-950/80 dark:border-blue-500 dark:text-blue-400 flex items-center justify-center animate-pulse">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white border border-[#E4E7EC] text-[#575C61] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-600 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                isDone ? "text-[#1A1D1F] dark:text-zinc-200" : isActive ? "text-[#0B57D0] dark:text-blue-400 font-extrabold" : "text-[#575C61] dark:text-zinc-500"
                              }`}
                            >
                              {step.label}
                            </h4>
                          </div>
                          <p className="text-xs text-[#575C61] dark:text-zinc-400 leading-relaxed">{step.description}</p>
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
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("diagnosis")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "diagnosis"
                        ? "bg-slate-900 text-white shadow-xs border border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 ${activeTab === "diagnosis" ? "text-amber-300 dark:text-amber-500" : "text-amber-500 dark:text-amber-400"}`} />
                    <span>{t("plans.detail.tabDiagnosis")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("calendar")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "calendar"
                        ? "bg-slate-900 text-white shadow-xs border border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{t("plans.detail.tabCalendar")} ({allContentItems.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("insights")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "insights"
                        ? "bg-slate-900 text-white shadow-xs border border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>{t("plans.detail.tabInsights")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("strategy")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "strategy"
                        ? "bg-slate-900 text-white shadow-xs border border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>{t("plans.detail.tabStrategy")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("pillars")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "pillars"
                        ? "bg-slate-900 text-white shadow-xs border border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <span>{t("plans.detail.tabPillars")}</span>
                  </button>
                </div>

                {/* Tab 1: Strategic Business Diagnosis & Memory Comparison */}
                {activeTab === "diagnosis" && (
                  <div className="space-y-6">
                    <DiagnosisViewer
                      strategy={contentData?.strategy}
                      plan={planInfo}
                      onSwitchTab={(tab) => setActiveTab(tab)}
                    />

                    {/* Phase 2: Brand Memory Plan Comparison */}
                    <PlanComparisonViewer
                      currentPlan={planInfo}
                      previousPlan={contentData?.memory?.previousPlan}
                      currentItems={allContentItems}
                      previousItems={contentData?.memory?.previousItems || []}
                    />
                  </div>
                )}

                {/* Tab 2: 30-Day Editorial Content Calendar */}
                {activeTab === "calendar" && (
                  loadingContent ? (
                    <div className="text-center py-16 space-y-3">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                      <p className="text-xs text-zinc-400">جاري تحميل تقويم منشورات الخطة...</p>
                    </div>
                  ) : (
                    <PlanCalendarView
                      contentItems={allContentItems}
                      planId={planId}
                      onItemUpdate={handleItemUpdate}
                    />
                  )
                )}

                {/* Tab 3: Content Mix Intelligence */}
                {activeTab === "insights" && (
                  <ContentMixInsights contentItems={allContentItems} />
                )}

                {/* Tab 4: Strategy & Audience Analysis */}
                {activeTab === "strategy" && (
                  <StrategyViewer strategy={contentData?.strategy} plan={planInfo} />
                )}

                {/* Tab 5: Content Pillars */}
                {activeTab === "pillars" && (
                  <PillarCards pillars={contentData?.pillars} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Plan Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        planId={planId}
        initialShareToken={planInfo.shareToken || planInfo.share_token || shareToken}
        onShareTokenChange={(newToken) => setShareToken(newToken)}
      />

      {/* Cancel Generation Modal */}
      <ConfirmDeleteModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="إلغاء عملية التوليد"
        description="هل أنت متأكد من إلغاء عملية التوليد الجارية؟ سيتم تحرير خط المعالجة فوراً ويمكنك البدء بإنشاء خطة جديدة."
        confirmText="إلغاء والبدء من جديد"
        cancelText="متابعة التوليد"
        isLoading={isCancelling}
        error={cancelError}
        variant="warning"
      />

      {/* Multi-Day External AI Export & Import Modal */}
      <MultiDayExportImportModal
        isOpen={isMultiDayExportOpen}
        onClose={() => setIsMultiDayExportOpen(false)}
        plan={planInfo}
        contentItems={allContentItems}
        onProposalReady={(proposal) => {
          setBatchProposal(proposal);
        }}
      />

      {/* Multi-Day Batch Review & Atomic Commit Modal */}
      <MultiDayBatchReviewModal
        isOpen={Boolean(batchProposal)}
        onClose={() => setBatchProposal(null)}
        planId={planId}
        proposal={batchProposal}
        onBatchCommitSuccess={() => {
          setBatchProposal(null);
          contentLoadedRef.current = false;
          loadPlanContent();
        }}
      />
    </AppShell>
  );
}
