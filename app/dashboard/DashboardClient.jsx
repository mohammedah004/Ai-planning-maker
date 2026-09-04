"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Trash2,
  Building2,
  Compass,
  ArrowLeft,
  Search,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import { pingBackendHealth } from "@/lib/backend-health";
import AppShell from "@/app/components/shell/AppShell";
import PageHeader from "@/app/components/shell/PageHeader";
import Button from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import StatMetric from "@/app/components/ui/StatMetric";
import EmptyState from "@/app/components/ui/EmptyState";
import Tabs from "@/app/components/ui/Tabs";
import { useVoice } from "@/app/contexts/VoiceContext";

const formatObjective = (obj) => {
  const map = {
    brand_awareness: "زيادة الوعي",
    audience_engagement: "زيادة التفاعل",
    lead_generation: "جلب عملاء محتملين",
    direct_sales: "زيادة المبيعات",
    product_launch: "إطلاق منتج",
    brand_building: "بناء البراند",
  };
  return map[obj] || obj?.replace(/_/g, " ") || "غير محدد";
};

/**
 * Contextual micro-card for first-time voice onboarding.
 * Persisted in browser/device localStorage ('hasSeenVoiceOnboarding').
 */
function VoiceOnboardingCard({ currentMode, onSelectVoice, onDismiss, t }) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/60 border border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs relative overflow-hidden transition-all text-right">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-4 left-4 p-1.5 rounded-xl text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        aria-label="إغلاق التلميح"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-4 max-w-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0B57D0] dark:text-blue-400 text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>تخصيص الواجهة</span>
          </div>
          <h3 className="text-base font-extrabold text-[#1A1D1F] dark:text-zinc-100">
            {t("dashboard.onboarding.title")}
          </h3>
          <p className="text-xs text-[#575C61] dark:text-zinc-400 leading-relaxed">
            {t("dashboard.onboarding.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onSelectVoice("clear")}
            className={`p-4 rounded-xl border text-right transition-all cursor-pointer ${
              currentMode === "clear"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                : "border-[#E4E7EC] dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-sm font-bold text-[#1A1D1F] dark:text-zinc-100">
                {t("dashboard.onboarding.clearTitle")}
              </span>
              <span className="text-[10px] font-bold text-zinc-500">الافتراضي</span>
            </div>
            <p className="text-[11px] text-[#575C61] dark:text-zinc-400">
              {t("dashboard.onboarding.clearDesc")}
            </p>
            <div className="mt-2 text-[11px] font-medium text-[#0B57D0] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
              {t("dashboard.onboarding.clearPreview")}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectVoice("friendly")}
            className={`p-4 rounded-xl border text-right transition-all cursor-pointer ${
              currentMode === "friendly"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                : "border-[#E4E7EC] dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-sm font-bold text-[#1A1D1F] dark:text-zinc-100">
                {t("dashboard.onboarding.friendlyTitle")}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">تشاركي</span>
            </div>
            <p className="text-[11px] text-[#575C61] dark:text-zinc-400">
              {t("dashboard.onboarding.friendlyDesc")}
            </p>
            <div className="mt-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
              {t("dashboard.onboarding.friendlyPreview")}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ session, initialPlans = [], initialBrands = [] }) {
  const router = useRouter();
  const { mode, setVoice, t } = useVoice();
  const [plans, setPlans] = useState(initialPlans);
  const [brands, setBrands] = useState(initialBrands);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    pingBackendHealth();
    try {
      const hasSeen = localStorage.getItem("hasSeenVoiceOnboarding");
      if (!hasSeen) {
        setShowOnboarding(true);
      }
    } catch (_) {}
  }, []);

  const handleSelectVoice = (selectedMode) => {
    setVoice(selectedMode);
    try {
      localStorage.setItem("hasSeenVoiceOnboarding", "true");
    } catch (_) {}
    setShowOnboarding(false);
  };

  const handleDismissOnboarding = () => {
    try {
      localStorage.setItem("hasSeenVoiceOnboarding", "true");
    } catch (_) {}
    setShowOnboarding(false);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/plans/${planToDelete.id}`, { method: "DELETE" });
      let json = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        json = await res.json();
      }

      if (res.ok && json?.success) {
        setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
        setPlanToDelete(null);
      } else {
        setDeleteError(json?.error?.message || "الخطة غير موجودة أو لا تملك صلاحية حذفها.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("تعذر الحذف. يرجى المحاولة مجدداً.");
    } finally {
      setIsDeleting(false);
    }
  };

  const completedCount = plans.filter((p) => p.status === "completed").length;
  const inProgressCount = plans.filter((p) => p.status === "generating" || p.status === "draft").length;
  const failedCount = plans.filter((p) => p.status === "failed").length;
  const totalPlannedPosts = completedCount * 30;

  // Filter plans based on search and status
  const filteredPlans = plans.filter((plan) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
        ? plan.status === "completed"
        : statusFilter === "generating"
        ? plan.status === "generating" || plan.status === "draft"
        : statusFilter === "failed"
        ? plan.status === "failed"
        : true;

    const matchesSearch = searchQuery.trim() === ""
      ? true
      : (plan.product_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plan.product_category || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const filterTabs = [
    { id: "all", label: t("dashboard.filter.all"), count: plans.length },
    { id: "completed", label: t("dashboard.filter.completed"), count: completedCount },
    ...(inProgressCount > 0
      ? [{ id: "generating", label: t("dashboard.filter.generating"), count: inProgressCount }]
      : []),
    ...(failedCount > 0
      ? [{ id: "failed", label: t("dashboard.filter.failed"), count: failedCount }]
      : []),
  ];

  return (
    <AppShell user={session?.user} brandCount={brands.length}>
      <div className="w-full space-y-8 text-right">
        {/* Orientation & Contextual Header */}
        <PageHeader
          title={t("dashboard.header.title")}
          description={t("dashboard.header.description")}
          badge={<Badge variant="blue">{t("dashboard.header.badge")}</Badge>}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button
                href="/brands"
                variant="secondary"
                size="md"
                startIcon={Building2}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm dark:bg-zinc-800/90 dark:hover:bg-zinc-700/90 dark:text-zinc-100 dark:border-zinc-750"
              >
                <span>{t("common.nav.brands")}</span>
                <span className="px-1.5 py-0.2 bg-zinc-800 dark:bg-zinc-700 text-zinc-300 text-xs rounded-full tabular-nums">
                  {brands.length}
                </span>
              </Button>

              <Button
                href="/plans/new"
                variant="primary"
                size="md"
                startIcon={Plus}
              >
                {t("dashboard.header.newPlanAction")}
              </Button>
            </div>
          }
        />

        {/* Lightweight First-Visit Micro-Onboarding Card */}
        {showOnboarding && (
          <VoiceOnboardingCard
            currentMode={mode}
            onSelectVoice={handleSelectVoice}
            onDismiss={handleDismissOnboarding}
            t={t}
          />
        )}

        {/* Meaningful Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatMetric
            label={t("dashboard.stats.completedPlans")}
            value={completedCount}
            subtitle={t("dashboard.stats.completedPlansDesc")}
            variant="emerald"
            icon={CheckCircle2}
          />

          <StatMetric
            label={t("dashboard.stats.totalPlans")}
            value={totalPlannedPosts}
            subtitle={t("dashboard.stats.totalPlansDesc")}
            variant="blue"
            icon={Layers}
          />

          <StatMetric
            label={t("dashboard.stats.inProgress")}
            value={inProgressCount}
            subtitle={t("dashboard.stats.inProgressDesc")}
            variant={inProgressCount > 0 ? "amber" : "default"}
            icon={Clock}
          />

          <StatMetric
            label={t("dashboard.stats.savedBrands")}
            value={brands.length}
            subtitle={t("dashboard.stats.savedBrandsDesc")}
            variant="purple"
            icon={Building2}
          />
        </div>

        {/* Plans Section */}
        <div className="space-y-5 pt-4">
          {/* Section Bar & Filtering Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E4E7EC] dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-extrabold text-[#1A1D1F] dark:text-zinc-100">
                الخطط التسويقية
              </h2>
              <span className="text-xs text-[#575C61] dark:text-zinc-400 font-bold tabular-nums">
                ({filteredPlans.length} من أصل {plans.length})
              </span>
            </div>

            {plans.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("dashboard.search.placeholder")}
                    className="w-56 sm:w-64 py-2 pr-9 pl-4 rounded-xl bg-white dark:bg-[#09090b] text-xs text-[#1A1D1F] dark:text-zinc-100 placeholder-[#575C61] dark:placeholder-zinc-500 border border-[#E4E7EC] dark:border-zinc-800 focus:border-[#0B57D0] focus:outline-none transition-colors shadow-xs"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#575C61] dark:text-zinc-500 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Status Tabs */}
                {filterTabs.length > 1 && (
                  <Tabs
                    tabs={filterTabs}
                    activeTab={statusFilter}
                    onChange={setStatusFilter}
                  />
                )}
              </div>
            )}
          </div>

          {/* Main Plans Display */}
          {plans.length === 0 ? (
            /* Empty State when no plans exist */
            <EmptyState
              icon={Compass}
              title={t("dashboard.empty.title")}
              description={t("dashboard.empty.description")}
              action={
                <Button
                  href="/plans/new"
                  variant="primary"
                  size="lg"
                  startIcon={Plus}
                >
                  {t("dashboard.empty.action")}
                </Button>
              }
              secondaryAction={
                brands.length === 0 ? (
                  <Button
                    href="/brands/new"
                    variant="outline"
                    size="lg"
                    startIcon={Building2}
                  >
                    {t("dashboard.empty.brandAction")}
                  </Button>
                ) : null
              }
            />
          ) : filteredPlans.length === 0 ? (
            /* Empty State for Filter Query */
            <div className="p-12 text-center rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/40 border border-dashed border-[#E4E7EC] dark:border-zinc-800 space-y-3">
              <p className="text-sm font-bold text-[#1A1D1F] dark:text-zinc-300">
                {t("dashboard.search.empty")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                {t("dashboard.search.reset")}
              </Button>
            </div>
          ) : (
            /* Plans Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlans.map((plan) => {
                const sheetExport = Array.isArray(plan.google_sheet_exports)
                  ? plan.google_sheet_exports[0]
                  : plan.google_sheet_exports;
                const sheetUrl = sheetExport?.spreadsheet_url;

                const isCompleted = plan.status === "completed";
                const isFailed = plan.status === "failed";
                const isGenerating = plan.status === "generating" || plan.status === "draft";

                const formattedDate = plan.created_at
                  ? new Date(plan.created_at).toLocaleDateString("ar-SA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "";

                return (
                  <Card
                    key={plan.id}
                    variant="interactive"
                    padding="none"
                    className="flex flex-col justify-between overflow-hidden group border-[#E4E7EC] dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    {/* Card Header */}
                    <div className="p-5 pb-3 border-b border-[#E4E7EC] dark:border-zinc-850/80 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {plan.product_category && (
                          <Badge variant="blue" size="sm">
                            {plan.product_category}
                          </Badge>
                        )}
                        <Badge variant="subtle" size="sm">
                          {formatObjective(plan.marketing_objective)}
                        </Badge>
                      </div>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteError(null);
                          setPlanToDelete({ id: plan.id, name: plan.product_name });
                        }}
                        title={t("dashboard.card.deletePlan")}
                        aria-label={t("dashboard.card.deletePlan")}
                        className="p-1.5 rounded-lg text-[#575C61] hover:text-red-600 hover:bg-[#F0F4F8] dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3 flex-1">
                      <Link href={`/plans/${plan.id}`} className="block group-hover:text-[#0B57D0] dark:group-hover:text-blue-400 transition-colors">
                        <h3 className="text-base font-extrabold text-[#1A1D1F] dark:text-zinc-100 tracking-tight leading-snug line-clamp-2">
                          {plan.product_name}
                        </h3>
                      </Link>

                      {/* Live Status Badge */}
                      <div>
                        {isCompleted && (
                          <Badge variant="emerald" size="sm" dot={true}>
                            {t("dashboard.card.statusCompleted")}
                          </Badge>
                        )}
                        {isGenerating && (
                          <Badge variant="blue" size="sm" dot={true} className="animate-pulse">
                            {t("dashboard.card.statusGenerating")}
                          </Badge>
                        )}
                        {isFailed && (
                          <Badge variant="red" size="sm" dot={true}>
                            {t("dashboard.card.statusFailed")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 px-5 bg-white/80 dark:bg-zinc-950/40 border-t border-[#E4E7EC] dark:border-zinc-850/80 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#575C61] dark:text-zinc-500 font-medium tabular-nums">
                        {formattedDate}
                      </span>

                      <div className="flex items-center gap-2">
                        {sheetUrl && (
                          <a
                            href={sheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors"
                            title={t("dashboard.card.openSheet")}
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </a>
                        )}

                        <Button
                          href={`/plans/${plan.id}`}
                          variant={isCompleted ? "secondary" : "primary"}
                          size="xs"
                          endIcon={ArrowLeft}
                        >
                          {isCompleted ? t("dashboard.card.viewPlan") : t("dashboard.card.continueGenerating")}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(planToDelete)}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t("dashboard.deleteModal.title")}
        description={
          planToDelete
            ? `${t("dashboard.deleteModal.description")} ("${planToDelete.name}")`
            : ""
        }
        confirmText={t("dashboard.deleteModal.confirm")}
        cancelText={t("dashboard.deleteModal.cancel")}
        isLoading={isDeleting}
        error={deleteError}
        variant="danger"
      />
    </AppShell>
  );
}
