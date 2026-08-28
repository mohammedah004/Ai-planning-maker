"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Loader2,
  X,
  Globe,
  Lock,
} from "lucide-react";

export default function ShareModal({
  isOpen,
  onClose,
  planId,
  initialShareToken = null,
  onShareTokenChange = null,
}) {
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setShareToken(initialShareToken);
    if (initialShareToken && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/share/${initialShareToken}`);
    } else {
      setShareUrl("");
    }
  }, [initialShareToken, isOpen]);

  if (!isOpen) return null;

  const handleGenerateShareLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}/share`, {
        method: "POST",
      });
      let json = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        json = await res.json();
      }

      if (res.ok && json?.success && json?.data) {
        setShareToken(json.data.shareToken);
        setShareUrl(json.data.shareUrl);
        if (onShareTokenChange) {
          onShareTokenChange(json.data.shareToken);
        }
      } else {
        setError(json?.error?.message || "تعذر إنشاء رابط المشاركة.");
      }
    } catch (err) {
      console.error("[ShareModal] Error generating link:", err);
      setError("حدث خطأ في الاتصال أثناء إنشاء الرابط.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShareLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}/share`, {
        method: "DELETE",
      });
      let json = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        json = await res.json();
      }

      if (res.ok && json?.success) {
        setShareToken(null);
        setShareUrl("");
        setConfirmRevoke(false);
        if (onShareTokenChange) {
          onShareTokenChange(null);
        }
      } else {
        setError(json?.error?.message || "تعذر إيقاف رابط المشاركة.");
      }
    } catch (err) {
      console.error("[ShareModal] Error revoking link:", err);
      setError("حدث خطأ في الاتصال أثناء إيقاف الرابط.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-right p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                مشاركة الخطة التسويقية مع العميل
              </h3>
              <p className="text-xs text-zinc-400">
                إنشاء رابط آمن وعام للعرض فقط
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-red-800 text-xs text-red-300 leading-relaxed">
            {error}
          </div>
        )}

        {/* Body Content */}
        {shareToken ? (
          <div className="space-y-5">
            {/* Status Indicator */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  الرابط العام نشط الآن
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>متاح للعرض فقط</span>
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              يمكن لأي شخص يحصل على هذا الرابط الاطلاع على الاستراتيجية كاملة وتقويم المحتوى الـ 30 يوماً بصيغة التصفح دون إكانية التعديل.
            </p>

            {/* Link Box & Copy Button */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400">
                رابط الخطة العامة:
              </label>
              <div className="flex items-center gap-2 dir-ltr">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-blue-300 font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? "تم النسخ!" : "نسخ"}</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح الرابط العام في تبويب جديد</span>
              </a>

              {!confirmRevoke ? (
                <button
                  type="button"
                  onClick={() => setConfirmRevoke(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>إيقاف المشاركة العامة</span>
                </button>
              ) : null}
            </div>

            {/* Revoke Confirmation Box */}
            {confirmRevoke && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-red-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>تأكيد إيقاف رابط المشاركة</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  سيتم تعطيل رابط المشاركة الحالي فوراً. أي شخص يحاول فتح الرابط سيشاهد صفحة غير موجودة (404).
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleRevokeShareLink}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>تأكيد الإيقاف الآن</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRevoke(false)}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 text-blue-400 flex items-center justify-center mx-auto">
              <Globe className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-zinc-100">
                لم يتم تفعيل رابط المشاركة العام بعد
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                أنشئ رابطاً عاماً وفريداً لمشاركة خطتك مع عملائك أو الفريق بضغطة زر. يحتوي الرابط على جميع التفاصيل بصيغة احترافية للعرض فقط.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateShareLink}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>تفعيل وإنشاء رابط المشاركة العام</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
