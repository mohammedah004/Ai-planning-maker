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
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import UserMenu from "./UserMenu";

export default function MobileNav({ user = null, brandCount = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
    <div className="lg:hidden sticky top-0 z-40 bg-[#0c0c0f]/95 backdrop-blur-md border-b border-zinc-800/80 text-right">
      {/* Mobile Top Bar */}
      <div className="px-4 h-15 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 font-extrabold text-sm text-zinc-100">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
            AI
          </div>
          <span>مخطط التسويق الذكي</span>
        </Link>

        {/* Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer from Right (RTL) */}
      <div
        className={`
          fixed top-0 bottom-0 right-0 z-50 w-72 max-w-[85vw] bg-[#0c0c0f] border-l border-zinc-800 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-200 ease-in-out text-right
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `.trim()}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل المحمولة"
      >
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 font-bold text-sm text-zinc-100"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                AI
              </div>
              <span>مخطط التسويق الذكي</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق القائمة"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="تنقل الجوال">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              مساحة العمل
            </div>

            <SidebarItem
              href="/dashboard"
              label="لوحة التحكم والخطط"
              icon={LayoutDashboard}
              exact={true}
              onClick={() => setIsOpen(false)}
            />

            <SidebarItem
              href="/plans/new"
              label="إنشاء خطة تسويقية"
              icon={PlusCircle}
              exact={true}
              onClick={() => setIsOpen(false)}
            />

            <SidebarItem
              href="/brands"
              label="ملفات البراند والذاكرة"
              icon={Building2}
              badge={brandCount}
              onClick={() => setIsOpen(false)}
            />
          </nav>

          {/* Strategy Context Callout */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <Compass className="w-3.5 h-3.5" />
              <span>ذكاء التخطيط لـ 30 يوماً</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              تحليل الجمهور والتموضع وتنسيق جداول النشر وتصدير Google Sheet.
            </p>
          </div>
        </div>

        {/* Drawer Footer User Menu */}
        <div className="pt-4 border-t border-zinc-800/80">
          <UserMenu user={user} />
        </div>
      </div>
    </div>
  );
}
