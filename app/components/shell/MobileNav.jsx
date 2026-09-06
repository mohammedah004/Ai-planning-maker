"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
  Building2,
  Compass,
  Settings,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import UserMenu from "./UserMenu";
import MadarLogo from "@/app/components/ui/MadarLogo";
import { useVoice } from "@/app/contexts/VoiceContext";

export default function MobileNav({ user = null, brandCount = null }) {
  const pathname = usePathname();
  const { t } = useVoice();
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-[#0c0c0f] border-b border-zinc-200 dark:border-zinc-800/80 text-right px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <MadarLogo href="/" variant="full" size="sm" />

        {/* Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer from Right (RTL) */}
      <div
        className={`
          lg:hidden fixed top-0 bottom-0 right-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#0c0c0f] border-l border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-200 ease-in-out text-right
          ${isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"}
        `.trim()}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل المحمولة"
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
            <MadarLogo
              href="/"
              variant="full"
              size="sm"
              onClick={() => setIsOpen(false)}
            />

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق القائمة"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="تنقل الجوال">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              {t("common.nav.workspace")}
            </div>

            <SidebarItem
              href="/dashboard"
              label={t("common.nav.dashboard")}
              icon={LayoutDashboard}
              exact={true}
              onClick={() => setIsOpen(false)}
            />

            <SidebarItem
              href="/plans/new"
              label={t("common.nav.newPlan")}
              icon={PlusCircle}
              exact={true}
              onClick={() => setIsOpen(false)}
            />

            <SidebarItem
              href="/brands"
              label={t("common.nav.brands")}
              icon={Building2}
              badge={brandCount}
              onClick={() => setIsOpen(false)}
            />

            <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              {t("common.nav.general")}
            </div>

            <SidebarItem
              href="/settings"
              label={t("common.nav.settings")}
              icon={Settings}
              exact={true}
              onClick={() => setIsOpen(false)}
            />
          </nav>

          {/* Strategy Context Callout */}
          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 dark:text-blue-400">
              <Compass className="w-3.5 h-3.5" />
              <span>{t("common.nav.engineBadge")}</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t("common.nav.engineDesc")}
            </p>
          </div>
        </div>

        {/* Drawer Footer with UserMenu */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <UserMenu user={user} />
        </div>
      </div>
    </>
  );
}
