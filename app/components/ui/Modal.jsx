"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  description = null,
  children,
  size = "md", // sm | md | lg | xl
  className = "",
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm text-right animate-in fade-in duration-200">
      <div
        className={`
          w-full rounded-3xl bg-white dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto
          ${sizeClasses[size] || sizeClasses.md}
          ${className}
        `.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC] dark:border-zinc-800/80 gap-3">
          <div className="space-y-1">
            {title && <h3 className="text-base sm:text-lg font-extrabold text-[#1A1D1F] dark:text-zinc-100">{title}</h3>}
            {description && <p className="text-xs text-[#575C61] dark:text-zinc-400 leading-relaxed">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
