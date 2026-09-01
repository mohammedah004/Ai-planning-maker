"use client";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({
  children,
  user = null,
  className = "",
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Desktop Persistent Sidebar (Fixed Right in RTL) */}
      <Sidebar user={user} />

      {/* 2. Mobile Responsive Topbar + Drawer */}
      <MobileNav user={user} />

      {/* 3. Main Fluid Content Container */}
      <main
        className={`
          flex-1 flex flex-col min-w-0
          lg:mr-64 xl:mr-72
          bg-[#09090b]
          ${className}
        `.trim()}
      >
        {children}
      </main>
    </div>
  );
}
