/**
 * lib/strategic-rationale.js
 * 100% Deterministic engine for strategic marketing rationale and confidence scoring.
 * Zero LLM cost, instantaneous client/server computation.
 */

const OBJECTIVE_LABELS = {
  brand_awareness: "زيادة الوعي بالعلامة التجارية",
  audience_engagement: "زيادة التفاعل وبناء المجتمع",
  lead_generation: "جلب عملاء محتملين مهتمين",
  direct_sales: "زيادة المبيعات المباشرة",
  product_launch: "إطلاق منتج جديد في السوق",
  brand_building: "بناء وترسيخ هوية ومكانة البراند",
  awareness: "توعية وجذب",
  education: "تعليم وقيمة",
  engagement: "تفاعل ومجتمع",
  trust: "بناء ثقة ومصداقية",
  social_proof: "إثبات اجتماعي",
  objection_handling: "تفنيد الاعتراضات",
  conversion: "تحويل ومبيعات مباشرة",
};

const FORMAT_STRATEGY_ROLES = {
  reel: {
    label: "ريلز (Reels)",
    role: "محرك الانتشار الأساسي (Top of Funnel)",
    why: "خوارزمية إنستقرام تمنح الريلز أولوية كبرى في صفحة Explore ولغير المتابعين، مما يضمن تدفق جمهور جديد ومستمر للحساب.",
  },
  carousel: {
    label: "منشورات دوارة (Carousels)",
    role: "هندسة الحفظ والمشاركة وبناء القيمة (Value & Save Rate)",
    why: "المنشورات الدوارة تحقق أعلى معدل حفظ (Saves) وتجعل المتابع يقضي وقتاً أطول على المنشور، مما يرفع تقييم الحساب لدى الخوارزمية.",
  },
  static_post: {
    label: "منشورات فردية (Static Posts)",
    role: "ترسيخ الهوية البصرية والعروض المباشرة (Identity & Direct Offers)",
    why: "ممتازة للاقتباسات الملهمة، الإعلانات المباشرة، وتثبيت هوية البراند البصرية داخل شبكة الحساب (Grid).",
  },
  story: {
    label: "ستوري تفاعلي (Stories)",
    role: "التواصل اليومي المباشر وإثارة العجلة (Daily Nurturing & Urgency)",
    why: "الستوري يبني علاقة وثيقة وشخصية مع المتابعين الحاليين ويوفر أفضل بيئة للمحادثات المباشرة (DMs) والروابط السريعة.",
  },
};

/**
 * Computes strategic rationale explaining the "why" behind objective distributions and format choices.
 *
 * @param {object} plan - Marketing plan record
 * @param {Array} contentItems - Array of 30 content items
 * @returns {object} Strategic rationale analysis
 */
export function computeStrategicRationale(plan = {}, contentItems = []) {
  const total = contentItems.length || 30;
  const rawObjective = plan?.marketing_objective || "brand_awareness";

  // 1. Calculate Format Distribution
  const formatCounts = { reel: 0, carousel: 0, static_post: 0, story: 0 };
  const objectiveCounts = {};

  contentItems.forEach((item) => {
    const postType = (item.post_type || item.postType || "static_post").toLowerCase();
    if (formatCounts[postType] !== undefined) {
      formatCounts[postType]++;
    } else {
      formatCounts.static_post++;
    }

    const obj = (item.content_objective || item.contentObjective || "awareness").toLowerCase();
    objectiveCounts[obj] = (objectiveCounts[obj] || 0) + 1;
  });

  // 2. Format Rationales
  const formatRationales = Object.keys(FORMAT_STRATEGY_ROLES).map((key) => {
    const count = formatCounts[key] || 0;
    const percentage = Math.round((count / total) * 100);
    const meta = FORMAT_STRATEGY_ROLES[key];

    let strategicContext = meta.why;
    if (key === "reel" && percentage >= 30) {
      strategicContext += ` تم تخصيص ${percentage}% ريلز لضمان تحقيق انتشار سريع والوصول لأكبر شريحة مهتمة.`;
    } else if (key === "carousel" && percentage >= 25) {
      strategicContext += ` نسبة ${percentage}% مخصصة للمحتوى التعليمي والتفكيكي لتعزيز الثقة وجعل المنشورات مرجعاً يُحفظ.`;
    }

    return {
      format: key,
      label: meta.label,
      role: meta.role,
      count,
      percentage,
      statement: strategicContext,
    };
  });

  // 3. Objective Rationales
  const objectiveRationales = Object.keys(objectiveCounts).map((key) => {
    const count = objectiveCounts[key];
    const percentage = Math.round((count / total) * 100);
    const label = OBJECTIVE_LABELS[key] || key;

    let statement = `تم تخصيص ${count} منشورات (${percentage}%) لخدمة هدف "${label}".`;
    if (key === "conversion") {
      statement += " هذه المنشورات تركز على النداء المباشر للشراء وتحويل المهتمين إلى عملاء فعليين.";
    } else if (key === "education") {
      statement += " تبني سلطة معرفية في مجالك وتجيب على تساؤلات الجمهور دون بيع مباشر.";
    } else if (key === "trust" || key === "social_proof") {
      statement += " تُزيل الشكوك وتعزز الطمأنينة الاجتماعية عبر عرض النتائج والضمانات.";
    } else if (key === "awareness") {
      statement += " مصممة لاصطياد انتباه الجمهور البارد من خلال خطافات قوية ولمس مشكلاتهم.";
    }

    return {
      objective: key,
      label,
      count,
      percentage,
      statement,
    };
  });

  // 4. Marketing Funnel Distribution (Top / Mid / Bottom)
  const topFunnelCount = (objectiveCounts.awareness || 0) + (objectiveCounts.education || 0);
  const midFunnelCount = (objectiveCounts.engagement || 0) + (objectiveCounts.trust || 0) + (objectiveCounts.social_proof || 0);
  const bottomFunnelCount = (objectiveCounts.objection_handling || 0) + (objectiveCounts.conversion || 0);

  const funnelRationales = [
    {
      stage: "top",
      label: "أعلى القمع التسويقي (Top of Funnel - جذب وتوعية)",
      count: topFunnelCount,
      percentage: Math.round((topFunnelCount / total) * 100),
      description: "منشورات الوعي والتعليم المصممة لجلب انتباه الجمهور الجديد الذي لا يعرف علامتك بعد.",
      color: "blue",
    },
    {
      stage: "mid",
      label: "وسط القمع التسويقي (Middle of Funnel - تفاعل وثقة)",
      count: midFunnelCount,
      percentage: Math.round((midFunnelCount / total) * 100),
      description: "منشورات بناء الثقة والإثبات الاجتماعي والتفاعل لتحويل المتابعين إلى مجتمع مهتم ومخلص.",
      color: "purple",
    },
    {
      stage: "bottom",
      label: "أسفل القمع التسويقي (Bottom of Funnel - إقناع ومبيعات)",
      count: bottomFunnelCount,
      percentage: Math.round((bottomFunnelCount / total) * 100),
      description: "منشورات تفنيد الاعتراضات والعروض المباشرة لدفع الجمهور المتفاعل نحو الشراء الفعلي.",
      color: "emerald",
    },
  ];

  // 5. Executive Strategic Summary
  const primaryObjectiveLabel = OBJECTIVE_LABELS[rawObjective] || rawObjective;
  const dominantFormat = formatRationales.reduce((max, cur) => (cur.count > max.count ? cur : max), formatRationales[0]);

  const executiveSummary = `تم تصميم هذه الخطة الاستراتيجية لتخدم بالدرجة الأولى هدف "${primaryObjectiveLabel}". يعتمد الهيكل على محرك قمع تسويقي متكامل (Full-Funnel Engine) يوازن بين جذب الجمهور الجديد بنسبة ${funnelRationales[0].percentage}% وتغذية العلاقة بنسبة ${funnelRationales[1].percentage}% والتحويل التجاري بنسبة ${funnelRationales[2].percentage}%. يعتمد التوزيع البصري على ${dominantFormat.label} كقالب قيادي لتعظيم العائد من كل منشور.`;

  return {
    primaryObjectiveLabel,
    formatRationales,
    objectiveRationales,
    funnelRationales,
    executiveSummary,
  };
}

/**
 * Computes a deterministic Strategy Confidence Score (1-10) based on context richness and plan readiness.
 *
 * @param {object} plan - Marketing plan record
 * @param {object|null} brandProfile - Linked brand profile if available
 * @returns {object} { score, grade, color, breakdown }
 */
export function computeStrategyConfidenceScore(plan = {}, brandProfile = null) {
  const breakdown = [];
  let totalPoints = 0;
  const maxPossible = 10;

  // 1. Product Description Richness (max 2 pts)
  const descLen = (plan?.product_description || "").trim().length;
  if (descLen >= 150) {
    breakdown.push({ label: "عمق وصف المنتج والمميزات", points: 2, maxPoints: 2, met: true, tip: "ممتاز! الوصف غني بالمعلومات." });
    totalPoints += 2;
  } else if (descLen >= 50) {
    breakdown.push({ label: "عمق وصف المنتج والمميزات", points: 1, maxPoints: 2, met: true, tip: "جيد، ولكن إضافة تفاصيل إضافية عن المنتج تعزز جودة الخطة." });
    totalPoints += 1;
  } else {
    breakdown.push({ label: "عمق وصف المنتج والمميزات", points: 0.5, maxPoints: 2, met: false, tip: "الوصف مقتضب جداً، يفضل إثراؤه بتفاصيل أكثر." });
    totalPoints += 0.5;
  }

  // 2. Target Audience Precision (max 2 pts)
  const audLen = (plan?.target_audience || "").trim().length;
  if (audLen >= 100) {
    breakdown.push({ label: "تحديد الجمهور المستهدف واهتماماته", points: 2, maxPoints: 2, met: true, tip: "تحديد دقيق ومفصل للجمهور." });
    totalPoints += 2;
  } else if (audLen >= 40) {
    breakdown.push({ label: "تحديد الجمهور المستهدف واهتماماته", points: 1, maxPoints: 2, met: true, tip: "جيد، تحديد الفئة العمرية والسلوكيات يرفع الدقة." });
    totalPoints += 1;
  } else {
    breakdown.push({ label: "تحديد الجمهور المستهدف واهتماماته", points: 0.5, maxPoints: 2, met: false, tip: "الجمهور غير مفصل بما يكفي لاستهداف دقيق." });
    totalPoints += 0.5;
  }

  // 3. Problem Solved & Value Proposition (max 2 pts)
  const probLen = (plan?.problem_solved || "").trim().length;
  if (probLen >= 80) {
    breakdown.push({ label: "وضوح المشكلة المحلولة والقيمة المقدمة", points: 2, maxPoints: 2, met: true, tip: "المشكلة واضحة وتمنح زوايا خطاب قوية." });
    totalPoints += 2;
  } else if (probLen >= 30) {
    breakdown.push({ label: "وضوح المشكلة المحلولة والقيمة المقدمة", points: 1, maxPoints: 2, met: true, tip: "واضحة بشكل عام." });
    totalPoints += 1;
  } else {
    breakdown.push({ label: "وضوح المشكلة المحلولة والقيمة المقدمة", points: 0.5, maxPoints: 2, met: false, tip: "تحديد نقاط الألم بدقة يزيد من قوة الكابشنات." });
    totalPoints += 0.5;
  }

  // 4. Brand Tone Depth (max 1.5 pts)
  const tones = Array.isArray(plan?.brand_tone) ? plan.brand_tone : [];
  if (tones.length >= 3) {
    breakdown.push({ label: "تنوع نبرة وهوية البراند", points: 1.5, maxPoints: 1.5, met: true, tip: "تم تحديد 3 نبرات متكاملة." });
    totalPoints += 1.5;
  } else if (tones.length >= 2) {
    breakdown.push({ label: "تنوع نبرة وهوية البراند", points: 1, maxPoints: 1.5, met: true, tip: "جيد، اختيار 3 نبرات يمنح صوتاً أكثر تفرداً." });
    totalPoints += 1;
  } else if (tones.length === 1) {
    breakdown.push({ label: "تنوع نبرة وهوية البراند", points: 0.5, maxPoints: 1.5, met: true, tip: "نبرة واحدة محددة فقط." });
    totalPoints += 0.5;
  } else {
    breakdown.push({ label: "تنوع نبرة وهوية البراند", points: 0, maxPoints: 1.5, met: false, tip: "لم يتم اختيار نبرات للبراند." });
  }

  // 5. Website / Landing Page URL (max 1 pt)
  if (plan?.website_url && plan.website_url.trim().length > 5) {
    breakdown.push({ label: "وجود رابط الموقع لربط الدعوات (CTAs)", points: 1, maxPoints: 1, met: true, tip: "الرابط متوفر لخدمة التحويلات والمبيعات." });
    totalPoints += 1;
  } else {
    breakdown.push({ label: "وجود رابط الموقع لربط الدعوات (CTAs)", points: 0, maxPoints: 1, met: false, tip: "إضافة رابط المتجر/الموقع يفعل روابط البيع المباشر." });
  }

  // 6. Additional Context / Offers (max 1 pt)
  if (plan?.additional_context && plan.additional_context.trim().length >= 20) {
    breakdown.push({ label: "سياق إضافي وعروض خاصة", points: 1, maxPoints: 1, met: true, tip: "تم توفير سياق إضافي ساعد الذكاء الاصطناعي على التخصيص." });
    totalPoints += 1;
  } else {
    breakdown.push({ label: "سياق إضافي وعروض خاصة", points: 0.5, maxPoints: 1, met: false, tip: "إضافة معلومات عن العروض الحالية ترفع دقة المحتوى." });
    totalPoints += 0.5;
  }

  // 7. Brand Memory Attachment (max 0.5 pt)
  if (plan?.brand_profile_id || brandProfile) {
    breakdown.push({ label: "الربط مع ذاكرة البراند الذكية", points: 0.5, maxPoints: 0.5, met: true, tip: "الخطة تستند إلى ملف براند محفوظ." });
    totalPoints += 0.5;
  } else {
    breakdown.push({ label: "الربط مع ذاكرة البراند الذكية", points: 0, maxPoints: 0.5, met: false, tip: "حفظ البراند في 'ملفات البراند' يسهل تكرار وتطوير الخطط." });
  }

  const rawScore = Math.min(10, Math.max(1, Math.round(totalPoints * 10) / 10));
  const score = Math.round(rawScore);

  let grade = "استراتيجية متوسطة";
  let color = "amber";

  if (score >= 9) {
    grade = "استراتيجية ممتازة ومكتملة المعالم";
    color = "emerald";
  } else if (score >= 7) {
    grade = "استراتيجية قوية وذات جاهزية عالية";
    color = "blue";
  } else if (score >= 5) {
    grade = "استراتيجية مقبولة - ينصح بإثراء التفاصيل";
    color = "amber";
  } else {
    grade = "استراتيجية أولية - تحتاج مزيداً من المدخلات";
    color = "rose";
  }

  return {
    score,
    rawScore,
    grade,
    color,
    breakdown,
  };
}
