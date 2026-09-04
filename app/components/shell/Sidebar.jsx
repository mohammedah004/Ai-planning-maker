"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  Sparkles,
  Compass,
  Settings,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import UserMenu from "./UserMenu";
import MadarLogo from "@/app/components/ui/MadarLogo";
import { useVoice } from "@/app/contexts/VoiceContext";

export default function Sidebar({ user = null, brandCount = null, className = "" }) {
  const { t } = useVoice();

  return (
    <aside
      aria-label="التنقل الرئيسي"
      className={`
        w-64 lg:w-72 h-screen sticky top-0 flex flex-col justify-between p-5 border-l border-[#E4E7EC] dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f] shrink-0 text-right select-none
        ${className}
      `.trim()}
    >
      {/* Top Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand Area */}
        <div className="px-1 py-1">
          <MadarLogo href="/" variant="full" size="md" />
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-1.5" aria-label="أقسام مساحة العمل">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#575C61] dark:text-zinc-500">
            {t("common.nav.workspace")}
          </div>

          <SidebarItem
            href="/dashboard"
            label={t("common.nav.dashboard")}
            icon={LayoutDashboard}
            exact={true}
          />

          <SidebarItem
            href="/plans/new"
            label={t("common.nav.newPlan")}
            icon={PlusCircle}
            exact={true}
          />

          <SidebarItem
            href="/brands"
            label={t("common.nav.brands")}
            icon={Building2}
            badge={brandCount}
          />

          <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#575C61] dark:text-zinc-500">
            {t("common.nav.general")}
          </div>

          <SidebarItem
            href="/settings"
            label={t("common.nav.settings")}
            icon={Settings}
            exact={true}
          />
        </nav>

        {/* Strategic Intelligence Badge / Value Anchor */}
        <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/40 border border-[#E4E7EC] dark:border-zinc-800/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B57D0] dark:text-blue-400">
            <Compass className="w-3.5 h-3.5" />
            <span>{t("common.nav.engineBadge")}</span>
          </div>
          <p className="text-[11px] text-[#575C61] dark:text-zinc-400 leading-relaxed">
            {t("common.nav.engineDesc")}
          </p>
        </div>
      </div>

      {/* Bottom User Area */}
      <div className="pt-4 border-t border-[#E4E7EC] dark:border-zinc-800/80">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
