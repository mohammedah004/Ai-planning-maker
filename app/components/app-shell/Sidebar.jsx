"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  Sparkles,
  Zap,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import UserMenu from "./UserMenu";

export default function Sidebar({ user = null, className = "" }) {
  return (
    <aside
      aria-label="التنقل الرئيسي"
      className={`
        hidden lg:flex flex-col fixed inset-y-0 right-0 z-30
        w-64 xl:w-72 bg-[#0d0d10] border-l border-zinc-800/80
        select-none text-zinc-100
        ${className}
      `.trim()}
    >
      {/* 1. Brand Area */}
      <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group focus-visible:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-900/40 group-hover:bg-blue-500 transition-colors shrink-0">
            AI
          </div>
          <div className="text-right">
            <span className="font-extrabold text-sm text-zinc-100 block leading-tight tracking-tight">
              مخطط التسويق الذكي
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wider">
              استراتيجية ومحتوى إنستغرام
            </span>
          </div>
        </Link>
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
