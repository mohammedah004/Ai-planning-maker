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

export default function Sidebar({ user = null, brandCount = null, className = "" }) {
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
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl group transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-600/30 group-hover:scale-105 transition-transform">
            AI
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-sm font-extrabold text-[#1A1D1F] dark:text-zinc-100 tracking-tight leading-none group-hover:text-[#0B57D0] dark:group-hover:text-blue-400 transition-colors">
              مخطط التسويق الذكي
            </div>
            <div className="text-[11px] text-[#575C61] dark:text-zinc-500 font-medium leading-none">
              مساحة الذكاء الاستراتيجي
            </div>
          </div>
        </Link>

        {/* Primary Navigation List */}
        <nav className="space-y-1.5" aria-label="أقسام مساحة العمل">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#575C61] dark:text-zinc-500">
            مساحة العمل
          </div>

          <SidebarItem
            href="/dashboard"
            label="لوحة التحكم والخطط"
            icon={LayoutDashboard}
            exact={true}
          />

          <SidebarItem
            href="/plans/new"
            label="إنشاء خطة تسويقية"
            icon={PlusCircle}
            exact={true}
          />

          <SidebarItem
            href="/brands"
            label="ملفات البراند والذاكرة"
            icon={Building2}
            badge={brandCount}
          />

          <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#575C61] dark:text-zinc-500">
            عام
          </div>

          <SidebarItem
            href="/settings"
            label="الإعدادات"
            icon={Settings}
            exact={true}
          />
        </nav>

        {/* Strategic Intelligence Badge / Value Anchor */}
        <div className="p-4 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/40 border border-[#E4E7EC] dark:border-zinc-800/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B57D0] dark:text-blue-400">
            <Compass className="w-3.5 h-3.5" />
            <span>محرك التخطيط لـ 30 يوماً</span>
          </div>
          <p className="text-[11px] text-[#575C61] dark:text-zinc-400 leading-relaxed">
            تشخيص مرحلة النضج، استراتيجية الجمهور، محاور المحتوى، وتصدير Google Sheet.
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
