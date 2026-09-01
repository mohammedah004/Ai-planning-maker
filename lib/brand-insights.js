/**
 * lib/brand-insights.js
 * 100% Deterministic aggregation engine for brand historical patterns and memory insights.
 * Zero LLM cost, instantaneous client/server computation.
 */

const OBJECTIVE_LABELS = {
  brand_awareness: "زيادة الوعي بالعلامة التجارية",
  audience_engagement: "زيادة التفاعل وبناء المجتمع",
  lead_generation: "جلب عملاء محتملين",
  direct_sales: "زيادة المبيعات المباشرة",
  product_launch: "إطلاق منتج جديد",
  brand_building: "ترسيخ هوية البراند",
};

const FORMAT_LABELS = {
  reel: "ريلز (Reels)",
  carousel: "كاروسيل (Carousels)",
  static_post: "منشور ثابت (Static)",
  story: "ستوري (Stories)",
};

/**
 * Aggregates accumulated marketing intelligence across all plans generated for a brand.
 *
 * @param {Array} brandPlans - Array of marketing plan records for a brand
 * @param {Array} allItems - Array of content items across all plans (optional)
 * @returns {object} Aggregated brand memory and strategic intelligence summary
 */
export function aggregateBrandInsights(brandPlans = [], allItems = []) {
  const plansCount = brandPlans.length;

  if (plansCount === 0) {
    return {
      hasInsights: false,
      plansCount: 0,
      totalPostsCount: 0,
      dominantObjective: null,
      dominantFormat: null,
      avgConfidenceScore: null,
      summary: "لم يتم إنشاء خطط تسويقية لهذا البراند بعد. أنشئ خطتك الأولى لتبدأ الذاكرة التراكمية.",
      timeline: [],
    };
  }

  const totalPostsCount = allItems.length > 0 ? allItems.length : plansCount * 30;

  // 1. Objectives Frequency
  const objectiveFreq = {};
  brandPlans.forEach((p) => {
    const obj = p.marketing_objective || "brand_awareness";
    objectiveFreq[obj] = (objectiveFreq[obj] || 0) + 1;
  });

  const sortedObjectives = Object.entries(objectiveFreq).sort((a, b) => b[1] - a[1]);
  const dominantObjectiveKey = sortedObjectives[0]?.[0] || "brand_awareness";
  const dominantObjectiveLabel = OBJECTIVE_LABELS[dominantObjectiveKey] || dominantObjectiveKey;

  // 2. Format Distribution Across All Plans
  const formatCounts = { reel: 0, carousel: 0, static_post: 0, story: 0 };
  if (allItems.length > 0) {
    allItems.forEach((item) => {
      const f = (item.post_type || item.postType || "static_post").toLowerCase();
      if (formatCounts[f] !== undefined) formatCounts[f]++;
      else formatCounts.static_post++;
    });
  } else {
    // Default estimated balance if items array isn't fully loaded
    formatCounts.reel = Math.round(totalPostsCount * 0.35);
    formatCounts.carousel = Math.round(totalPostsCount * 0.30);
    formatCounts.static_post = Math.round(totalPostsCount * 0.25);
    formatCounts.story = Math.round(totalPostsCount * 0.10);
  }

  const sortedFormats = Object.entries(formatCounts).sort((a, b) => b[1] - a[1]);
  const dominantFormatKey = sortedFormats[0]?.[0] || "reel";
  const dominantFormatLabel = FORMAT_LABELS[dominantFormatKey] || dominantFormatKey;

  // 3. Strategic Milestones Timeline
  const timeline = brandPlans
    .map((p, idx) => {
      const createdAt = p.created_at || p.createdAt;
      const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })
        : `الخطة #${idx + 1}`;

      const objLabel = OBJECTIVE_LABELS[p.marketing_objective] || p.marketing_objective || "خطة تسويقية";

      return {
        planId: p.id,
        title: `الخطة #${plansCount - idx}: ${p.product_name || "خطة تسويقية"}`,
        objective: objLabel,
        rawObjective: p.marketing_objective,
        date: formattedDate,
        status: p.status,
        hasStrategy: Boolean(p.strategy),
      };
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // 4. Executive Brand Memory Summary
  let summary = "";
  if (plansCount === 1) {
    summary = `يمتلك البراند خطة تسويقية واحدة بإجمالي 30 منشوراً. الهدف المعتمد هو "${dominantObjectiveLabel}". سيتم تفعيل مقارنة التطور التراكمي بمجرد إنشاء الخطة الثانية.`;
  } else {
    summary = `يمتلك البراند سجل ذاكرة تراكمي يشمل ${plansCount} خطط تسويقية بإجمالي ${totalPostsCount} منشوراً. التوجه الأكثر استخداماً هو "${dominantObjectiveLabel}"، والقالب البصري الأكثر اعتماداً هو ${dominantFormatLabel}.`;
  }

  return {
    hasInsights: true,
    plansCount,
    totalPostsCount,
    dominantObjective: {
      key: dominantObjectiveKey,
      label: dominantObjectiveLabel,
      count: sortedObjectives[0]?.[1] || 1,
    },
    dominantFormat: {
      key: dominantFormatKey,
      label: dominantFormatLabel,
      percentage: Math.round((formatCounts[dominantFormatKey] / (totalPostsCount || 1)) * 100),
    },
    formatBreakdown: Object.keys(FORMAT_LABELS).map((k) => ({
      key: k,
      label: FORMAT_LABELS[k],
      count: formatCounts[k] || 0,
      percentage: Math.round(((formatCounts[k] || 0) / (totalPostsCount || 1)) * 100),
    })),
    summary,
    timeline,
  };
}
