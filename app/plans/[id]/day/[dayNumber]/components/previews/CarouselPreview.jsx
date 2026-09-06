"use client";

import { useState, useRef } from "react";
import {
  Layers,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Palette,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";

export default function CarouselPreview({
  item,
  isEditing = false,
  editState = {},
  onFieldChange = null,
  className = "",
}) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSlideIndex, setCopiedSlideIndex] = useState(null);
  const sliderRef = useRef(null);

  const designCopy = isEditing
    ? editState.design_copy || {}
    : item.designCopy || item.design_copy || {};

  const slides = Array.isArray(designCopy.slides) && designCopy.slides.length > 0
    ? designCopy.slides
    : [
        {
          order: 1,
          headline: designCopy.headline || "عنوان الكاروسيل",
          subtext: designCopy.subtext || "محتوى الشريحة الأولى",
          visualNote: "تصميم الغلاف",
          slideCta: "اسحب للمزيد ←",
        },
      ];

  const totalSlides = slides.length;

  const scrollToSlide = (index) => {
    if (!sliderRef.current) return;
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    const slideElements = sliderRef.current.querySelectorAll(".carousel-slide-item");
    if (slideElements[clamped]) {
      slideElements[clamped].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveSlideIndex(clamped);
    }
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const slideElements = sliderRef.current.querySelectorAll(".carousel-slide-item");
    if (slideElements.length === 0) return;

    // Find slide closest to the center
    const containerCenter =
      sliderRef.current.getBoundingClientRect().left +
      sliderRef.current.offsetWidth / 2;

    let closestIdx = 0;
    let minDistance = Infinity;

    slideElements.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const dist = Math.abs(containerCenter - slideCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setActiveSlideIndex(closestIdx);
  };

  const handleCopySingleSlide = (slide, index) => {
    const text = [
      `[شريحة ${slide.order || index + 1}]`,
      slide.headline ? `العنوان: ${slide.headline}` : "",
      slide.subtext ? `النص: ${slide.subtext}` : "",
      slide.slideCta ? `الإجراء: ${slide.slideCta}` : "",
      slide.visualNote ? `توجيه بصري: ${slide.visualNote}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopiedSlideIndex(index);
    setTimeout(() => setCopiedSlideIndex(null), 2000);
  };

  const handleCopyAllSlides = () => {
    const text = slides
      .map((s, idx) => {
        return [
          `--- الشريحة ${s.order || idx + 1} من ${totalSlides} ---`,
          s.headline ? `العنوان: ${s.headline}` : "",
          s.subtext ? `النص: ${s.subtext}` : "",
          s.slideCta ? `الإجراء: ${s.slideCta}` : "",
          s.visualNote ? `توجيه بصري: ${s.visualNote}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSlideChange = (slideIndex, field, value) => {
    if (!onFieldChange) return;
    const updatedSlides = slides.map((s, idx) => {
      if (idx === slideIndex) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onFieldChange("design_copy", {
      ...designCopy,
      slides: updatedSlides,
    });
  };

  return (
    <div className={`space-y-6 text-right ${className}`}>
      {/* 1. Carousel Slider Card */}
      <Card padding="lg" className="space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-zinc-800/80">
          <div className="flex items-center gap-2 font-extrabold text-sm text-[#1A1D1F] dark:text-zinc-100">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>معاينة شرائح الكاروسيل ({totalSlides} شرائح)</span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant={copiedAll ? "emerald" : "secondary"}
                size="sm"
                onClick={handleCopyAllSlides}
                startIcon={copiedAll ? Check : Copy}
              >
                {copiedAll ? "تم نسخ جميع الشرائح!" : "نسخ كل الشرائح"}
              </Button>
            )}

            {/* Navigation Arrows for RTL */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollToSlide(activeSlideIndex - 1)}
                disabled={activeSlideIndex === 0}
                title="الشريحة السابقة"
                className="p-1.5 rounded-lg border border-[#E4E7EC] dark:border-zinc-800 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#575C61] dark:text-zinc-400 px-1 tabular-nums">
                {activeSlideIndex + 1} / {totalSlides}
              </span>
              <button
                type="button"
                onClick={() => scrollToSlide(activeSlideIndex + 1)}
                disabled={activeSlideIndex === totalSlides - 1}
                title="الشريحة التالية"
                className="p-1.5 rounded-lg border border-[#E4E7EC] dark:border-zinc-800 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll-Snap Slider Track */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {slides.map((slide, idx) => {
            const isCover = idx === 0;
            const isLast = idx === totalSlides - 1;
            const isActive = idx === activeSlideIndex;

            return (
              <div
                key={slide.order || idx}
                className={`carousel-slide-item shrink-0 w-[280px] sm:w-[320px] md:w-[350px] snap-center rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 space-y-4 shadow-xs ${
                  isActive
                    ? "border-blue-500 ring-2 ring-blue-500/20 bg-gradient-to-b from-white to-blue-50/20 dark:from-[#131316] dark:to-blue-950/10"
                    : "border-[#E4E7EC] dark:border-zinc-800 bg-white dark:bg-[#131316] opacity-90 hover:opacity-100"
                }`}
              >
                {/* Slide Top Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-black tabular-nums shadow-xs ${
                        isCover
                          ? "bg-blue-600 text-white"
                          : isLast
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                      }`}
                    >
                      {isCover ? "الغلاف (1)" : isLast ? `خاتمة (${idx + 1})` : `شريحة ${idx + 1}`}
                    </span>
                    {isCover && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        <Sparkles className="w-3 h-3" />
                        <span>Hook</span>
                      </span>
                    )}
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleCopySingleSlide(slide, idx)}
                      title="نسخ نص هذه الشريحة"
                      className="p-1 rounded-md text-[#575C61] hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {copiedSlideIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Slide Content */}
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-[#575C61] dark:text-zinc-400 uppercase tracking-wider">
                      عنوان الشريحة
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={slide.headline || ""}
                        onChange={(e) => handleSlideChange(idx, "headline", e.target.value)}
                        className="w-full p-2 text-xs font-bold rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-100"
                        placeholder="أدخل عنوان الشريحة..."
                      />
                    ) : (
                      <h4 className="font-extrabold text-[#1A1D1F] dark:text-zinc-100 text-sm sm:text-base leading-snug">
                        {slide.headline || "—"}
                      </h4>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-[#575C61] dark:text-zinc-400 uppercase tracking-wider">
                      محتوى الشريحة
                    </span>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={slide.subtext || ""}
                        onChange={(e) => handleSlideChange(idx, "subtext", e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-100 leading-relaxed"
                        placeholder="أدخل نص الشريحة..."
                      />
                    ) : (
                      <p className="text-[#575C61] dark:text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {slide.subtext || "—"}
                      </p>
                    )}
                  </div>

                  {(slide.visualNote || isEditing) && (
                    <div className="p-2.5 rounded-xl bg-[#F8F9FB] dark:bg-[#18181d] border border-dashed border-[#E4E7EC] dark:border-zinc-800 text-[11px] text-[#575C61] dark:text-zinc-400 space-y-1">
                      <span className="block font-bold text-purple-600 dark:text-purple-400">
                        🎨 التوجيه البصري للشريحة:
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={slide.visualNote || ""}
                          onChange={(e) => handleSlideChange(idx, "visualNote", e.target.value)}
                          className="w-full p-1 text-[11px] rounded border border-purple-400 bg-white dark:bg-[#131316] text-[#1A1D1F] dark:text-zinc-100"
                          placeholder="مخطط بصري / رسم توضيحي..."
                        />
                      ) : (
                        <p className="leading-normal">{slide.visualNote || "—"}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Slide Bottom Action / CTA */}
                <div className="pt-2 border-t border-[#E4E7EC] dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-[#575C61] dark:text-zinc-400">
                    زر الشريحة:
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={slide.slideCta || ""}
                      onChange={(e) => handleSlideChange(idx, "slideCta", e.target.value)}
                      className="p-1 px-2 text-[11px] rounded border border-blue-400 bg-white dark:bg-[#18181d] text-[#1A1D1F] dark:text-zinc-100"
                      placeholder="اسحب للمزيد ←"
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 text-xs">
                      <span>{slide.slideCta || (isLast ? "احفظ المنشور" : "اسحب للمزيد")}</span>
                      {!isLast && <ArrowRight className="w-3 h-3 rotate-180" />}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots Pagination */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToSlide(idx)}
              title={`شريحة ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeSlideIndex === idx
                  ? "w-6 bg-blue-600 dark:bg-blue-400"
                  : "w-2 bg-[#E4E7EC] dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600"
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
