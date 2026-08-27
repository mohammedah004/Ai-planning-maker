"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Clock,
  Copy,
  Check,
  Target,
  Layers,
  Calendar,
  XCircle,
} from "lucide-react";

export default function PlanDetailPage({ params }) {
  const resolvedParams = use(params);
  const planId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

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

        setData(json.data);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Polling error:", err);
        setError("حدث خطأ في الاتصال أثناء تحديث الحالة.");
        setLoading(false);
      }
    }

    getInitialStatus();

    // Setup polling every 3 seconds while not completed and not failed
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/plans/${planId}/status`);
        const json = await res.json();
        if (isMounted && json.success) {
          setData(json.data);
          if (json.data?.plan?.status === "completed" || json.data?.plan?.status === "failed") {
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

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/plans/${planId}/retry`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setError(null);
        const resPoll = await fetch(`/api/plans/${planId}/status`);
        const jsonPoll = await resPoll.json();
        if (jsonPoll.success) setData(jsonPoll.data);
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

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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

  const currentJobStatus = data?.job?.status || data?.plan?.status || "queued";
  const isCompleted = data?.plan?.status === "completed" || currentJobStatus === "completed";
  const isFailed = data?.plan?.status === "failed" || currentJobStatus === "failed";
  const sheetUrl = data?.export?.spreadsheet_url;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>لوحة التحكم</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>متابعة الخطة التسويقية</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        {loading ? (
          <div className="text-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
            <p className="text-base font-bold text-white">جاري تحميل بيانات الخطة التسويقية...</p>
            <p className="text-xs text-slate-400">يرجى الانتظار بضع لحظات</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-950/40 border border-red-800 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-red-200">حدث خطأ أثناء تحميل الخطة</h2>
            <p className="text-sm text-red-300 max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                العودة إلى لوحة التحكم
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800 text-right">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{data.plan.product_name}</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 font-bold">
                    {data.plan.product_category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  الهدف التسويقي: <strong>{data.plan.marketing_objective?.replace(/_/g, " ")}</strong>
                </p>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>الخطة جاهزة ومكتملة</span>
                  </span>
                ) : isFailed ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>تعثرت عملية التوليد</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs font-bold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التوليد بواسطة AI...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Success Box with Google Sheets Link */}
            {isCompleted && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-700/60 shadow-2xl shadow-emerald-950/40 text-right space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-800/50">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تم بناء تقويم الـ 30 يوماً بنجاح</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">ملف Google Sheet جاهز للاستخدام</h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                      يحتوي الملف على تبويبين منسقين: تبويب الاستراتيجية العامة وركائز المحتوى، وتبويب جدول الـ 30 يوماً متضمناً الكابشن ونصوص التصاميم والتوجيه الإخراجي.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {sheetUrl ? (
                    <>
                      <a
                        href={sheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:scale-105"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>فتح ملف Google Sheet</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(sheetUrl)}
                        className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? "تم نسخ الرابط!" : "نسخ رابط الشيت"}</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 italic">جاري إتمام مزامنة الرابط النهائي...</div>
                  )}
                </div>
              </div>
            )}

            {/* Failed Box */}
            {isFailed && (
              <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/80 space-y-4 text-right">
                <div className="flex items-center gap-2 text-red-300 font-bold text-base">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>واجه الذكاء الاصطناعي صعوبة أثناء المعالجة</span>
                </div>
                <p className="text-xs text-red-200 leading-relaxed">
                  {data?.job?.error_message ||
                    "تعثر أحد مسارات المعالجة أو التصدير في n8n. يمكنك إعادة المحاولة وسيقوم النظام باستئناف الخطوات فوراً."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 cursor-pointer disabled:opacity-60"
                  >
                    {isRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>إعادة محاولة التوليد الآن</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Progress Timeline */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6 text-right">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">مراحل المحرك الذكي</h3>
                {!isCompleted && !isFailed && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-indigo-400 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>{data?.job?.current_step || "جاري التنفيذ في الخلفية..."}</span>
                    </span>
                    <button
                      id="cancel-plan-btn"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      title="إلغاء عملية التوليد"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-400 hover:text-red-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCancelling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{isCancelling ? "جاري الإلغاء..." : "إلغاء والبدء من جديد"}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {steps.map((step, idx) => {
                  const isActive = step.activeStates.includes(currentJobStatus);
                  const isDone = isCompleted || step.completedStates.includes(currentJobStatus);

                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      {/* Step Indicator */}
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : isActive ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500 text-indigo-400 flex items-center justify-center animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-600 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      {/* Step Details */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              isDone ? "text-slate-200" : isActive ? "text-indigo-300 font-extrabold" : "text-slate-500"
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
                              قيد المعالجة الآن
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
