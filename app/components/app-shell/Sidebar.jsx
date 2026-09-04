"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  Sparkles,
  Zap,
} from "lucide-react";
import MadarLogo from "@/app/components/ui/MadarLogo";
import SidebarItem from "./SidebarItem";
import UserMenu from "./UserMenu";

export default function Sidebar({ user = null, brandCount = null, className = "" }) {
  return (
    <aside
      aria-label="القائمة الجانبية الرئيسية"
      className={`
        w-64 h-screen sticky top-0 flex flex-col justify-between border-l border-zinc-800/80 bg-zinc-950 shrink-0 text-right select-none
        ${className}
      `.trim()}
    >
      {/* 1. Brand Area */}
      <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between">
        <MadarLogo href="/" variant="full" size="sm" />
      </div>

      {/* 2. Navigation Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold text-zinc-400 tracking-wider">
            القائمة الرئيسية
          </div>
          <nav className="space-y-1.5" aria-label="أقسام التطبيق">
            <SidebarItem
              href="/dashboard"
              label="لوحة التحكم والخطط"
              icon={LayoutDashboard}
              isExact={true}
            />
            <SidebarItem
              href="/plans/new"
              label="إنشاء خطة 30 يوم"
              icon={PlusCircle}
            />
            <SidebarItem
              href="/brands"
              label="ملفات البراند والذاكرة"
              icon={Building2}
            />
          </nav>
        </div>

        {/* 3. Obsidian Intelligence Context Card */}
        <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-right space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>محرك التوليد</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              نشط
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Gemini 2.5 Flash مع حفظ ذري في Supabase وتصدير تلقائي لـ Google Sheets.
          </p>
        </div>
      </div>

      {/* 4. User Area (Bottom) */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-[#0d0d10]">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
