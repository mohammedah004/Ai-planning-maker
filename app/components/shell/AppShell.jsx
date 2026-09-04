"use client";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({
  children,
  user = null,
  brandCount = null,
  className = "",
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row rtl selection:bg-slate-900/10 selection:text-slate-900 dark:selection:bg-blue-600/30 dark:selection:text-white" dir="rtl">
      {/* Mobile Top Bar & Drawer (Visible on < lg) */}
      <MobileNav user={user} brandCount={brandCount} />

      {/* Desktop Persistent Right Sidebar (Visible on >= lg) */}
      <Sidebar user={user} brandCount={brandCount} className="hidden lg:flex" />

      {/* Fluid Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl w-full mx-auto ${className}`}>
        {children}
      </main>
    </div>
  );
}
