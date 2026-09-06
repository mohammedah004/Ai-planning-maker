"use client";

import { useState } from "react";
import {
  Film,
  Video,
  Type,
  Mic,
  Clock,
  Sparkles,
  Copy,
  Check,
  Clapperboard,
  Camera,
} from "lucide-react";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";

const formatActionType = (type) => {
  switch (type) {
    case "camera_speech":
      return {
        label: "تحدث مباشر للكاميرا",
        icon: Camera,
        bg: "bg-purple-50 dark:bg-purple-950/50",
        border: "border-purple-200 dark:border-purple-800/60",
        text: "text-purple-700 dark:text-purple-300",
        barColor: "bg-purple-600 dark:bg-purple-500",
      };
    case "b_roll":
      return {
        label: "لقطات توضيحية (B-Roll)",
        icon: Video,
        bg: "bg-amber-50 dark:bg-amber-950/50",
        border: "border-amber-200 dark:border-amber-800/60",
        text: "text-amber-800 dark:text-amber-300",
        barColor: "bg-amber-500 dark:bg-amber-400",
      };
    case "on_screen_text":
    default:
      return {
        label: "نص على الشاشة (On-Screen)",
        icon: Type,
        bg: "bg-blue-50 dark:bg-blue-950/50",
        border: "border-blue-200 dark:border-blue-800/60",
        text: "text-blue-700 dark:text-blue-300",
        barColor: "bg-blue-600 dark:bg-blue-400",
      };
  }
};

export default function ReelPreview({
  item,
  isEditing = false,
  editState = {},
  onFieldChange = null,
  className = "",
}) {
  const [copiedScript, setCopiedScript] = useState(false);

  const designCopy = isEditing
    ? editState.design_copy || {}
    : item.designCopy || item.design_copy || {};

  const scenes = Array.isArray(designCopy.scenes) && designCopy.scenes.length > 0
    ? designCopy.scenes
    : [
        {
          order: 1,
          durationSec: 5,
          actionType: "camera_speech",
          visualDirection: "لقطة قريبة للمتحدث مع حركة يد واثقة ونظرة مباشرة للكاميرا",
          onScreenText: designCopy.headline || "الخطاف البصري الجذاب",
          voiceover: designCopy.headline || "هل تعلم أن معظم الشركات ترتكب هذا الخطأ؟",
        },
        {
          order: 2,
          durationSec: 15,
          actionType: "b_roll",
          visualDirection: "لقطات شاشة للمنتج أو لقطات سريعة لتوضيح المشكلة والحل",
          onScreenText: "3 أسرار للمضاعفة",
          voiceover: designCopy.subtext || "إليك 3 خطوات عملية لتحقيق أفضل عائد.",
        },
        {
          order: 3,
          durationSec: 10,
          actionType: "on_screen_text",
          visualDirection: "شاشة ختامية مع مؤشر نحو الرابط في البايو",
          onScreenText: designCopy.cta || item.cta || "احصل على نسختك الآن",
          voiceover: "احفظ الفيديو وطبق هذه الخطوات اليوم.",
        },
      ];

  const totalCalculatedDuration = scenes.reduce(
    (acc, sc) => acc + (Number(sc.durationSec || sc.duration_sec) || 5),
    0
  );
  const totalDuration = designCopy.totalDurationSec || designCopy.total_duration_sec || totalCalculatedDuration || 30;
  const hookLine = designCopy.hookLine || designCopy.hook_line || scenes[0]?.voiceover || scenes[0]?.onScreenText || "";

  const handleCopyFullScript = () => {
    const text = [
      `=== سيناريو الريلز (إجمالي المدة: ${totalDuration} ثانية) ===`,
      hookLine ? `🪝 الخطاف الأول: "${hookLine}"` : "",
      "",
      ...scenes.map((sc, idx) => {
        const action = formatActionType(sc.actionType || sc.action_type);
        return [
          `[مشهد ${sc.order || idx + 1} - ${sc.durationSec || sc.duration_sec || 5} ثواني | ${action.label}]`,
          sc.visualDirection ? `التوجيه الإخراجي: ${sc.visualDirection}` : "",
          sc.onScreenText ? `النص على الشاشة: ${sc.onScreenText}` : "",
          sc.voiceover ? `التعليق الصوتي: "${sc.voiceover}"` : "",
        ]
          .filter(Boolean)
          .join("\n");
      }),
    ]
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleSceneChange = (sceneIndex, field, value) => {
    if (!onFieldChange) return;
    const updatedScenes = scenes.map((sc, idx) => {
      if (idx === sceneIndex) {
        return { ...sc, [field]: value };
      }
      return sc;
    });
    onFieldChange("design_copy", {
      ...designCopy,
      scenes: updatedScenes,
    });
  };

  return (
    <div className={`space-y-6 text-right ${className}`}>
      {/* 1. Reel Storyboard & Timeline Card */}
      <Card padding="lg" className="space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-zinc-800/80">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#1A1D1F] dark:text-zinc-100">
            <Clapperboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>لوحة سيناريو الريلز (Storyboard & Direction)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-black tabular-nums shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{totalDuration} ثانية</span>
            </span>

            {!isEditing && (
              <Button
                variant={copiedScript ? "emerald" : "secondary"}
                size="sm"
                onClick={handleCopyFullScript}
                startIcon={copiedScript ? Check : Copy}
              >
                {copiedScript ? "تم نسخ السيناريو!" : "نسخ السكربت كاملاً"}
              </Button>
            )}
          </div>
        </div>

        {/* Timeline Duration Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#575C61] dark:text-zinc-400">
            <span>الخط الزمني وتوزيع اللقطات (Timeline Duration Breakdown)</span>
            <span className="tabular-nums">{scenes.length} لقطات متتابعة</span>
          </div>

          <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800 flex overflow-hidden p-0.5 gap-0.5 border border-[#E4E7EC] dark:border-zinc-700/60">
            {scenes.map((sc, idx) => {
              const dur = Number(sc.durationSec || sc.duration_sec) || 5;
              const pct = Math.max(10, Math.min(100, (dur / totalCalculatedDuration) * 100));
              const action = formatActionType(sc.actionType || sc.action_type);

              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%` }}
                  title={`مشهد ${idx + 1}: ${dur} ث (${action.label})`}
                  className={`h-full rounded-sm ${action.barColor} transition-all duration-300 hover:opacity-80 relative group`}
                />
              );
            })}
          </div>

          {/* Timeline Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#575C61] dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-500" />
              <span>حديث مباشر (Camera Speech)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400" />
              <span>لقطات توضيحية (B-Roll)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>نص على الشاشة (On-Screen)</span>
            </span>
          </div>
        </div>

        {/* Prominent Hook Card */}
        {hookLine && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/80 via-blue-50/40 to-white dark:from-purple-950/30 dark:via-blue-950/20 dark:to-[#131316] border border-purple-200/80 dark:border-purple-800/60 space-y-1.5 shadow-xs">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الخطاف البصري والصوتي الأول (First 2 Seconds Hook)</span>
            </span>
            {isEditing ? (
              <input
                type="text"
                value={designCopy.hookLine || designCopy.hook_line || ""}
                onChange={(e) =>
                  onFieldChange?.("design_copy", {
                    ...designCopy,
                    hook_line: e.target.value,
                    hookLine: e.target.value,
                  })
                }
                className="w-full p-2 text-xs font-bold rounded-lg border border-purple-400 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-100"
                placeholder="أدخل الخطاف الأول..."
              />
            ) : (
              <p className="font-extrabold text-[#1A1D1F] dark:text-zinc-100 text-sm sm:text-base leading-relaxed">
                "{hookLine}"
              </p>
            )}
          </div>
        )}

        {/* Vertical Storyboard Scenes */}
        <div className="space-y-4">
          <span className="block text-xs font-bold text-[#575C61] dark:text-zinc-400">
            مشاهد السيناريو التفصيلية ({scenes.length} مشاهد)
          </span>

          <div className="space-y-3.5">
            {scenes.map((scene, idx) => {
              const action = formatActionType(scene.actionType || scene.action_type);
              const ActionIcon = action.icon;
              const dur = Number(scene.durationSec || scene.duration_sec) || 5;

              return (
                <div
                  key={scene.order || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-[#F8F9FB] dark:bg-[#131316] border border-[#E4E7EC] dark:border-zinc-800/90 space-y-3.5 shadow-xs hover:border-purple-300 dark:hover:border-zinc-700 transition-colors"
                >
                  {/* Scene Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-black text-xs tabular-nums shadow-xs">
                        مشهد {scene.order || idx + 1}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-bold ${action.bg} ${action.border} ${action.text}`}>
                        <ActionIcon className="w-3 h-3" />
                        <span>{action.label}</span>
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#575C61] dark:text-zinc-400 tabular-nums">
                      ⏱ {dur} ثواني
                    </span>
                  </div>

                  {/* Scene Visual Direction */}
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#575C61] dark:text-zinc-400">
                      <Film className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span>التوجيه البصري وزاوية التصوير (Visual Direction):</span>
                    </span>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={scene.visualDirection || scene.visual_direction || ""}
                        onChange={(e) =>
                          handleSceneChange(idx, "visualDirection", e.target.value)
                        }
                        className="w-full p-2 text-xs rounded-lg border border-purple-400 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-100"
                        placeholder="أدخل التوجيه البصري للمشهد..."
                      />
                    ) : (
                      <p className="text-[#575C61] dark:text-zinc-300 text-xs sm:text-sm leading-relaxed pr-4">
                        {scene.visualDirection || scene.visual_direction || "—"}
                      </p>
                    )}
                  </div>

                  {/* Two-column on-screen text & voiceover */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* On Screen Text */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#18181d] border border-[#E4E7EC] dark:border-zinc-800 space-y-1">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        <Type className="w-3 h-3" />
                        <span>نص مكتوب على الشاشة:</span>
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={scene.onScreenText || scene.on_screen_text || ""}
                          onChange={(e) =>
                            handleSceneChange(idx, "onScreenText", e.target.value)
                          }
                          className="w-full p-1.5 text-xs rounded border border-blue-400 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
                          placeholder="نص يظهر في المشهد..."
                        />
                      ) : (
                        <p className="text-[#1A1D1F] dark:text-zinc-100 text-xs font-semibold leading-relaxed">
                          {scene.onScreenText || scene.on_screen_text || "—"}
                        </p>
                      )}
                    </div>

                    {/* Voiceover Speech */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#18181d] border border-[#E4E7EC] dark:border-zinc-800 space-y-1">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        <Mic className="w-3 h-3" />
                        <span>التعليق الصوتي (Voiceover):</span>
                      </span>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={scene.voiceover || ""}
                          onChange={(e) =>
                            handleSceneChange(idx, "voiceover", e.target.value)
                          }
                          className="w-full p-1.5 text-xs rounded border border-purple-400 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
                          placeholder="نص الكلام المنطوق..."
                        />
                      ) : (
                        <p className="text-[#1A1D1F] dark:text-zinc-100 text-xs leading-relaxed italic">
                          "{scene.voiceover || "—"}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
