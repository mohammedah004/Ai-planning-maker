/**
 * lib/plan-comparison.js
 * 100% Deterministic comparison engine between two marketing plans for the same brand.
 * Zero LLM cost, instantaneous client/server computation.
 */

const OBJECTIVE_LABELS = {
  brand_awareness: "زيادة الوعي بالعلامة التجارية",
  audience_engagement: "زيادة التفاعل وبناء المجتمع",
  lead_generation: "جلب عملاء محتملين",
  direct_sales: "زيادة المبيعات المباشرة",
  product_launch: "إطلاق منتج جديد",
  brand_building: "ترسيخ هوية البراند",
  awareness: "توعية",
  education: "تعليم",
  engagement: "تفاعل",
  trust: "ثقة",
  social_proof: "إثبات اجتماعي",
  objection_handling: "تفنيد اعتراضات",
  conversion: "تحويل ومبيعات",
};

const FORMAT_LABELS = {
  reel: "ريلز (Reels)",
  carousel: "كاروسيل (Carousels)",
  static_post: "منشور ثابت (Static)",
  story: "ستوري (Stories)",
};

function safeJson(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * Compares two marketing plans and their 30-day items for the same brand.
 *
 * @param {object} currentPlan - Current plan object
 * @param {object|null} previousPlan - Preceding plan object
 * @param {Array} currentItems - Current plan content items
 * @param {Array} previousItems - Preceding plan content items
 * @returns {object} Structured comparative intelligence report
 */
export function comparePlans(currentPlan = {}, previousPlan = null, currentItems = [], previousItems = []) {
  if (!previousPlan) {
    return {
      hasComparison: false,
      summary: "هذه أول خطة استراتيجية مسجلة لهذا البراند. ستبدأ المقارنة التراكمية وتتبع التطور من الخطة القادمة.",
      shifts: [],
      metricsDelta: [],
      pillarsComparison: { added: [], retained: [], removed: [] },
    };
  }

  const shifts = [];
  const metricsDelta = [];

  // 1. Compare Primary Marketing Objective
  const curObj = currentPlan.marketing_objective || currentPlan.marketingObjective || "brand_awareness";
  const prevObj = previousPlan.marketing_objective || previousPlan.marketingObjective || "brand_awareness";

  if (curObj !== prevObj) {
    shifts.push({
      category: "objective",
      title: "تطور في الهدف الاستراتيجي الأساسي",
      detail: `انتقلت الخطة من هدف "${OBJECTIVE_LABELS[prevObj] || prevObj}" إلى "${OBJECTIVE_LABELS[curObj] || curObj}"، مما يعكس انتقال البراند لمرحلة تسويقية متقدمة.`,
      type: "positive",
    });
  }

  // 2. Format Distribution Comparison
  const curFormats = { reel: 0, carousel: 0, static_post: 0, story: 0 };
  const prevFormats = { reel: 0, carousel: 0, static_post: 0, story: 0 };

  const curTotal = currentItems.length || 30;
  const prevTotal = previousItems.length || 30;

  currentItems.forEach((item) => {
    const f = (item.post_type || item.postType || "static_post").toLowerCase();
    if (curFormats[f] !== undefined) curFormats[f]++;
    else curFormats.static_post++;
  });

  previousItems.forEach((item) => {
    const f = (item.post_type || item.postType || "static_post").toLowerCase();
    if (prevFormats[f] !== undefined) prevFormats[f]++;
    else prevFormats.static_post++;
  });

  Object.keys(FORMAT_LABELS).forEach((fmt) => {
    const curPct = Math.round((curFormats[fmt] / curTotal) * 100);
    const prevPct = Math.round((prevFormats[fmt] / prevTotal) * 100);
    const delta = curPct - prevPct;

    metricsDelta.push({
      label: FORMAT_LABELS[fmt],
      current: `${curPct}% (${curFormats[fmt]})`,
      previous: `${prevPct}% (${prevFormats[fmt]})`,
      delta: `${delta > 0 ? "+" : ""}${delta}%`,
      direction: delta > 0 ? "up" : delta < 0 ? "down" : "same",
      isPositive: (fmt === "reel" && delta > 0) || (fmt === "carousel" && delta > 0) || delta === 0,
    });

    if (Math.abs(delta) >= 10) {
      shifts.push({
        category: "format",
        title: delta > 0 ? `زيادة الاعتماد على ${FORMAT_LABELS[fmt]}` : `تقليل نسبة ${FORMAT_LABELS[fmt]}`,
        detail: `تغيرت نسبة ${FORMAT_LABELS[fmt]} من ${prevPct}% إلى ${curPct}% (${delta > 0 ? "+" : ""}${delta}%) لإعادة موازنة القنوات البصرية.`,
        type: delta > 0 ? "positive" : "neutral",
      });
    }
  });

  // 3. Content Pillars Comparison
  const curPillarsRaw = safeJson(currentPlan.content_pillars || currentPlan.pillars, []);
  const prevPillarsRaw = safeJson(previousPlan.content_pillars || previousPlan.pillars, []);

  const curPillarsList = Array.isArray(curPillarsRaw)
    ? curPillarsRaw.map((p) => (typeof p === "string" ? p : p.name || p.title || ""))
    : [];
  const prevPillarsList = Array.isArray(prevPillarsRaw)
    ? prevPillarsRaw.map((p) => (typeof p === "string" ? p : p.name || p.title || ""))
    : [];

  const addedPillars = curPillarsList.filter((p) => p && !prevPillarsList.includes(p));
  const retainedPillars = curPillarsList.filter((p) => p && prevPillarsList.includes(p));
  const removedPillars = prevPillarsList.filter((p) => p && !curPillarsList.includes(p));

  if (addedPillars.length > 0) {
    shifts.push({
      category: "pillar",
      title: `إضافة محاور محتوى جديدة (${addedPillars.length})`,
      detail: `تم إدخال محاور جديدة: "${addedPillars.join("، ")}" لتجديد الخطاب وتغطية جوانب لم يتم تناولها في الخطة السابقة.`,
      type: "positive",
    });
  }

  // 4. Strategic Maturity & Diagnosis Shifts
  const curDiag = safeJson(currentPlan.strategy?.diagnosis || currentPlan.strategy, {}).diagnosis || currentPlan.strategy?.diagnosis;
  const prevDiag = safeJson(previousPlan.strategy?.diagnosis || previousPlan.strategy, {}).diagnosis || previousPlan.strategy?.diagnosis;

  if (curDiag && prevDiag) {
    const curMaturity = curDiag.marketing_maturity;
    const prevMaturity = prevDiag.marketing_maturity;

    if (curMaturity && prevMaturity && curMaturity !== prevMaturity) {
      shifts.push({
        category: "strategy",
        title: "ترقية مرحلة نضج البراند",
        detail: `تم إعادة تشخيص البراند من "${prevMaturity}" إلى "${curMaturity}" مع تطور أهداف وثبات الخطة.`,
        type: "positive",
      });
    }
  }

  // 5. Synthesis Summary
  const prevDate = previousPlan.created_at || previousPlan.createdAt;
  const formattedPrevDate = prevDate
    ? new Date(prevDate).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })
    : "الخطة السابقة";

  const summary = `تعتمد هذه الخطة على ذاكرة الخطة السابقة المؤرخة في (${formattedPrevDate}). تتضمن ${shifts.length} تحولات استراتيجية ملحوظة، مع الحفاظ على ${retainedPillars.length} محاور أساسية وإدخال ${addedPillars.length} محاور متجددة لضمان عدم التكرار.`;

  return {
    hasComparison: true,
    previousPlanId: previousPlan.id,
    previousPlanDate: formattedPrevDate,
    shifts,
    metricsDelta,
    pillarsComparison: {
      added: addedPillars,
      retained: retainedPillars,
      removed: removedPillars,
    },
    summary,
  };
}
