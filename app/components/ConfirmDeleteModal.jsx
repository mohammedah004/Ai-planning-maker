"use client";

import { AlertTriangle, Trash2, Loader2, X, XCircle } from "lucide-react";

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "حذف العنصر",
  description = "هل أنت متأكد من إجراء هذا الحذف؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.",
  confirmText = "تأكيد الحذف النهائي",
  cancelText = "إلغاء",
  isLoading = false,
  error = null,
  variant = "danger", // "danger" | "warning"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-zinc-950/80 backdrop-blur-md text-right">
      <div
        className="w-full max-w-md p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E4E7EC] dark:border-zinc-800 shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 left-4 p-1.5 rounded-xl text-[#575C61] hover:text-[#1A1D1F] hover:bg-[#F0F4F8] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Banner */}
        <div className="text-center space-y-3 pt-2">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border shadow-inner ${
              variant === "danger"
                ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/60 dark:border-red-800/80 dark:text-red-400"
                : "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-400"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-[#1A1D1F] dark:text-zinc-100 text-center">{title}</h3>
            <p className="text-xs sm:text-sm text-[#575C61] dark:text-zinc-400 leading-relaxed text-center max-w-xs mx-auto">
              {description}
            </p>
          </div>
        </div>

        {/* Error notification inside modal */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-zinc-950 dark:border-red-800/80 dark:text-red-300 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-amber-600 hover:bg-amber-500 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3 px-5 rounded-xl bg-white hover:bg-[#F0F4F8] text-[#575C61] hover:text-[#1A1D1F] border border-[#E4E7EC] font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:border-transparent"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
