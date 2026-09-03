"use client";

import { useSession } from "next-auth/react";
import AppShell from "@/app/components/shell/AppShell";
import PageHeader from "@/app/components/shell/PageHeader";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Sun, Moon, Monitor, Settings } from "lucide-react";

/** Appearance option card */
function ThemeOption({ value, icon: Icon, label, description, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      aria-pressed={active}
      className={`
        flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center cursor-pointer
        transition-all duration-150 w-full
        ${
          active
            ? "border-blue-500 bg-blue-950/30 text-zinc-100 dark:bg-blue-950/30 dark:border-blue-500"
            : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40"
        }
      `.trim()}
    >
      <div
        className={`
          w-12 h-12 rounded-2xl flex items-center justify-center
          ${active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 dark:bg-zinc-800"}
        `}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <div className={`text-sm font-bold ${active ? "text-zinc-100" : "text-zinc-300 dark:text-zinc-300"}`}>
          {label}
        </div>
        <div className="text-[11px] text-zinc-500 leading-relaxed">{description}</div>
      </div>
    </button>
  );
}

/** A reusable section wrapper for settings sections */
function SettingsSection({ title, description, children }) {
  return (
    <section className="space-y-5">
      <div className="space-y-1 pb-4 border-b border-zinc-800/60 dark:border-zinc-800/60">
        <h2 className="text-base font-bold text-zinc-100 dark:text-zinc-100">{title}</h2>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

const THEME_OPTIONS = [
  {
    value: "light",
    icon: Sun,
    label: "فاتح",
    description: "خلفية بيضاء مشرقة",
  },
  {
    value: "dark",
    icon: Moon,
    label: "داكن",
    description: "خلفية داكنة مريحة للعيون",
  },
  {
    value: "system",
    icon: Monitor,
    label: "حسب النظام",
    description: "يتبع إعداد نظام التشغيل تلقائياً",
  },
];

/**
 * SettingsClient — client component for the settings page.
 * Uses AppShell exactly like other pages (passes user from session).
 * Sections are structured to be extensible for future settings.
 */
export default function SettingsClient({ session }) {
  const { data: clientSession } = useSession();
  const { theme, setTheme } = useTheme();

  // Use server-passed session or fall back to client session
  const user = session?.user ?? clientSession?.user ?? null;

  return (
    <AppShell user={user}>
      <div className="space-y-8 max-w-2xl">
        {/* Page Header */}
        <PageHeader
          title="الإعدادات"
          description="تخصيص تجربتك في مخطط التسويق الذكي"
          badge={
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-bold text-zinc-400">
              <Settings className="w-3 h-3" />
              <span>الإعدادات</span>
            </div>
          }
        />

        {/* ── Section 1: Appearance ── */}
        <SettingsSection
          title="المظهر"
          description="اختر مظهر واجهة التطبيق المناسب لك"
        >
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((opt) => (
              <ThemeOption
                key={opt.value}
                value={opt.value}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                active={theme === opt.value}
                onClick={setTheme}
              />
            ))}
          </div>
        </SettingsSection>

        {/*
         * ── Placeholder sections for future settings ──
         * Uncomment and implement when ready:
         *
         * <SettingsSection title="الحساب" description="إدارة بيانات حسابك الشخصي">
         *   {/* account settings here *\/}
         * </SettingsSection>
         *
         * <SettingsSection title="الإشعارات" description="التحكم في إشعارات البريد الإلكتروني">
         *   {/* notification preferences here *\/}
         * </SettingsSection>
         *
         * <SettingsSection title="التصدير الافتراضي" description="إعدادات تصدير Google Sheet">
         *   {/* export settings here *\/}
         * </SettingsSection>
         */}
      </div>
    </AppShell>
  );
}
