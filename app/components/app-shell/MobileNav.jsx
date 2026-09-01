"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import UserMenu from "./UserMenu";

export default function MobileNav({ user = null, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef(null);

  // Close drawer on route navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle body scroll lock & Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Topbar */}
      <header
        className={`
          lg:hidden sticky top-0 z-40 h-14 bg-[#0d0d10]/95 backdrop-blur-md
          border-b border-zinc-800/80 px-4 flex items-center justify-between text-zinc-100
          ${className}
        `.trim()}
      >
        {/* Right side in RTL: Hamburger menu trigger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="فتح القائمة الرئيسية"
            aria-expanded={isOpen}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-850 active:bg-zinc-800 transition-colors border border-zinc-800/80 focus-visible:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-blue-900/30">
              AI
            </div>
            <span className="font-extrabold text-sm text-zinc-100 tracking-tight">
              مخطط التسويق الذكي
            </span>
          </Link>
        </div>

        {/* Left side in RTL: Quick Action Button */}
        <Link
          href="/plans/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-950/40 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>خطة جديدة</span>
        </Link>
      </header>

      {/* Slide-over Drawer (RTL: Slides from Right) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="القائمة الرئيسية"
            className="fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-[#0d0d10] border-l border-zinc-800/80 p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Top Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                    AI
                  </div>
                  <span className="font-extrabold text-sm text-zinc-100">
                    مخطط التسويق الذكي
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-5 space-y-1.5" aria-label="أقسام التطبيق">
                <SidebarItem
                  href="/dashboard"
                  label="لوحة التحكم والخطط"
                  icon={LayoutDashboard}
                  isExact={true}
                  onClick={() => setIsOpen(false)}
                />
                <SidebarItem
                  href="/plans/new"
                  label="إنشاء خطة 30 يوم"
                  icon={PlusCircle}
                  badge="جديد"
                  onClick={() => setIsOpen(false)}
                />
                <SidebarItem
                  href="/brands"
                  label="ملفات البراند والذاكرة"
                  icon={Building2}
                  onClick={() => setIsOpen(false)}
                />
              </nav>

              {/* Engine Badge */}
              <div className="mt-6 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-right space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>محرك الذكاء الاصطناعي</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">نشط</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  توليد وتحليل احترافي لإنستغرام.
                </p>
              </div>
            </div>

            {/* Bottom User Profile */}
            <div className="pt-4 border-t border-zinc-800/80">
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
