/**
 * MADAR Content Preview Adapter
 * 
 * Enforces Rule 8:
 * Raw generation_source is inspected first. If 'structured', heuristic adapter
 * is completely bypassed. If legacy, fallback heuristic parsing applies.
 * Then mapContentItemToCamelCase() performs pure, deterministic transformation.
 */

function safeJsonParse(val: any, fallback: any = {}): any {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * Pure, deterministic transformation mapping DB snake_case to frontend camelCase.
 */
export function mapContentItemToCamelCase(item: any): any {
  if (!item) return item;

  const rawDesignCopy =
    typeof item.design_copy === "string"
      ? safeJsonParse(item.design_copy, {})
      : item.design_copy || item.designCopy || {};

  const mappedSlides = Array.isArray(rawDesignCopy.slides)
    ? rawDesignCopy.slides.map((s: any) => ({
        order: Number(s.order) || 1,
        headline: s.headline || "",
        subtext: s.subtext || "",
        visualNote: s.visual_note || s.visualNote || "",
        slideCta: s.slide_cta || s.slideCta || "",
      }))
    : undefined;

  const mappedScenes = Array.isArray(rawDesignCopy.scenes)
    ? rawDesignCopy.scenes.map((sc: any) => ({
        order: Number(sc.order) || 1,
        durationSec: Number(sc.duration_sec ?? sc.durationSec) || 5,
        actionType: sc.action_type || sc.actionType || "camera_speech",
        visualDirection: sc.visual_direction || sc.visualDirection || "",
        onScreenText: sc.on_screen_text || sc.onScreenText || "",
        voiceover: sc.voiceover || "",
      }))
    : undefined;

  const mappedDesignCopy: any = {
    headline: rawDesignCopy.headline || "",
    subtext: rawDesignCopy.subtext || "",
    cta: rawDesignCopy.cta || "",
    hookLine: rawDesignCopy.hook_line || rawDesignCopy.hookLine || "",
    totalDurationSec:
      rawDesignCopy.total_duration_sec !== undefined
        ? Number(rawDesignCopy.total_duration_sec)
        : rawDesignCopy.totalDurationSec !== undefined
        ? Number(rawDesignCopy.totalDurationSec)
        : undefined,
    generationSource:
      rawDesignCopy.generation_source || rawDesignCopy.generationSource || "legacy",
  };

  if (mappedSlides) mappedDesignCopy.slides = mappedSlides;
  if (mappedScenes) mappedDesignCopy.scenes = mappedScenes;

  return {
    id: item.id,
    dayNumber: Number(item.day_number ?? item.dayNumber ?? 1),
    caption: item.caption || "",
    postType: item.post_type || item.postType || "static_post",
    contentObjective: item.content_objective || item.contentObjective || "awareness",
    contentPillar: item.content_pillar || item.contentPillar || "عام",
    designReference: item.design_reference || item.designReference || "",
    cta: item.cta || "",
    revision: item.revision,
    updatedAt: item.updated_at || item.updatedAt,
    designCopy: mappedDesignCopy,
  };
}

/**
 * Heuristic fallback for legacy Carousel posts without structured slides.
 */
function extractFallbackCarouselSlides(rawItem: any, designCopy: any) {
  const headline = designCopy.headline || "عنوان الكاروسيل";
  const subtext = designCopy.subtext || "";
  const cta = designCopy.cta || rawItem.cta || "اسحب للمزيد";

  // Attempt to split caption by bullet points or numbering if present
  const caption = rawItem.caption || "";
  const lines = caption
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 5 && !l.startsWith("#"));

  if (lines.length >= 3) {
    return [
      {
        order: 1,
        headline,
        subtext: lines[0] || subtext,
        visualNote: "غلاف الكاروسيل الجذاب",
        slideCta: "اسحب للشريحة التالية ←",
      },
      ...lines.slice(1, Math.min(lines.length, 5)).map((line: string, idx: number) => ({
        order: idx + 2,
        headline: `نقطة ${idx + 1}`,
        subtext: line,
        visualNote: "رسم بياني أو توضيح بصري",
        slideCta: idx === lines.length - 2 ? cta : "اسحب للمزيد ←",
      })),
    ];
  }

  // Fallback to 3 synthesized slides from headline, subtext, and cta
  return [
    {
      order: 1,
      headline,
      subtext: subtext || "المشكلة والمدخل الأساسي للموضوع",
      visualNote: "تصميم الغلاف بخط عريض وبارز",
      slideCta: "اسحب لمعرفة التفاصيل ←",
    },
    {
      order: 2,
      headline: "الحل والخطوات العملية",
      subtext: rawItem.design_reference || "تفاصيل التطبيق والمميزات الأساسية للحل",
      visualNote: "مخطط توضيحي للمعلومة",
      slideCta: "اسحب للخطوة التالية ←",
    },
    {
      order: 3,
      headline: "الخلاصة والإجراء",
      subtext: cta ? `احصل على النتيجة: ${cta}` : "شارك المنشور واحفظه للرجوع إليه لاحقاً",
      visualNote: "شاشة الخاتمة مع شعار البراند",
      slideCta: cta || "احفظ المنشور الآن",
    },
  ];
}

/**
 * Heuristic fallback for legacy Reel posts without structured scenes.
 */
function extractFallbackReelScenes(rawItem: any, designCopy: any) {
  const hook = designCopy.headline || "الخطاف البصري لجذب الانتباه";
  const core = rawItem.design_reference || designCopy.subtext || "شرح الفكرة الأساسية وتقديم القيمة";
  const cta = rawItem.cta || designCopy.cta || "الدعوة للإجراء ومتابعة الحساب";

  return [
    {
      order: 1,
      durationSec: 5,
      actionType: "camera_speech",
      visualDirection: "لقطة قريبة للمتحدث مع نظرة مباشرة للكاميرا وحركة يد واثقة",
      onScreenText: hook,
      voiceover: hook,
    },
    {
      order: 2,
      durationSec: 15,
      actionType: "b_roll",
      visualDirection: "لقطات سريعة وعملية توضح المشكلة أو استخدام المنتج مع مؤثرات صوتية",
      onScreenText: "3 خطوات عملية لحل المشكلة",
      voiceover: core,
    },
    {
      order: 3,
      durationSec: 10,
      actionType: "on_screen_text",
      visualDirection: "شاشة ختامية واضحة مع إشارة بإصبع اليد نحو رابط البايو",
      onScreenText: cta,
      voiceover: `إذا كنت ترغب بالبدء، ${cta}`,
    },
  ];
}

/**
 * Normalizes any content item:
 * 1. If generation_source === 'structured', bypasses heuristic adapter directly.
 * 2. If legacy, applies deterministic heuristic fallbacks.
 * 3. Maps to standard camelCase schema.
 */
export function normalizeContentItem(rawItem: any): any {
  if (!rawItem) return null;

  const rawDesignCopy =
    typeof rawItem.design_copy === "string"
      ? safeJsonParse(rawItem.design_copy, {})
      : rawItem.design_copy || rawItem.designCopy || {};

  const generationSource =
    rawDesignCopy.generation_source || rawDesignCopy.generationSource;

  // 1. If explicitly marked as 'structured', bypass heuristics completely
  if (generationSource === "structured") {
    return mapContentItemToCamelCase(rawItem);
  }

  // 2. If already has real slides or scenes, treat as structured
  if (
    (Array.isArray(rawDesignCopy.slides) && rawDesignCopy.slides.length >= 2) ||
    (Array.isArray(rawDesignCopy.scenes) && rawDesignCopy.scenes.length >= 2)
  ) {
    return mapContentItemToCamelCase(rawItem);
  }

  // 3. Fallback Heuristic Adapter for Legacy Items
  const postType = rawItem.post_type || rawItem.postType;

  if (postType === "carousel") {
    const fallbackSlides = extractFallbackCarouselSlides(rawItem, rawDesignCopy);
    const enrichedRawItem = {
      ...rawItem,
      design_copy: {
        ...rawDesignCopy,
        slides: fallbackSlides,
        generation_source: "legacy",
      },
    };
    return mapContentItemToCamelCase(enrichedRawItem);
  }

  if (postType === "reel") {
    const fallbackScenes = extractFallbackReelScenes(rawItem, rawDesignCopy);
    const enrichedRawItem = {
      ...rawItem,
      design_copy: {
        ...rawDesignCopy,
        scenes: fallbackScenes,
        total_duration_sec: 30,
        generation_source: "legacy",
      },
    };
    return mapContentItemToCamelCase(enrichedRawItem);
  }

  // Static post or story
  return mapContentItemToCamelCase(rawItem);
}
