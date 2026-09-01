/**
 * lib/strategic-warnings.js
 * 100% Deterministic rule engine for detecting strategic risks, imbalances, and opportunities in marketing plans.
 * Zero LLM cost, instantaneous client/server computation.
 */

/**
 * Evaluates a marketing plan and its 30-day content items against strategic marketing best practices.
 *
 * @param {object} plan - Marketing plan record
 * @param {Array} contentItems - Array of 30 content items
 * @returns {Array<{ id: string, severity: 'critical'|'warning'|'info', title: string, description: string, recommendation: string, tag: string }>}
 */
export function detectStrategicWarnings(plan = {}, contentItems = []) {
  const warnings = [];
  const total = contentItems.length || 30;
  const rawObjective = (plan?.marketing_objective || "").toLowerCase();

  // Aggregate distribution
  const formatCounts = { reel: 0, carousel: 0, static_post: 0, story: 0 };
  const objectiveCounts = {};
  const pillarCounts = {};

  contentItems.forEach((item) => {
    const postType = (item.post_type || item.postType || "static_post").toLowerCase();
    formatCounts[postType] = (formatCounts[postType] || 0) + 1;

    const obj = (item.content_objective || item.contentObjective || "awareness").toLowerCase();
    objectiveCounts[obj] = (objectiveCounts[obj] || 0) + 1;

    const pillar = item.content_pillar || item.contentPillar || "عام";
    pillarCounts[pillar] = (pillarCounts[pillar] || 0) + 1;
  });

  const conversionCount = objectiveCounts.conversion || 0;
  const reelCount = formatCounts.reel || 0;
  const storyCount = formatCounts.story || 0;
  const reelPercentage = Math.round((reelCount / total) * 100);
  const conversionPercentage = Math.round((conversionCount / total) * 100);

  // 1. Missing Website / Landing Page URL
  if (!plan?.website_url || plan.website_url.trim().length < 4) {
    warnings.push({
      id: "missing_website_url",
      severity: "warning",
      tag: "روابط التحويل (CTAs)",
      title: "لم يتم توفير رابط الموقع أو المتجر",
      description: "تحتوي الخطة على دعوات للشراء والتسجيل، لكن غياب رابط الموقع يمنع توجيه الجمهور المباشر لصفحة الهبوط.",
      recommendation: "أضف رابط المتجر أو رابط البايو في تفاصيل البراند لتمكين توجيهات الشراء المباشرة داخل الكابشن.",
    });
  }

  // 2. Direct Sales Objective Mismatch (Low Conversion Content)
  if ((rawObjective === "direct_sales" || rawObjective === "product_launch") && conversionPercentage < 15) {
    warnings.push({
      id: "low_conversion_for_sales",
      severity: "critical",
      tag: "توازن الأهداف",
      title: "نسبة محتوى المبيعات المباشرة منخفضة مقارنة بهدفك",
      description: `هدفك هو "${rawObjective === "direct_sales" ? "زيادة المبيعات المباشرة" : "إطلاق منتج"}"، لكن نسبة محتوى التحويل تمثل فقط ${conversionPercentage}% (${conversionCount} منشورات من 30).`,
      recommendation: "استخدم ميزة 'تعديل بـ AI' على بعض المنشورات في الأسابيع 3 و 4 لتحويل أهدافها إلى 'تحويل ومبيعات مباشرة'.",
    });
  }

  // 3. Brand Awareness with Aggressive Selling (>25%)
  if (rawObjective === "brand_awareness" && conversionPercentage >= 25) {
    warnings.push({
      id: "high_selling_in_awareness",
      severity: "info",
      tag: "سلوك الجمهور",
      title: "كثافة بيعية مرتفعة لحملة توعية بالبراند",
      description: `تم تخصيص ${conversionPercentage}% (${conversionCount} منشورات) للبيع المباشر، بينما هدفك الأساسي هو بناء الوعي والوصول لجمهور بارد.`,
      recommendation: "الجمهور الجديد يفضل المحتوى التعليمي والملهم أولاً. تأكد من أن عروض البيع لا تطغى على منشورات بناء القيمة في بداية الشهر.",
    });
  }

  // 4. Low Video / Reel Ratio (< 20%)
  if (reelPercentage < 20) {
    warnings.push({
      id: "low_reel_ratio",
      severity: "warning",
      tag: "الخوارزمية والانتشار",
      title: "نسبة الريلز منخفضة بالنسبة لمعايير النمو الحالية",
      description: `الريلز تمثل ${reelPercentage}% فقط من الخطة (${reelCount} منشورات). خوارزمية إنستقرام تمنح 70%+ من الوصول لغير المتابعين عبر الريلز.`,
      recommendation: "ينصح بزيادة نسبة الريلز إلى 30%-40% على الأقل لضمان تدفق مستمر لمتابعين مهتمين جدد إلى حسابك.",
    });
  }

  // 5. Zero Stories in Content Calendar
  if (storyCount === 0) {
    warnings.push({
      id: "zero_stories",
      severity: "info",
      tag: "التفاعل اليومي",
      title: "الخطة خالية من قوالب الستوري اليومي",
      description: "الستوري التفاعلي هو أفضل أداة لبناء الثقة اليومية وفتح محادثات خاصة (DMs) مع العملاء الأكثر اهتماماً.",
      recommendation: "احرص على إعادة نشر وتفكيك المنشورات الرئيسية يومياً عبر الستوري مع وضع ملصقات الاستفتاء والأسئلة لزيادة التفاعل.",
    });
  }

  // 6. Pillar Over-Concentration (> 45% on a single pillar)
  for (const [pillarName, count] of Object.entries(pillarCounts)) {
    const pillarPct = Math.round((count / total) * 100);
    if (pillarPct > 45 && Object.keys(pillarCounts).length > 1) {
      warnings.push({
        id: `pillar_concentration_${pillarName}`,
        severity: "warning",
        tag: "تنويع المحتوى",
        title: `المحور "${pillarName}" يستحوذ على نسبة مهيمنة (${pillarPct}%)`,
        description: `أكثر من 45% من الخطة تتركز في محور واحد (${count} منشورات)، مما قد يسبب تكراراً في الرسائل التسويقية.`,
        recommendation: "وزع بعض الأفكار على محاور الإثبات الاجتماعي أو تفنيد الاعتراضات لتقديم قيمة متوازنة ومتباينة للمتابع.",
      });
      break;
    }
  }

  // 7. Vague or Short Audience Description (< 50 chars)
  const audienceLength = (plan?.target_audience || "").trim().length;
  if (audienceLength > 0 && audienceLength < 50) {
    warnings.push({
      id: "short_audience_description",
      severity: "info",
      tag: "دقة الاستهداف",
      title: "وصف الجمهور المستهدف مقتضب نسبياً",
      description: "كلما كان وصف العميل المثالي مفصلاً (اهتماماته، مخاوفه، لغته)، كانت الخطافات (Hooks) أكثر جاذبية وتحقيقاً للنتائج.",
      recommendation: "في خطتك القادمة، أضف تفاصيل إضافية عن الفئة العمرية والتحديات اليومية لجمهورك في ملف البراند.",
    });
  }

  return warnings;
}
