"use client";

import { useSession } from "next-auth/react";
import AppShell from "@/app/components/shell/AppShell";
import PageHeader from "@/app/components/shell/PageHeader";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useVoice } from "@/app/contexts/VoiceContext";
import { Sun, Moon, Monitor, Settings, Zap, Sparkles } from "lucide-react";

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

/** Voice option card conforming to existing MADAR design tokens */
function VoiceOption({ value, icon: Icon, label, description, preview, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      aria-pressed={active}
      className={`
        flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-right cursor-pointer
        transition-all duration-150 w-full
        ${
          active
            ? "border-blue-500 bg-blue-950/30 text-zinc-100 dark:bg-blue-950/30 dark:border-blue-500"
            : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40"
        }
      `.trim()}
    >
      <div className="flex items-center justify-between w-full">
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 dark:bg-zinc-800"}
          `}
        >
          <Icon className="w-5 h-5" />
        </div>
        {active && (
          <span className="text-[11px] font-bold text-blue-400 px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/40">
            مُفعل
          </span>
        )}
      </div>

      <div className="space-y-1 w-full">
        <div className={`text-sm font-bold ${active ? "text-zinc-100" : "text-zinc-300 dark:text-zinc-300"}`}>
          {label}
        </div>
        <div className="text-xs text-zinc-500 leading-relaxed">{description}</div>
      </div>

      <div
        className={`w-full mt-1 p-2.5 rounded-xl border text-xs font-medium leading-relaxed ${
          active
            ? "bg-blue-950/40 border-blue-900/50 text-blue-300"
            : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
        }`}
      >
        {preview}
      </div>
    </button>
  );
}

/** A reusable section wrapper for settings sections */
function SettingsSection({ title, description, children }) {
  return (
    <section className="space-y-5 text-right">
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

export default function SettingsClient({ session }) {
  const { data: clientSession } = useSession();
  const { theme, setTheme } = useTheme();
  const { mode, setVoice, t } = useVoice();

  // Use server-passed session or fall back to client session
  const user = session?.user ?? clientSession?.user ?? null;

  const themeOptions = [
    {
      value: "light",
      icon: Sun,
      label: t("settings.appearance.light"),
      description: t("settings.appearance.lightDesc"),
    },
    {
      value: "dark",
      icon: Moon,
      label: t("settings.appearance.dark"),
      description: t("settings.appearance.darkDesc"),
    },
    {
      value: "system",
      icon: Monitor,
      label: t("settings.appearance.system"),
      description: t("settings.appearance.systemDesc"),
    },
  ];

  const voiceOptions = [
    {
      value: "clear",
      icon: Zap,
      label: t("settings.voice.clearLabel"),
      description: t("settings.voice.clearDescription"),
      preview: t("settings.voice.clearPreview"),
    },
    {
      value: "friendly",
      icon: Sparkles,
      label: t("settings.voice.friendlyLabel"),
      description: t("settings.voice.friendlyDescription"),
      preview: t("settings.voice.friendlyPreview"),
    },
  ];

  return (
    <AppShell user={user}>
      <div className="space-y-8 max-w-2xl text-right">
        {/* Page Header */}
        <PageHeader
          title={t("settings.header.title")}
          description={t("settings.header.description")}
          badge={
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-bold text-zinc-400">
              <Settings className="w-3 h-3" />
              <span>{t("settings.header.title")}</span>
            </div>
          }
        />

        {/* ── Section 1: UI Voice (أسلوب الحديث) ── */}
        <SettingsSection
          title={t("settings.voice.title")}
          description={t("settings.voice.description")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {voiceOptions.map((opt) => (
              <VoiceOption
                key={opt.value}
                value={opt.value}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                preview={opt.preview}
                active={mode === opt.value}
                onClick={setVoice}
              />
            ))}
          </div>
        </SettingsSection>

        {/* ── Section 2: Appearance (المظهر) ── */}
        <SettingsSection
          title={t("settings.appearance.title")}
          description={t("settings.appearance.description")}
        >
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => (
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
      </div>
    </AppShell>
  );
}
